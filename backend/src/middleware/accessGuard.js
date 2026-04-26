import { getOrCreateSubscription, isSubscriptionActive } from "../services/accessService.js";

export async function accessGuard(req, res, next) {
  try {
    const structureId = req.body.structureId || req.query.structureId;

    if (!structureId) {
      return res.status(400).json({
        error: "structureId requis",
      });
    }

    const subscription = await getOrCreateSubscription(structureId);

    const active = isSubscriptionActive(subscription);

    if (!active) {
      return res.status(403).json({
        error: "Abonnement requis",
        code: "SUBSCRIPTION_REQUIRED",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}