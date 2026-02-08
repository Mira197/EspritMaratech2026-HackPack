from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import stripe
from database import db

router = APIRouter()

stripe.api_key = "sk_test_51QwR8RJig9dgGMXA88GSrTkZMyTs3eDJnxmagMJK14JZZSHHfXqi46pWZ3lJS6CU5cRyjDS3EsSFgF3yV4yhHONv004ryM6e41"   # TA CLE

class PaymentIntentDTO(BaseModel):
    user: str
    amount: float   # TND

class ConfirmDTO(BaseModel):
    user: str
    payment_intent: str
    amount: float


@router.post("/create-intent")
async def create_payment_intent(data: PaymentIntentDTO):

    try:
        print("DATA REÇUE:", data)   # LOG IMPORTANT

        # Stripe ne supporte pas TND → on simule en USD
        amount_cents = int(data.amount * 100)

        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            payment_method_types=["card"],
            metadata={"user": data.user}
        )

        return {
            "clientSecret": intent.client_secret
        }

    except Exception as e:
        print("ERREUR STRIPE:", str(e))
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/confirm")
async def confirm_payment(data: ConfirmDTO):

    # 1. Vérifier Stripe
    intent = stripe.PaymentIntent.retrieve(data.payment_intent)

    if intent.status != "succeeded":
        raise HTTPException(400, "Paiement non confirmé par Stripe")

    # 2. Déduire du budget
    acc = await db["bank_accounts"].find_one({"user": data.user})

    if not acc:
        raise HTTPException(404, "Compte inexistant")

    if acc["balance"] < data.amount:
        raise HTTPException(400, "Solde insuffisant")

    new_balance = acc["balance"] - data.amount

    await db["bank_accounts"].update_one(
        {"user": data.user},
        {"$set": {"balance": new_balance}}
    )

    # 3. Historique
    await db["payments"].insert_one({
        "user": data.user,
        "amount": data.amount,
        "stripe_intent": data.payment_intent,
        "type": "debit"
    })

    return {
        "success": True,
        "new_balance": new_balance
    }
