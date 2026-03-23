import { Router } from "express";
import { createFile, createFolder, deleteItem, saveFile, getFile, listFiles, createTemplateFile, initWorkspace, loadProject } from "../controllers/fileController.js";

const router = Router();

router.post("/files/create", createFile);
router.post("/files/create-folder", createFolder);
router.post("/files/delete", deleteItem);
router.post("/files/save", saveFile);
router.post("/files/load", loadProject);
router.get("/files/content", getFile);
router.get("/files/list", listFiles);
router.post("/files/template", createTemplateFile);
router.post("/files/init", initWorkspace);

export default router;
