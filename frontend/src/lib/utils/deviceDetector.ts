"use client";

/**
 * High-accuracy Device and Location detection utility for web clients.
 * Accurately resolves smartphone models (Android / iPhone) and geolocations.
 */

// Mapping of common IANA timezones to friendly City, Country strings
const TIMEZONE_TO_LOCATION: Record<string, string> = {
  "Africa/Lagos": "Lagos, Nigeria",
  "Africa/Abuja": "Abuja, Nigeria",
  "Africa/Porto-Novo": "Porto-Novo, Benin",
  "Africa/Accra": "Accra, Ghana",
  "Africa/Nairobi": "Nairobi, Kenya",
  "Africa/Johannesburg": "Johannesburg, South Africa",
  "Africa/Cairo": "Cairo, Egypt",
  "Africa/Casablanca": "Casablanca, Morocco",
  "Africa/Kigali": "Kigali, Rwanda",
  "Africa/Kampala": "Kampala, Uganda",
  "Africa/Addis_Ababa": "Addis Ababa, Ethiopia",
  "Europe/London": "London, United Kingdom",
  "Europe/Paris": "Paris, France",
  "Europe/Berlin": "Berlin, Germany",
  "Europe/Rome": "Rome, Italy",
  "Europe/Madrid": "Madrid, Spain",
  "America/New_York": "New York, United States",
  "America/Chicago": "Chicago, United States",
  "America/Los_Angeles": "Los Angeles, United States",
  "America/Toronto": "Toronto, Canada",
  "America/Vancouver": "Vancouver, Canada",
  "Asia/Dubai": "Dubai, United Arab Emirates",
  "Asia/Riyadh": "Riyadh, Saudi Arabia",
  "Asia/Singapore": "Singapore",
  "Asia/Tokyo": "Tokyo, Japan",
  "Asia/Kolkata": "New Delhi, India",
  "Australia/Sydney": "Sydney, Australia",
};

/**
 * Resolves a friendly City, Country string from the device's system timezone
 * without requiring any user permissions.
 */
export function getTimezoneLocation(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return "Unknown Location";

    if (TIMEZONE_TO_LOCATION[tz]) {
      return TIMEZONE_TO_LOCATION[tz];
    }

    // Format fallback e.g. "Africa/Lagos" -> "Lagos, Africa"
    const parts = tz.split("/");
    if (parts.length === 2) {
      const city = parts[1].replace(/_/g, " ");
      return `${city}, ${parts[0]}`;
    }

    return tz.replace(/_/g, " ");
  } catch {
    return "Unknown Location";
  }
}

/**
 * Detects specific iPhone model based on screen resolution and pixel ratio.
 * Apple masks the UA string to just "iPhone", but screen metrics identify the exact generation.
 */
function detectIPhoneModel(): string {
  if (typeof window === "undefined") return "Apple iPhone";

  const width = window.screen.width;
  const height = window.screen.height;
  const ratio = window.devicePixelRatio || 1;

  const w = Math.min(width, height);
  const h = Math.max(width, height);

  // iPhone 14 Pro / 15 / 15 Pro / 16
  if (w === 393 && h === 852 && ratio >= 3) {
    return "Apple iPhone 15 / 14 Pro";
  }
  // iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus
  if (w === 430 && h === 932 && ratio >= 3) {
    return "Apple iPhone 15 Pro Max / 14 Pro Max";
  }
  // iPhone 12 / 12 Pro / 13 / 13 Pro / 14
  if (w === 390 && h === 844 && ratio >= 3) {
    return "Apple iPhone 13 / 14";
  }
  // iPhone 12 Pro Max / 13 Pro Max / 14 Plus
  if (w === 428 && h === 926 && ratio >= 3) {
    return "Apple iPhone 13 Pro Max / 14 Plus";
  }
  // iPhone 12 mini / 13 mini
  if (w === 360 && h === 780 && ratio >= 3) {
    return "Apple iPhone 13 mini";
  }
  // iPhone 11 Pro Max / XS Max
  if (w === 414 && h === 896 && ratio >= 3) {
    return "Apple iPhone 11 Pro Max / XS Max";
  }
  // iPhone XR / 11
  if (w === 414 && h === 896 && ratio === 2) {
    return "Apple iPhone 11 / XR";
  }
  // iPhone X / XS / 11 Pro
  if (w === 375 && h === 812 && ratio >= 3) {
    return "Apple iPhone 11 Pro / X";
  }
  // iPhone 6 / 7 / 8 / SE (2nd/3rd gen)
  if (w === 375 && h === 667 && ratio === 2) {
    return "Apple iPhone SE";
  }
  // iPhone 6+ / 7+ / 8+
  if (w === 414 && h === 736 && ratio >= 3) {
    return "Apple iPhone Plus";
  }

  return "Apple iPhone";
}

/**
 * Detects browser brand and version from userAgent.
 */
function detectBrowserName(ua: string): string {
  if (ua.includes("SamsungBrowser/")) return "Samsung Internet";
  if (ua.includes("EdgA/") || ua.includes("EdgiOS/") || ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera Mobile";
  if (ua.includes("Chrome/") || ua.includes("CriOS/")) return "Chrome Mobile";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Mobile Safari";
  if (ua.includes("Firefox/") || ua.includes("FxiOS/")) return "Firefox Mobile";
  return "Mobile Browser";
}

export interface ClientDeviceInfo {
  deviceType: "mobile" | "tablet" | "desktop";
  deviceModel: string;
  osVersion: string;
  location: string;
  timeZone: string;
}

let cachedDeviceInfo: ClientDeviceInfo | null = null;

/**
 * Returns complete, high-accuracy device model, OS, and location for the web client.
 */
export async function getClientDeviceInfo(): Promise<ClientDeviceInfo> {
  if (cachedDeviceInfo) return cachedDeviceInfo;
  if (typeof window === "undefined") {
    return {
      deviceType: "desktop",
      deviceModel: "Web Client",
      osVersion: "Web",
      location: "Unknown Location",
      timeZone: "UTC",
    };
  }

  const ua = navigator.userAgent || "";
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);

  const deviceType: "mobile" | "tablet" | "desktop" = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
  const browserName = detectBrowserName(ua);

  let deviceModel = "Unknown Device";
  let osVersion = "Unknown OS";

  // Check cached precise location in localStorage if user previously granted permission
  const cachedLocation = localStorage.getItem("qefas_device_location") || getTimezoneLocation();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  // 1. Check User-Agent Client Hints (Chromium / Android devices)
  const navAny = navigator as any;
  if (navAny.userAgentData && typeof navAny.userAgentData.getHighEntropyValues === "function") {
    try {
      const hints = await navAny.userAgentData.getHighEntropyValues([
        "model",
        "platform",
        "platformVersion",
      ]);

      if (hints.model) {
        deviceModel = `${hints.model} (${browserName})`;
      }
      if (hints.platform) {
        osVersion = `${hints.platform} ${hints.platformVersion || ""}`.trim();
      }
    } catch {
      // Ignore client hints failure and fallback
    }
  }

  // 2. iOS Devices (iPhone / iPad)
  if (deviceModel === "Unknown Device" && /iPhone/i.test(ua)) {
    const iPhoneModel = detectIPhoneModel();
    deviceModel = `${iPhoneModel} (${browserName})`;
    
    // Extract iOS version from UA e.g. "CPU iPhone OS 17_4 like Mac OS X"
    const match = ua.match(/OS (\d+[._]\d+)/i);
    osVersion = match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
  } else if (deviceModel === "Unknown Device" && /iPad/i.test(ua)) {
    deviceModel = `Apple iPad (${browserName})`;
    osVersion = "iPadOS";
  }

  // 3. Android fallback if client hints didn't supply model
  if (deviceModel === "Unknown Device" && /Android/i.test(ua)) {
    // Regex extract model if present in older UA
    const match = ua.match(/Android\s+([0-9.]+);?\s*([^;)]+)?/i);
    const version = match?.[1] ? `Android ${match[1]}` : "Android";
    const rawModel = match?.[2]?.trim();

    if (rawModel && rawModel !== "K" && !rawModel.includes("Build")) {
      deviceModel = `${rawModel} (${browserName})`;
    } else {
      deviceModel = `Android Phone (${browserName})`;
    }
    osVersion = version;
  }

  // 4. Desktop fallbacks
  if (deviceType === "desktop") {
    if (ua.includes("Windows NT 10.0")) {
      osVersion = "Windows 10/11";
      deviceModel = `Windows PC (${browserName.replace("Mobile ", "")})`;
    } else if (ua.includes("Macintosh")) {
      osVersion = "macOS";
      deviceModel = `Mac (${browserName.replace("Mobile ", "")})`;
    } else if (ua.includes("Linux")) {
      osVersion = "Linux";
      deviceModel = `Linux PC (${browserName.replace("Mobile ", "")})`;
    } else {
      deviceModel = `Desktop PC (${browserName.replace("Mobile ", "")})`;
    }
  }

  cachedDeviceInfo = {
    deviceType,
    deviceModel,
    osVersion,
    location: cachedLocation,
    timeZone,
  };

  return cachedDeviceInfo;
}

/**
 * Requests high-accuracy HTML5 Geolocation permission from the user's browser.
 * Sets permission status in localStorage and returns the resolved city/country.
 */
export async function requestDeviceLocationPermission(): Promise<string> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    if (typeof window !== "undefined") {
      localStorage.setItem("qefas_location_granted", "false");
    }
    return getTimezoneLocation();
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          localStorage.setItem("qefas_location_granted", "true");
          // Reverse-geocode coordinates via open reverse geocoding API
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (response.ok) {
            const data = await response.json();
            const city = data.city || data.locality || data.principalSubdivision;
            const country = data.countryName;
            if (city && country) {
              const locationStr = `${city}, ${country}`;
              localStorage.setItem("qefas_device_location", locationStr);
              if (cachedDeviceInfo) cachedDeviceInfo.location = locationStr;
              resolve(locationStr);
              return;
            }
          }
        } catch (e) {
          console.warn("Reverse geocode lookup error:", e);
        }

        // Fallback to timezone location
        const fallback = getTimezoneLocation();
        localStorage.setItem("qefas_device_location", fallback);
        resolve(fallback);
      },
      (error) => {
        console.info("Location permission denied or unavailable:", error.message);
        localStorage.setItem("qefas_location_granted", "false");
        const fallback = getTimezoneLocation();
        resolve(fallback);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000 * 60 * 60, // 1 hour cache
      }
    );
  });
}

/**
 * Checks whether location permission was granted by the user.
 */
export function isLocationPermissionGranted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("qefas_location_granted") === "true";
}

