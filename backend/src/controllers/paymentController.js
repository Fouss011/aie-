import crypto from "crypto";
import { supabase } from "../config/supabaseClient.js";
import { initializeCinetPayPayment } from "../services/cinetpayService.js";

const SUBSCRIPTION_AMOUNT = 3000;

export async function requestPayment(req, res, next) {
  try {
    const { structureId, customerName, customerEmail, customerPhone } = req.body;

    if (!structureId) {
      return res.status(400).json({ error: "structureId est obligatoire." });
    }

    const transactionId = `MONYVA-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        structure_id: structureId,
        amount: SUBSCRIPTION_AMOUNT,
        status: "pending",
        transaction_id: transactionId,
        provider: "cinetpay",
      })
      .select()
      .single();

    if (error) throw error;

    const cinetpayResponse = await initializeCinetPayPayment({
      transactionId,
      amount: SUBSCRIPTION_AMOUNT,
      description: "Abonnement Monyva",
      customerName: customerName || "Client",
      customerEmail,
      customerPhone,
    });

    res.json({
      success: true,
      payment,
      paymentUrl: cinetpayResponse?.data?.payment_url,
      transactionId,
    });
  } catch (error) {
    next(error);
  }
}

export async function validatePayment(req, res, next) {
  try {
    const { structureId } = req.body;

    if (!structureId) {
      return res.status(400).json({ error: "structureId est obligatoire." });
    }

    await supabase
      .from("subscriptions")
      .update({
        is_active: true,
        plan: "premium",
        status: "active",
      })
      .eq("structure_id", structureId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

import { checkCinetPayPayment } from "../services/cinetpayService.js";
import { supabase } from "../config/supabaseClient.js";

export async function cinetpayNotify(req, res) {
  try {
    const { cpm_trans_id } = req.body;

    if (!cpm_trans_id) {
      return res.status(400).send("Transaction manquante");
    }

    console.log("🔔 Notification CinetPay :", cpm_trans_id);

    // 🔍 Vérification officielle chez CinetPay
    const paymentCheck = await checkCinetPayPayment(cpm_trans_id);

    const paymentStatus = paymentCheck?.data?.status;

    if (paymentStatus !== "ACCEPTED") {
      console.log("❌ Paiement non validé :", paymentStatus);
      return res.status(200).send("Paiement non validé");
    }

    console.log("✅ Paiement confirmé");

    // 🔎 Récupération du paiement
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_id", cpm_trans_id)
      .single();

    if (!payment) {
      console.log("❌ Paiement introuvable");
      return res.status(200).send("OK");
    }

    const structureId = payment.structure_id;

    // 📅 Calcul 30 jours
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30);

    // ✅ Mise à jour paiement
    await supabase
      .from("payments")
      .update({
        status: "validated",
        paid_at: now.toISOString(),
      })
      .eq("transaction_id", cpm_trans_id);

    // 🔥 Activation abonnement
    await supabase
      .from("subscriptions")
      .update({
        is_active: true,
        plan: "premium",
        current_period_end: endDate.toISOString(),
      })
      .eq("structure_id", structureId);

    console.log("🔥 Abonnement activé pour 30 jours");

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Erreur notify :", err);
    return res.status(500).send("Erreur serveur");
  }
}