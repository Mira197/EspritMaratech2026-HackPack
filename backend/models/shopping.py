# models/shopping.py
from pydantic import BaseModel
from typing import Optional

class Article(BaseModel):
    name: str
    price: float
    quantity: int = 1

class Budget(BaseModel):
    total: float

class Stock(BaseModel):
    name: str
    available: int
