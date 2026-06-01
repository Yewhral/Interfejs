import siteConfigData from './site-configs.json';

export type SiteConfig = {
	key: string;
	title: string;
	headline: string;
	description: string;
	accent: string;
};

export const siteConfigs: Record<string, SiteConfig> = Object.fromEntries(
	Object.entries(siteConfigData).map(([key, config]) => [key, { key, ...config }]),
);

export const defaultSiteConfig: SiteConfig = {
	key: 'default',
	title: 'Default Home',
	headline: 'Default view',
	description: 'Nie znaleziono konfiguracji dla tej subdomeny.',
	accent: '#475569',
};

export function getSiteConfig(hostname: string): SiteConfig {
	const workerName = hostname.split('.')[0]?.toLowerCase();

	if (!workerName) {
		return defaultSiteConfig;
	}

	return siteConfigs[workerName] ?? defaultSiteConfig;
}
