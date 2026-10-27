/**
 * Subdomain detection utility for multi-tenant school landing pages.
 * Accurately determines if the current request/browser is on a school subdomain
 * or the apex/system domain.
 */

const SYSTEM_SUBDOMAINS = new Set([
  "www",
  "flexiti",
  "localhost",
  "lvh",
  "schoolhub",
  "staging",
  "preview",
  "api",
  "cdn",
  "mail",
  "app",
  "admin",
  "console",
]);

const STAGING_APEX_SUFFIXES = ["staging.qefas.com", "preview.qefas.com"];

/**
 * Checks if the string is an IP address (e.g. 127.0.0.1 or ::1).
 */
function isIpAddress(hostname: string): boolean {
  return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname) || hostname === "::1";
}

/**
 * Extracts the tenant subdomain from the hostname if present.
 * Returns null if the hostname is an apex domain, IP, or system subdomain.
 */
export function detectSubdomain(rawHostname?: string): string | null {
  if (typeof window === "undefined" && !rawHostname) return null;
  const hostname = (
    rawHostname || (typeof window !== "undefined" ? window.location.hostname : "")
  ).toLowerCase().trim();

  if (!hostname || isIpAddress(hostname)) return null;

  // Local development e.g. myschool.localhost or myschool.lvh.me
  if (hostname.includes("localhost") || hostname.includes("lvh.me")) {
    const parts = hostname.split(".");
    if (parts.length > 1) {
      const sub = parts[0];
      if (sub && !SYSTEM_SUBDOMAINS.has(sub)) {
        return sub;
      }
    }
    return null;
  }

  // Staging / preview environments: e.g. myschool.staging.qefas.com
  const matchedStaging = STAGING_APEX_SUFFIXES.find(
    (apex) => hostname === apex || hostname.endsWith(`.${apex}`)
  );
  if (matchedStaging) {
    const withoutApex = hostname.slice(0, hostname.length - matchedStaging.length - 1);
    if (withoutApex && !SYSTEM_SUBDOMAINS.has(withoutApex)) {
      return withoutApex;
    }
    return null;
  }

  // Standard production: e.g. myschool.qefas.com
  const parts = hostname.split(".");
  if (parts.length > 2) {
    const sub = parts[0];
    if (sub && !SYSTEM_SUBDOMAINS.has(sub)) {
      return sub;
    }
  }

  return null;
}

/**
 * Returns true only if the user is visiting via a dedicated school subdomain (e.g. home.qefas.com).
 * Returns false if on apex domain (localhost:3000, qefas.com, www.qefas.com).
 */
export function isSubdomainHost(rawHostname?: string): boolean {
  return detectSubdomain(rawHostname) !== null;
}
