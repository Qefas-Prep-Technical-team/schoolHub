export const getSingleString = (value: string | string[] | undefined | null): string => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

export const getOptionalString = (value: string | string[] | undefined | null): string | undefined => {
  const normalized = getSingleString(value);
  return normalized === "" ? undefined : normalized;
};
