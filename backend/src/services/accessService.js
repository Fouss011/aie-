import { supabase } from "../config/supabaseClient.js";

export async function getOrCreateSubscription(structureId) {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("structure_id", structureId)
    .single();

  if (data) return data;

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30);

  const { data: newSub } = await supabase
    .from("subscriptions")
    .insert({
      structure_id: structureId,
      trial_end: trialEnd,
    })
    .select()
    .single();

  return newSub;
}

export function isSubscriptionActive(subscription) {
  if (!subscription) return false;

  const now = new Date();

  return (
    subscription.is_active &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end) > now
  );
}