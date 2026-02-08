from fastapi import APIRouter
from database import db
from pydantic import BaseModel

router = APIRouter()
class InitBudgetDTO(BaseModel):
    user: str
    budget: float
@router.post("/init")
async def init_account(data: InitBudgetDTO):

    await db["bank_accounts"].update_one(
        {"user": data.user},
        {"$set": {"balance": data.budget}},
        upsert=True
    )

    return {
        "message": "Budget initialisé avec succès",
        "user": data.user,
        "balance": data.budget
    }

# ---------- LIRE SOLDE ----------
@router.get("/balance")
async def get_balance(user: str):
    acc = await db["bank_accounts"].find_one({"user": user})

    if not acc:
        # si pas de compte → budget par défaut
        await db["bank_accounts"].insert_one({
            "user": user,
            "balance": 2000
        })
        return {"balance": 2000}

    return {"balance": acc["balance"]}


# ---------- VIREMENT ----------
@router.post("/transfer")
async def transfer(data: dict):

    user = data["from"]
    amount = float(data["amount"])

    acc = await db["bank_accounts"].find_one({"user": user})

    if not acc:
        return {"error": True, "message": "Compte inexistant"}

    if acc["balance"] < amount:
        return {"error": True, "message": "Solde insuffisant"}

    new_balance = acc["balance"] - amount

    await db["bank_accounts"].update_one(
        {"user": user},
        {"$set": {"balance": new_balance}}
    )

    return {
        "success": True,
        "new_balance": new_balance
    }
