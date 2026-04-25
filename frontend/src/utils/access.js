const TRIAL_DAYS = 0;

export function getTrialStatus(activeStructure) {
  if (!activeStructure?.created_at) {
    return {
      isTrialActive: false,
      daysRemaining: 0,
      trialEndsAt: null,
    };
  }

  const createdAt = new Date(activeStructure.created_at);
  const trialEndsAt = new Date(createdAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const now = new Date();
  const diffMs = trialEndsAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    isTrialActive: now <= trialEndsAt,
    daysRemaining,
    trialEndsAt,
  };
}