// src/app/services/api.ts

const API_URL = "http://localhost:8000";


// ===================== TYPES =====================

export interface ArticleDTO {
  name: string;
  price: number;
  quantity: number;
  user: string;  
}

export interface TotalResponse {
  total: number;
}

export interface BalanceResponse {
  balance: number;
}

export interface PaymentDTO {
  method: "flouci" | "d17" | "clicktopay";
  amount: number;
  reference: string;
}


// ===================== SHOPPING =====================

export async function addArticle(
  name: string,
  price: number,
  quantity: number
): Promise<any> {

  const payload: ArticleDTO = {
    name,
    price,
    quantity,
    user: "amira",
  };

  try {
    const res = await fetch(`${API_URL}/shopping/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    return await res.json();

  } catch (error) {
    console.error("Erreur addArticle:", error);
    return {
      error: true,
      message: "Impossible d'ajouter l'article",
    };
  }
}



export async function removeArticle(name: string): Promise<any> {

  try {
    const res = await fetch(
      `${API_URL}/shopping/remove/${encodeURIComponent(name)}?user=amira`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    return await res.json();

  } catch (error) {
    console.error("Erreur removeArticle:", error);
    return {
      error: true,
      message: "Impossible de supprimer l'article",
    };
  }
}



export async function getTotal(): Promise<TotalResponse> {

  try {
    const res = await fetch(`${API_URL}/shopping/total?user=amira`);

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    return await res.json();

  } catch (error) {
    console.error("Erreur getTotal:", error);
    return {
      total: 0,
    };
  }
}



export async function getArticles(user: string) {
  try {
    const res = await fetch(`${API_URL}/shopping/items?user=${user}`);

    if (!res.ok) throw new Error("Erreur articles");

    return await res.json();

  } catch (e) {
    console.error(e);
    return [];
  }
}



// ===================== BANKING =====================

export async function getBalance(): Promise<BalanceResponse> {

  try {
    const res = await fetch(`${API_URL}/bank/balance?user=amira`);

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    return await res.json();

  } catch (error) {
    console.error("Erreur getBalance:", error);
    return {
      balance: 0,
    };
  }
}



export async function confirmStripe(payment_intent: string, amount: number) {

  // 👉 ON NETTOIE TOUJOURS
  const cleanIntent = payment_intent.split("_secret")[0];

  const res = await fetch("http://localhost:8000/stripe/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: "amira",
      payment_intent: cleanIntent,
      amount
    })
  });

  return await res.json();
}



export async function makeTransfer(
  to: string,
  amount: number
): Promise<any> {

  try {
    const res = await fetch(`${API_URL}/bank/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "amira",
        to,
        amount,
      }),
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    return await res.json();

  } catch (error) {
    console.error("Erreur makeTransfer:", error);
    return {
      error: true,
      message: "Échec du virement",
    };
  }
}



// ===================== PAYMENT =====================

export async function savePayment(
  method: "flouci" | "d17" | "clicktopay",
  amount: number,
  reference: string
): Promise<any> {

  const payload: PaymentDTO = {
    method,
    amount,
    reference,
  };

  try {
    const res = await fetch(`${API_URL}/payment/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    return await res.json();

  } catch (error) {
    console.error("Erreur savePayment:", error);
    return {
      error: true,
      message: "Paiement non enregistré",
    };
  }
}



export async function getPayments(): Promise<any[]> {

  try {
    const res = await fetch(`${API_URL}/payment/all`);

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    return await res.json();

  } catch (error) {
    console.error("Erreur getPayments:", error);
    return [];
  }
}



// ===================== STRIPE =====================

export const createStripeIntent = async (data: {
  user: string;
  amount: number;
}) => {

  const response = await fetch(
    `${API_URL}/stripe/create-intent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create Stripe intent');
  }

  return response.json();
};



export const confirmStripePayment = async (data: {
  user: string;
  payment_intent: string;
  amount: number;
}) => {

  const response = await fetch(
    `${API_URL}/stripe/confirm`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    throw new Error('Failed to confirm Stripe payment');
  }

  return response.json();
};



// ===================== UTIL =====================

export function handleApiError(error: any) {
  console.error("API Error:", error);

  return {
    error: true,
    message: "Erreur de connexion au serveur",
  };
}
