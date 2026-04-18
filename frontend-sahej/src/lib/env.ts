const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrlConfig() {
  const apiBaseUrl = trimTrailingSlash(rawApiBaseUrl);

  if (!apiBaseUrl) {
    return {
      apiBaseUrl: null,
      error:
        "Missing EXPO_PUBLIC_API_BASE_URL. Add it to frontend-sahej/.env as a root backend URL like http://192.168.1.10:3000."
    };
  }

  if (!/^https?:\/\//.test(apiBaseUrl)) {
    return {
      apiBaseUrl: null,
      error:
        "EXPO_PUBLIC_API_BASE_URL must start with http:// or https:// and should not include /reflect."
    };
  }

  return {
    apiBaseUrl,
    error: null
  };
}
