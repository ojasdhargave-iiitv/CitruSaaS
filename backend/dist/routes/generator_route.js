import { Router } from "express";
import { generateBoilerplate } from "../controllers/generate_controller.js";
const router = Router();
router.post("/generate", generateBoilerplate);
export default router;
//# sourceMappingURL=generator_route.js.map