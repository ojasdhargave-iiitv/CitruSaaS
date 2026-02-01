import express, { type Application } from "express";
import cors from "cors";
import generateRoutes from "./routes/generator_route.js";

const app: Application = express();

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

app.use("/api", generateRoutes);

export default app;
