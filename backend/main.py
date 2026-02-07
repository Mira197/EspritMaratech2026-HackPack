from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Command(BaseModel):
    text: str

@app.post("/voice-command")
def voice(cmd: Command):

    t = cmd.text.lower()

    # LOGIQUE SIMPLE POUR TEST
    if "banque" in t or "bank" in t:
        return {"reply": "J’ouvre le module bancaire"}

    if "course" in t or "shopping" in t:
        return {"reply": "J’ouvre la liste de courses"}

    if "bonjour" in t:
        return {"reply": "Bonjour ! Comment puis-je vous aider ?"}

    return {"reply": "Je n’ai pas compris la commande"}
