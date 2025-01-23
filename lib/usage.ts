const USAGE_KEY = 'name_generator_usage';
const FREE_LIMIT = 3;

export const getUsageCount = (): number => {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(USAGE_KEY) || '0', 10);
};

export const incrementUsage = (): void => {
  if (typeof window === 'undefined') return;
  const currentUsage = getUsageCount();
  localStorage.setItem(USAGE_KEY, (currentUsage + 1).toString());
};

export const hasRemainingUsage = (): boolean => {
  return getUsageCount() < FREE_LIMIT;
};

export const getRemainingUsage = (): number => {
  return Math.max(0, FREE_LIMIT - getUsageCount());
};
