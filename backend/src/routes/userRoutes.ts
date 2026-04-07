import { Router } from "express";
import usermiddleware from "../services/userMiddlerware.js";
import { userSignupPost, userLoginPost, upgradePremium, downgradePremium } from "../controllers/userController.js";

const router = Router();

// auth
router.post("/signup", userSignupPost); //working
router.post("/login", userLoginPost); //working
router.get("/auth/verify", usermiddleware, (req: any, res: any) => {
  // If middleware passes, user is authenticated
  res.status(200).json({
    authorized: true,
    userId: req.user.userId,
    username: req.user.username
  });
});
router.put("/premium", upgradePremium);
router.put("/premium/cancel", downgradePremium);

export default router;