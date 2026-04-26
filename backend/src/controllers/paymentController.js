import crypto from "crypto";
import { supabase } from "../config/supabaseClient.js";
import { initializeCinetPayPayment } from "../services/cinetpayService.js";

const SUBSCRIPTION_AMOUNT = 15000;

export async function requestPayment(req, res, next) {
  try {
    const { structureId, customerName, customerEmail, customerPhone } = req.body;

    if (!structureId) {
      return res.status(400).json({ error: "structureId est obligatoire." });
    }

    const transactionId = `MONIVA-${Date.now()}-${crypto
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
      description: "Abonnement Moniva",
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

export async function cinetpayNotify(req, res, next) {
  try {
    const { cpm_trans_id } = req.body;

    if (!cpm_trans_id) {
      return res.status(400).json({ error: "Transaction absente." });
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_id", cpm_trans_id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ error: "Paiement introuvable." });
    }

    await supabase
      .from("payments")
      .update({
        status: "validated",
      })
      .eq("id", payment.id);

    await supabase
      .from("subscriptions")
      .update({
        is_active: true,
        plan: "premium",
        status: "active",
      })
      .eq("structure_id", payment.structure_id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}