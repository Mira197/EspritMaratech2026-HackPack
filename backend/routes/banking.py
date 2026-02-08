# routes/banking.py
from fastapi import APIRouter
from models.banking import Transfer
from services.banking import *

router = APIRouter()

@router.get("/balance")
async def balance():
    return {"balance": await get_balance()}

@router.post("/transfer")
async def transfer(t: Transfer):
    await make_transfer(t.to, t.amount)
    return {"message": "virement effectué"}
