import requests
from fastapi import APIRouter

router = APIRouter()

FLOUCI_TOKEN = "TON_APP_TOKEN"
FLOUCI_SECRET = "TON_APP_SECRET"

@router.post("/create-payment")
def create_payment(amount: float):

    payload = {
        "app_token": FLOUCI_TOKEN,
        "app_secret": FLOUCI_SECRET,
        "amount": int(amount * 1000),   # 10dt → 10000
        "accept_card": "true",
        "session_timeout_secs": 1200,
        "success_link": "http://localhost:5173/success",
        "fail_link": "http://localhost:5173/fail",
        "developer_tracking_id": "basira_user_1"
    }

    res = requests.post(
        "https://developers.flouci.com/api/generate_payment",
        json=payload
    )

    return res.json()
