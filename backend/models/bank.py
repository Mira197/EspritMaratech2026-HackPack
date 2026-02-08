from pydantic import BaseModel

class Account(BaseModel):
    user: str
    balance: float
