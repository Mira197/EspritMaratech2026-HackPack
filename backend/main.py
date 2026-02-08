# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.shopping import router as shopping_router
from routes.banking import router as banking_router
from routes.stripe_pay import router as stripe_router

from database import db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shopping_router, prefix="/shopping")
app.include_router(banking_router, prefix="/bank")
app.include_router(stripe_router, prefix="/stripe")


@app.get("/")
def home():
    return {"status": "backend connecté avec le front React"}
