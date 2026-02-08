from fastapi import APIRouter, HTTPException
from database import db

router = APIRouter()


@router.post("/add")
async def add_article(data: dict):

    name = data.get("name")
    price = data.get("price")
    quantity = data.get("quantity")
    user = data.get("user", "amira")   # par défaut

    if not name:
        raise HTTPException(status_code=400, detail="name required")

    total = price * quantity

    # 1. Enregistrer dans shopping
    await db["shopping"].insert_one({
        "name": name,
        "price": price,
        "quantity": quantity,
        "total": total,
        "user": user
    })

    # 2. Décrémenter budget utilisateur
    await db["bank"].update_one(
        {"user": user},
        {"$inc": {"balance": -total}}
    )

    return {
        "message": "article ajouté",
        "total": total
    }



@router.delete("/remove/{name}")
async def remove_article(name: str):

    article = await db["shopping"].find_one({"name": name})

    if not article:
        raise HTTPException(status_code=404, detail="article not found")

    total = article["price"] * article["quantity"]
    user = article["user"]

    # Supprimer article
    await db["shopping"].delete_one({"name": name})

    # Rembourser budget
    await db["bank"].update_one(
        {"user": user},
        {"$inc": {"balance": total}}
    )

    return {"message": "article supprimé"}



@router.get("/total")
async def get_total():

    cursor = db["shopping"].find({})
    total = 0

    async for a in cursor:
        total += a["price"] * a["quantity"]

    return {"total": total}
@router.get("/items")
async def get_items(user: str):
    items = await db["shopping"].find({"user": user}).to_list(100)

    for i in items:
        i["_id"] = str(i["_id"])

    return items