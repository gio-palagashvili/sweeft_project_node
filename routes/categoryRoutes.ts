import express, { Router } from "express";
import { createCategory, deleteCategory, editCategory } from "../controllers/categoryController";
import authMiddleware from "../middlewares/authMiddleware";
const router: Router = express.Router();

router
    .post("/create", authMiddleware, createCategory)
    .patch("/:id", authMiddleware, editCategory)
    .delete("/:id", authMiddleware, deleteCategory)

export default router;
