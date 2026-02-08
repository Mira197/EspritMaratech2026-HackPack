# services/shopping.py
from database import db
from models.shopping import Article

async def add_article(article: Article):
    await db["cart"].insert_one(article.dict())

async def remove_article(name: str):
    await db["cart"].delete_one({"name": name})

async def calculate_total():
    items = await db["cart"].find().to_list(100)
    return sum(i["price"] * i["quantity"] for i in items)

async def set_budget(total: float):
    await db["budget"].delete_many({})
    await db["budget"].insert_one({"total": total})

async def get_budget():
    b = await db["budget"].find_one()
    return b["total"] if b else 0

# NOUVELLES FONCTIONS
async def get_cart_items():
    items = await db["cart"].find().to_list(100)
    # Convertir ObjectId en string pour JSON
    for item in items:
        item["_id"] = str(item["_id"])
    return items

async def clear_all_items():
    await db["cart"].delete_many({})