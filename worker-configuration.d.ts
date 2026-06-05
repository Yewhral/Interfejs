interface Env {
  TURNSTILE_SECRET_KEY: string;
  SLACK_WEBHOOK_URL: string;
}

declare module "cloudflare:workers" {
  export const env: Env;
}
