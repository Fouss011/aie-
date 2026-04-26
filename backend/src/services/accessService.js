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

  if (subscription.is_active) return true;

  if (subscription.trial_end) {
    return new Date(subscription.trial_end) > new Date();
  }

  return false;
}