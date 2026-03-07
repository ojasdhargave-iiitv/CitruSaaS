import express, {} from "express";
import cors from "cors";
import generateRoutes from "./routes/generator_route.js";
import fileRoutes from "./routes/fileRoutes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>CitruSaaS</title></head>
      <body>
        <h1>CitruSaaS API</h1>
      </body>
    </html>
  `);
});
import userRoutes from "./routes/userRoutes.js";
app.use("/api", generateRoutes);
app.use("/api", fileRoutes);
app.use("/api/users", userRoutes);
export default app;
//# sourceMappingURL=app.js.map