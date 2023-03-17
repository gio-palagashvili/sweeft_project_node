import express, { Router } from "express";
import { createTransaction, getTransactionById, searchTransaction } from "../controllers/transactionControler";
import authMiddleware from "../middlewares/authMiddleware";
const router: Router = express.Router();

router
    .post("/create", authMiddleware, createTransaction)
    .post("/search", authMiddleware, searchTransaction)
    .get("/:id", authMiddleware, getTransactionById)

export default router;
