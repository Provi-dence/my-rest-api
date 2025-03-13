import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

import { userRouter } from "./users/users.routes";

dotenv.config();

if (!process.env.PORT) {
  console.log("No port value specified...");
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7000; // Default to 7000

const app = express();

// ✅ Middleware (Must be before routes!)
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded
app.use(cors());
app.use(helmet());

// ✅ Routes
app.use("/", userRouter);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
