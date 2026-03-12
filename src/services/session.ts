export const SESSION_KEY = "anthropic_api_key";
export const SESSION_MODEL = "anthropic_model";

export function saveSession(key: string, model: string) {
  sessionStorage.setItem(SESSION_KEY, key);
  sessionStorage.setItem(SESSION_MODEL, model);
}