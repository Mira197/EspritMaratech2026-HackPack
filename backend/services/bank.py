from database import bank_col

async def get_balance(user):

    doc = await bank_col.find_one({"user": user})

    if not doc:
        await bank_col.insert_one({
            "user": user,
            "balance": 300.0
        })
        return 300.0

    return doc["balance"]
