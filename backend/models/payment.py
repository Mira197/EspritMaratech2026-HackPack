# models/payment.py
from pydantic import BaseModel

class Payment(BaseModel):
    method: str   # flouci / d17 / clicktopay
    amount: float
    reference: str
