import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/db";
import emailRoutes from "./routes/emailRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api", emailRoutes);

AppDataSource.initialize().then(() => {
  console.log("DB Connected");

  app.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
  });

});
