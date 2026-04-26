import { supabase } from "../config/supabaseClient.js";

export async function requestPayment(req, res) {
  const { structureId } = req.body;

  const { data } = await supabase
    .from("payments")
    .insert({
      structure_id: structureId,
      amount: 15000,
    })
    .select()
    .single();

  res.json({ success: true, payment: data });
}

export async function validatePayment(req, res) {
  const { structureId } = req.body;

  await supabase
    .from("subscriptions")
    .update({
      is_active: true,
      plan: "premium",
    })
    .eq("structure_id", structureId);

  res.json({ success: true });
}