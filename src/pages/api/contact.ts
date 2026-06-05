import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });

const getRequiredString = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
};

const verifyTurnstile = async (token: string, ip: string | null) => {
  const secret = env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not configured.");
  }

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);

  if (ip) {
    body.append("remoteip", ip);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
    },
  );

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as TurnstileResponse;

  return result.success;
};

const sendToSlack = async ({
  email,
  message,
  host,
}: {
  email: string;
  message: string;
  host: string;
}) => {
  const webhookUrl = env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL is not configured.");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      text: `New contact message from ${email}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "New contact message from " + email,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Email:*\n${email}`,
            },
            {
              type: "mrkdwn",
              text: `*Host:*\n${host}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n${message}`,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Slack webhook rejected the message.");
  }
};

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return json({ message: "Invalid form payload." }, 400);
  }

  const email = getRequiredString(formData, "email");
  const message = getRequiredString(formData, "message");
  const host = getRequiredString(formData, "host");
  const turnstileToken = getRequiredString(formData, "cf-turnstile-response");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ message: "Please provide a valid email address." }, 400);
  }

  if (message.length < 10 || message.length > 1600) {
    return json(
      { message: "Please provide a message between 10 and 1600 characters." },
      400,
    );
  }

  if (!turnstileToken) {
    return json({ message: "Verification is required." }, 400);
  }

  const ip = request.headers.get("CF-Connecting-IP");
  const isVerified = await verifyTurnstile(turnstileToken, ip);

  if (!isVerified) {
    return json({ message: "Verification failed. Please try again." }, 400);
  }

  await sendToSlack({ email, message, host });

  return json({ message: "Message sent." });
};
