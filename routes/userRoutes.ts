import express, { Router } from "express";
import { registerUser, loginUser, recoerPasswordGen, recoverPassword } from "../controllers/userController";
// import authMiddleware from "../middlewares/authMiddleware";
const router: Router = express.Router();

router
    .post("/register", registerUser)
    .post("/login", loginUser)
    .post("/recover", recoerPasswordGen)
    .post("/recover/link", recoverPassword)

export default router;
