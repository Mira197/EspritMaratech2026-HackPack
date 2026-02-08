# services/banking.py
from database import db

async def get_balance():
    b = await db["bank"].find_one()
    return b["balance"] if b else 2500.75

async def make_transfer(to: str, amount: float):
    await db["transfers"].insert_one({
        "to": to,
        "amount": amount
    })
