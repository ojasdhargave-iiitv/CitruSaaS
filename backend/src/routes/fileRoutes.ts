import { Router } from "express";
import { createFile, saveFile, getFile, listFiles } from "../controllers/fileController.js";

const router = Router();

router.post("/files/create", createFile);
router.post("/files/save", saveFile);
router.get("/files/content", getFile);
router.get("/files/list", listFiles);

export default router;
