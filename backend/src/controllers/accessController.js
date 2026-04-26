import { getOrCreateSubscription } from "../services/accessService.js";

export async function getAccessStatus(req, res) {
  const { structureId } = req.query;

  const sub = await getOrCreateSubscription(structureId);

  const now = new Date();
  const trialEnd = new Date(sub.trial_end);

  const remainingDays = Math.max(
    0,
    Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
  );

  res.json({
    isActive: sub.is_active,
    remainingDays,
    trialEnd,
  });
}