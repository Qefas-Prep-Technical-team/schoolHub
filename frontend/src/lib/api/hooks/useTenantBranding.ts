"use client";
import { useState, useEffect } from "react";
import { useSchoolLandingPageBySubdomain } from "./useSchool";

export function useTenantBranding() {
  const [tenant, setTenant] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      
      // Filter out main domains
      const isLocalhost = hostname.includes("localhost");
      const isLvh = hostname.includes("lvh.me");
      
      let extractedTenant = null;
      if (isLocalhost || isLvh) {
        if (parts.length > (isLvh ? 2 : 1)) {
          extractedTenant = parts[0];
        }
      } else {
        if (parts.length > 2 && parts[0] !== "www") {
          extractedTenant = parts[0];
        }
      }

      // Ignore specific system prefixes and the main brand name
      if (extractedTenant && !["www", "app", "admin", "api", "dashboard", "schoolhub", "flexiti", "qefashub"].includes(extractedTenant)) {
        setTenant(extractedTenant);
      }
    }
  }, []);

  const { data: landingData, isLoading } = useSchoolLandingPageBySubdomain(tenant || "");

  const branding = {
    isBranded: !!tenant && !!landingData,
    tenant,
    schoolName: landingData?.schoolName || null,
    logo: landingData?.schoolLogo || null,
    primaryColor: landingData?.landingPage?.primaryColor || "#4f46e5", // Indigo default
    heroTitle: landingData?.landingPage?.heroTitle || null,
    heroSubtitle: landingData?.landingPage?.heroSubtitle || landingData?.schoolMotto || null,
    heroImage: landingData?.landingPage?.heroImage || null,
  };

  return { branding, isLoading };
}
