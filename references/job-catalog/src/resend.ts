import { createExpressServer } from "@trigger.dev/express";
import { Resend } from "@trigger.dev/resend";
import { TriggerClient, eventTrigger, invokeTrigger } from "@trigger.dev/sdk";
import { z } from "zod";

export const client = new TriggerClient({
  id: "job-catalog",
  apiKey: process.env["TRIGGER_API_KEY"],
  apiUrl: process.env["TRIGGER_API_URL"],
  verbose: false,
  ioLogLocalEnabled: true,
});

const resend = new Resend({
  id: "resend-client",
  apiKey: process.env.RESEND_API_KEY!,
});

client.defineJob({
  id: "send-resend-email",
  name: "Send Resend Email",
  version: "0.1.0",
  trigger: invokeTrigger({
    schema: z.object({
      to: z.union([z.string(), z.array(z.string())]).default("eric@trigger.dev"),
      subject: z.string().default("This is a test email"),
      text: z.string().default("This is a test email"),
    }),
  }),
  integrations: {
    resend,
  },
  run: async (payload, io, ctx) => {
    const response = await io.resend.emails.send("📧", {
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      from: "Trigger.dev <hello@email.trigger.dev>",
    });

    await io.logger.info("Sent email", { response });

    const emailDetails = await io.resend.emails.get("get-email", response.id);
  },
});

client.defineJob({
  id: "batch-send-resend-email",
  name: "Batch Send Resend Email",
  version: "0.1.0",
  trigger: invokeTrigger({
    schema: z.object({
      to: z.union([z.string(), z.array(z.string())]).default("eric@trigger.dev"),
      subject: z.string().default("This is a test email"),
      text: z.string().default("This is a test email"),
    }),
  }),
  integrations: {
    resend,
  },
  run: async (payload, io, ctx) => {
    const response = await io.resend.batch.send("📧", [
      {
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        from: "Trigger.dev <hello@email.trigger.dev>",
      },
      {
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        from: "Trigger.dev <hello@email.trigger.dev>",
      },
    ]);

    await io.logger.info("Sent batched email", { response });
  },
});

client.defineJob({
  id: "send-resend-email-deprecated",
  name: "Send Resend Email Deprecated",
  version: "0.1.0",
  trigger: invokeTrigger({
    schema: z.object({
      to: z.union([z.string(), z.array(z.string())]).default("eric@trigger.dev"),
      subject: z.string().default("This is a test email"),
      text: z.string().default("This is a test email"),
    }),
  }),
  integrations: {
    resend,
  },
  run: async (payload, io, ctx) => {
    const response = await io.resend.sendEmail("📧", {
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      from: "Trigger.dev <hello@email.trigger.dev>",
    });

    await io.logger.info("Sent email", { response });
  },
});

client.defineJob({
  id: "send-resend-email-from-blank",
  name: "Send Resend Email From Blank",
  version: "0.1.0",
  trigger: eventTrigger({
    name: "send.email",
    schema: z.object({
      to: z.union([z.string(), z.array(z.string())]),
      subject: z.string(),
      text: z.string(),
      from: z.string().optional(),
    }),
  }),
  integrations: {
    resend,
  },
  run: async (payload, io, ctx) => {
    const response = await io.resend.sendEmail("📧", {
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      from: payload.from!,
    });

    await io.logger.info("Sent email", { response });
  },
});

createExpressServer(client);
