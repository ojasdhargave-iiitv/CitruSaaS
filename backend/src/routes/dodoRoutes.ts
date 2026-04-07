import { Router } from 'express';
import { checkoutHandler } from '@dodopayments/express';

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

export default router;
