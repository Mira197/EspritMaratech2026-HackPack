# services/payment.py
from database import db
from models.payment import Payment

async def save_payment(payment: Payment):
    await db["payments"].insert_one(payment.dict())

async def get_payments():
    return await db["payments"].find().to_list(100)
