import { checkoutHandler, Webhooks } from '@dodopayments/express';
import { prisma } from '../config/prisma.js';
import express, { Router } from 'express';

const router = Router();

// Validate return URL to prevent invalid URL checkout errors.
const validateReturnUrl = (url: string | undefined) => {
    // Uses the provided URL if valid, defaults to frontend production domain when live, or localhost for local dev.
    return url && url.startsWith('http') 
        ? url 
        : (process.env.NODE_ENV === 'production' ? 'https://citrusaas.vercel.app/' : 'http://localhost:5173/');
};

router.post('/checkout', checkoutHandler({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY as string,
    returnUrl: validateReturnUrl(process.env.DODO_PAYMENTS_RETURN_URL),
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT as any,
    type: "session"
}));

router.post('/webhook', express.raw({ type: 'application/json' }), Webhooks({
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY as string,
    onPaymentSucceeded: async (event: any) => {
        const userId = event.data?.metadata?.userId;
        if (userId) {
            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: { isPremium: true }
                });
                console.log(`Successfully upgraded user ${userId} to premium via webhook.`);
            } catch (error) {
                console.error('Error upgrading user from webhook:', error);
            }
        }
    }
}));

export default router;
