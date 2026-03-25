export const computeExpiryTime = ({
  startedAt,
  durationMinutes,
}: {
  startedAt: Date;
  durationMinutes?: number | null;
}) => {
  if (!durationMinutes || durationMinutes <= 0) return null;

  return new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
};

export const getRemainingSeconds = ({
  expiresAt,
}: {
  expiresAt?: Date | null;
}) => {
  if (!expiresAt) return null;

  const now = Date.now();
  const diff = expiresAt.getTime() - now;

  return Math.max(0, Math.floor(diff / 1000));
};

export const isAttemptExpired = ({
  expiresAt,
}: {
  expiresAt?: Date | null;
}) => {
  if (!expiresAt) return false;
  return Date.now() >= expiresAt.getTime();
};
