import { env } from "../config/env.js";

export async function initializeCinetPayPayment({
  transactionId,
  amount,
  currency = "XOF",
  description,
  customerName,
  customerSurname,
  customerEmail,
  customerPhone,
}) {
  const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apikey: env.cinetpayApiKey,
      site_id: env.cinetpaySiteId,
      transaction_id: transactionId,
      amount,
      currency,
      description,
      return_url: `${env.frontendUrl}/dashboard`,
      notify_url: `${env.backendUrl}/api/payments/cinetpay/notify`,
      channels: "ALL",
      customer_name: customerName || "Client",
      customer_surname: customerSurname || "Monyva",
      customer_email: customerEmail || "client@monyva.local",
      customer_phone_number: customerPhone || "00000000",
      customer_address: "Non renseignée",
      customer_city: "Lomé",
      customer_country: "TG",
      customer_state: "TG",
      customer_zip_code: "00000",
    }),
  });

  const data = await response.json();

  if (!response.ok || data?.code !== "201") {
    throw new Error(
      data?.message || "Impossible d'initialiser le paiement CinetPay."
    );
  }

  return data;
}

export async function checkCinetPayPayment(transactionId) {
  const response = await fetch(
    "https://api-checkout.cinetpay.com/v2/payment/check",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: env.cinetpayApiKey,
        site_id: env.cinetpaySiteId,
        transaction_id: transactionId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Impossible de vérifier le paiement CinetPay."
    );
  }

  return data;
}