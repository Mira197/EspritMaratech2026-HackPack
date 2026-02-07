def detect_intent(text):

    t = text.lower()

    if "solde" in t:
        return "CHECK_BALANCE"

    if "ajoute" in t:
        return "ADD_ITEM"

    return "UNKNOWN"
