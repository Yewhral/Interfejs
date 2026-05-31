export type SiteKey = "asd-interfejs" | "ddd-interfejs";

export type SiteConfig = {
  key: SiteKey;
  title: string;
  headline: string;
  description: string;
  accent: string;
};

export const siteConfigs: Record<SiteKey, SiteConfig> = {
  "asd-interfejs": {
    key: "asd-interfejs",
    title: "ASD Home",
    headline: "Home ASD",
    description: "Ten widok jest renderowany dla subdomeny ASD.",
    accent: "#2563eb",
  },
  "ddd-interfejs": {
    key: "ddd-interfejs",
    title: "DDD Home",
    headline: "Home DDD",
    description: "Ten widok jest renderowany dla subdomeny DDD.",
    accent: "#16a34a",
  },
};

export function getSiteConfig(hostname: string): SiteConfig {
  const subdomain = hostname.split(".")[0]?.toLowerCase();

  return (
    siteConfigs[subdomain as SiteKey] || {
      key: "def",
      title: "def Home",
      headline: "def def",
      description: "Ten widok jest renderowany dla subdomeny def view.",
      accent: "#2563eb",
    }
  );
}
