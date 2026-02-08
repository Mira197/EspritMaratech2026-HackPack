import { useState } from "react";
import { createStripeIntent, confirmStripe } from "../../services/api";

export default function StripePay() {

  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");

 const pay = async () => {

  if (!amount || amount <= 0) {
    alert("Montant invalide");
    return;
  }

  const data = await createStripeIntent(amount);

  if (!data.clientSecret) {
    alert("Erreur Stripe : " + JSON.stringify(data));
    return;
  }

  const paymentIntent = data.clientSecret.split("_secret")[0];

  const res = await confirmStripe(paymentIntent, amount);

  if (res.success) {
    alert("Paiement OK");
  } else {
    alert("Échec: " + JSON.stringify(res));
  }
};


  return (
    <div className="p-4 border">
      <input
        type="number"
        onChange={e => setAmount(Number(e.target.value))}
        placeholder="Montant TND"
      />

      <button onClick={pay}>
        Payer par Stripe
      </button>

      <p>{status}</p>
    </div>
  );
}
