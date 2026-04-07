// ════════════════════════════════════════════════════════════
// STRIPE PAYMENT MODULE — JavaScript
// File: stripe.js
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install stripe

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// STRIPE_SECRET_KEY=sk_test_xxx
// STRIPE_WEBHOOK_SECRET=whsec_xxx
// STRIPE_PRICE_ID=price_xxx

// ─── 3. IMPORTS ─────────────────────────────────────────────
const express = require("express");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── 4. CREATE CHECKOUT SESSION ─────────────────────────────
const createCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
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

// ─── 5. WEBHOOK HANDLER ─────────────────────────────────────
const handleWebhook = (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed":
        console.log("Payment successful");
        break;

      case "invoice.payment_failed":
        console.log("Payment failed");
        break;

      default:
        console.log("Unhandled event:", event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(400).send("Webhook Error");
  }
};

// ─── 6. ROUTER ───────────────────────────────────────────────
const stripeRouter = express.Router();

stripeRouter.post("/create-checkout", createCheckoutSession);

stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// ─── 7. APP INTEGRATION ─────────────────────────────────────
// const express = require("express");
// const { stripeRouter } = require("./stripe");
//
// const app = express();
// app.use("/api/stripe", stripeRouter);
//
// app.listen(3000);

// ─── EXPORTS ────────────────────────────────────────────────
module.exports = { stripeRouter };