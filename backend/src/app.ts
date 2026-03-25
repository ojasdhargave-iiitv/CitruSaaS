import express, { type Application } from "express";
import cors from "cors";
import generateRoutes from "./routes/generator_route.js";
import fileRoutes from "./routes/fileRoutes.js";
import oauthRoutes from "./oauth.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const app: Application = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: process.env.FRONTEND_URL ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));
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

app.use("/api", generateRoutes);
app.use("/api", fileRoutes);
app.use("/api/users", userRoutes);
app.use("/api", projectRoutes);
app.use("/auth", oauthRoutes);

export default app;