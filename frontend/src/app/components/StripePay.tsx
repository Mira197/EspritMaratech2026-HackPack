import { useState, useEffect, useRef } from "react";
import {
  createStripeIntent,
  confirmStripe,
  getBalance
} from "../../services/api";

// 👉 Interface propre : onSuccess reçoit le nouveau solde
interface Props {
  amount: number;
  onSuccess?: (newBalance: number) => void;
}

// 👉 Déclaration globale propre
declare global {
  interface Window {
    triggerStripePay?: () => Promise<void>;
  }
}

export default function StripePay({ amount, onSuccess }: Props) {

  // =======================
  // ÉTATS
  // =======================
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  // 👉 éviter double paiement
  const paidRef = useRef<boolean>(false);

  // =======================
  // 1. CRÉER PAYMENT INTENT
  // =======================
  useEffect(() => {

    // Reset si montant change
    paidRef.current = false;
    setClientSecret("");

    if (!amount || amount <= 0) {
      setStatus("Montant invalide");
      return;
    }

    async function init() {

      setStatus("Préparation du paiement...");

      try {

        const data = await createStripeIntent({
          user: "amira",      // 👈 même user que backend
          amount: amount
        });

        if (data && data.clientSecret) {

          setClientSecret(data.clientSecret);

          setStatus(
            "Paiement prêt. En attente de confirmation vocale."
          );

        } else {
          setStatus("Erreur Stripe : pas de session");
        }

      } catch (err) {
        console.error("Erreur Stripe init:", err);
        setStatus("Erreur connexion Stripe");
      }
    }

    init();

  }, [amount]);

  // =======================
  // 2. MÉTHODE PAY (APPELÉE PAR LA VOIX)
  // =======================
  const pay = async () => {

    if (paidRef.current) {
      return;
    }

    if (!clientSecret) {
      setStatus("Stripe non prêt");
      return;
    }

    setLoading(true);
    setStatus("Paiement en cours...");

    try {

      // 👉 extraire ID réel
      const paymentIntent =
        clientSecret.split("_secret")[0];

      const res = await confirmStripe(
        paymentIntent,
        amount
      );

      if (res && res.success) {

        paidRef.current = true;

        setStatus("Paiement réussi ✅");

        // 🔥 RÉCUPÉRER LE NOUVEAU SOLDE
        const data = await getBalance();

        // 🔥 TRANSMETTRE AU PARENT
        onSuccess?.(data.balance);

      } else {
        setStatus("Échec paiement ❌");
      }

    } catch (e) {
      console.error("Erreur confirm:", e);
      setStatus("Erreur durant le paiement");
    }

    setLoading(false);
  };

  // =======================
  // 3. EXPOSER AU PARENT
  // =======================
  useEffect(() => {
    window.triggerStripePay = pay;

    return () => {
      window.triggerStripePay = undefined;
    };
  }, [clientSecret, amount]);

  // =======================
  // UI SANS BOUTON
  // =======================
  return (
    <div className="p-6 border rounded-xl bg-white shadow">

      <h3 className="text-2xl mb-2">
        Paiement Stripe sécurisé
      </h3>

      <p className="text-xl mb-4">
        Montant à payer :
        <strong className="ml-2 text-green-600">
          {amount.toFixed(2)} TND
        </strong>
      </p>

      {/* 👉 PAS DE BOUTON = VOIX UNIQUEMENT */}

      <p className="mt-4 text-lg font-semibold">
        {status}
      </p>

    </div>
  );
}
