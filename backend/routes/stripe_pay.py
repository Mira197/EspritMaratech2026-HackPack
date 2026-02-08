from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import stripe
from database import db
import os
from dotenv import load_dotenv

# ================= CONFIG =================

load_dotenv()

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

print("🔐 STRIPE KEY CHARGÉE :", stripe.api_key)


# ================= MODELS =================

class PaymentIntentDTO(BaseModel):
    user: str
    amount: float   # TND simulé en USD


class ConfirmDTO(BaseModel):
    user: str
    payment_intent: str
    amount: float


# ================= CREATE INTENT =================

@router.post("/create-intent")
async def create_payment_intent(data: PaymentIntentDTO):

    try:
        print("📥 DATA REÇUE:", data)

        if data.amount <= 0:
            raise HTTPException(400, "Montant invalide")

        # TND → USD simulation
        amount_cents = int(data.amount * 100)

        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",

            # 👉 Méthode moderne
            automatic_payment_methods={
                "enabled": True
            },

            metadata={
                "user": data.user,
                "tnd_amount": data.amount
            }
        )

        print("✅ INTENT CRÉÉ:", intent.id)

        return {
            "clientSecret": intent.client_secret
        }

    except Exception as e:
        print("❌ ERREUR STRIPE:", str(e))
        raise HTTPException(status_code=400, detail=str(e))


# ================= CONFIRM =================

@router.post("/confirm")
async def confirm_payment(data: ConfirmDTO):

    try:
        print("📥 CONFIRM REÇU:", data)

        # 1. Vérifier Stripe
        intent = stripe.PaymentIntent.retrieve(data.payment_intent)

        print("ℹ️ STATUT STRIPE:", intent.status)

        # 👉 MODE DÉMO HACKATHON
        allowed = [
            "succeeded",
            "requires_capture",
            "processing",
            "requires_payment_method",
            "requires_confirmation"
        ]

        if intent.status not in allowed:
            raise HTTPException(
                400,
                f"Statut Stripe invalide: {intent.status}"
            )

        # 2. Vérifier compte Mongo
        acc = await db["bank_accounts"].find_one({"user": data.user})

        if not acc:
            raise HTTPException(404, "Compte inexistant")

        if acc["balance"] < data.amount:
            raise HTTPException(400, "Solde insuffisant")

        new_balance = acc["balance"] - data.amount

        # 3. Mise à jour solde
        await db["bank_accounts"].update_one(
            {"user": data.user},
            {"$set": {"balance": new_balance}}
        )

        # 4. Historique paiement
        await db["payments"].insert_one({
            "user": data.user,
            "amount": data.amount,
            "stripe_intent": data.payment_intent,
            "type": "debit"
        })

        print("✅ PAIEMENT VALIDÉ")

        return {
            "success": True,
            "new_balance": new_balance
        }

    except HTTPException as he:
        raise he

    except Exception as e:
        print("❌ ERREUR CONFIRM:", str(e))
        raise HTTPException(400, str(e))
