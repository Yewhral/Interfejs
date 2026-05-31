export type SiteKey = 'asd' | 'ddd';

export type SiteConfig = {
	key: SiteKey;
	title: string;
	headline: string;
	description: string;
	accent: string;
};

export const siteConfigs: Record<SiteKey, SiteConfig> = {
	asd: {
		key: 'asd',
		title: 'ASD Home',
		headline: 'Home ASD',
		description: 'Ten widok jest renderowany dla subdomeny ASD.',
		accent: '#2563eb',
	},
	ddd: {
		key: 'ddd',
		title: 'DDD Home',
		headline: 'Home DDD',
		description: 'Ten widok jest renderowany dla subdomeny DDD.',
		accent: '#16a34a',
	},
};

export function getSiteConfig(hostname: string): SiteConfig {
	const subdomain = hostname.split('.')[0]?.toLowerCase();

	if (subdomain === 'ddd') {
		return siteConfigs.ddd;
	}

	return siteConfigs.asd;
}
