import { type Request, type Response } from "express";
import { boilerplateSchema } from "../config/schema.js";
import { generateProject } from "../services/generator_service.js";

export const generateBoilerplate = async (
  req: Request,
  res: Response
) => {
  try {
    const config = boilerplateSchema.parse(req.body);
    await generateProject(config);

    res.json({ message: "Boilerplate generation started" });
  } catch (err: any) {
    res.status(400).json({ error: err.errors ?? err.message });
  }
};
