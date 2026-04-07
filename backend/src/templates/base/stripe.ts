// ════════════════════════════════════════════════════════════
// STRIPE PAYMENT MODULE — TypeScript
// File: stripe.ts
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install stripe

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// STRIPE_SECRET_KEY=sk_test_xxx
// STRIPE_WEBHOOK_SECRET=whsec_xxx
// STRIPE_PRICE_ID=price_xxx

// ─── 3. IMPORTS ─────────────────────────────────────────────
import { Request, Response, Router } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// ─── 4. CREATE CHECKOUT SESSION ─────────────────────────────
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session failed" });
  }
};

// ─── 5. WEBHOOK HANDLER (IMPORTANT) ─────────────────────────
export const handleWebhook = (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed":
        console.log("Payment successful");
        // TODO: upgrade user to premium in DB
        break;

      case "invoice.payment_failed":
        console.log("Payment failed");
        // TODO: downgrade user
        break;

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(400).send("Webhook Error");
  }
};

// ─── 6. ROUTER ───────────────────────────────────────────────
export const stripeRouter = Router();

stripeRouter.post("/create-checkout", createCheckoutSession);

// NOTE: raw body needed for webhook
stripeRouter.post(
  "/webhook",
  require("express").raw({ type: "application/json" }),
  handleWebhook
);

// ─── 7. APP INTEGRATION (app.ts) ─────────────────────────────
// import express from "express";
// import { stripeRouter } from "./stripe";
//
// const app = express();
//
// app.use("/api/stripe", stripeRouter);
//
// app.listen(3000);