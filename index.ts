import express, { Express, Request, Response } from "express";
import colors from "colors";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app: Express = express();
dotenv.config({ path: ".env" });

const port = process.env.PORT || 5500;
app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/transaction", transactionRoutes);

app.listen(port, () => {
  console.log(colors.italic(`App running on port : ${port as string}`));
});
