export type SetuRuntimeConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  apiKey: string;
  digilockerAuthPath: string;
  vehicleServicePath: string;
  redirectUri: string;
};

export function getSetuRuntimeConfig(): SetuRuntimeConfig {
  const baseUrl = (process.env.EXPO_PUBLIC_API_SETU_BASE_URL ?? process.env.API_SETU_BASE_URL ?? '').trim();
  const clientId = (process.env.EXPO_PUBLIC_API_SETU_CLIENT_ID ?? process.env.API_SETU_CLIENT_ID ?? '').trim();
  const clientSecret = (process.env.EXPO_PUBLIC_API_SETU_CLIENT_SECRET ?? process.env.API_SETU_CLIENT_SECRET ?? '').trim();
  const apiKey = (process.env.EXPO_PUBLIC_API_SETU_API_KEY ?? process.env.API_SETU_API_KEY ?? '').trim();
  const digilockerAuthPath = (
    process.env.EXPO_PUBLIC_API_SETU_DIGILOCKER_AUTH_PATH ?? process.env.API_SETU_DIGILOCKER_AUTH_PATH ?? ''
  ).trim();
  const vehicleServicePath = (
    process.env.EXPO_PUBLIC_API_SETU_VEHICLE_PATH ?? process.env.API_SETU_VEHICLE_PATH ?? ''
  ).trim();
  const redirectUri = (
    process.env.EXPO_PUBLIC_DIGILOCKER_REDIRECT_URI ?? process.env.DIGILOCKER_REDIRECT_URI ?? ''
  ).trim();

  return {
    baseUrl,
    clientId,
    clientSecret,
    apiKey,
    digilockerAuthPath,
    vehicleServicePath,
    redirectUri,
  };
}

export function hasRequiredSetuConfig(): boolean {
  const config = getSetuRuntimeConfig();
  return Boolean(
    config.baseUrl &&
      config.clientId &&
      config.clientSecret &&
      config.apiKey &&
      config.digilockerAuthPath &&
      config.vehicleServicePath &&
      config.redirectUri,
  );
}
