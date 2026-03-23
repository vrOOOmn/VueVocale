const STORAGE_KEY = "class_access_granted";

export function readClassAccessGrant(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function markClassAccessGrant() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, "1");
}

export function clearClassAccessGrant() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export { STORAGE_KEY };
