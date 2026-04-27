import {
  getOrCreateSubscription,
  isSubscriptionActive,
} from "../services/accessService.js";

export async function getAccessStatus(req, res, next) {
  try {
    const { structureId } = req.query;

    if (!structureId) {
      return res.status(400).json({ error: "structureId est obligatoire." });
    }

    const sub = await getOrCreateSubscription(structureId);

    const now = new Date();
    const trialEnd = sub.trial_end ? new Date(sub.trial_end) : null;
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end)
      : null;

    const activeUntil = periodEnd || trialEnd;

    const remainingDays = activeUntil
      ? Math.max(
          0,
          Math.ceil((activeUntil - now) / (1000 * 60 * 60 * 24))
        )
      : 0;

    res.json({
      isActive: isSubscriptionActive(sub),
      isSubscribed:
        sub.plan === "premium" &&
        sub.status === "active" &&
        sub.is_active === true &&
        periodEnd &&
        periodEnd > now,
      plan: sub.plan,
      status: sub.status,
      remainingDays,
      trialEnd: sub.trial_end,
      currentPeriodEnd: sub.current_period_end,
    });
  } catch (error) {
    next(error);
  }
}