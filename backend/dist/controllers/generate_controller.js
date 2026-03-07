import {} from "express";
import { boilerplateSchema } from "../config/schema.js";
import { generateProject } from "../services/generator_service.js";
export const generateBoilerplate = async (req, res) => {
    try {
        const config = boilerplateSchema.parse(req.body);
        await generateProject(config);
        res.json({ message: "Boilerplate generation started" });
    }
    catch (err) {
        res.status(400).json({ error: err.errors ?? err.message });
    }
};
//# sourceMappingURL=generate_controller.js.map