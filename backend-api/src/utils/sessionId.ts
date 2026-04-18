const DEFAULT_SESSION_ID = "demo-session";

export const getSessionId = (headerValue: string | string[] | undefined): string => {
  const rawValue = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const trimmedValue = rawValue?.trim();

  if (!trimmedValue) {
    return DEFAULT_SESSION_ID;
  }

  return trimmedValue;
};
