# routes/payment.py
from fastapi import APIRouter
from models.payment import Payment
from services.payment import *

router = APIRouter()

@router.post("/save")
async def save(p: Payment):
    await save_payment(p)
    return {"message": "paiement enregistré"}

@router.get("/all")
async def all():
    return await get_payments()
