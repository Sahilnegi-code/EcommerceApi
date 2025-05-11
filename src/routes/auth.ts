import { Router } from "express";
import { signUp, login, me } from "../controllers/auth";
import { errorHandler } from "../error-handler";
import authMiddleware from "../middlewares/auth";
const authRoutes: Router = Router();

authRoutes.post("/login", errorHandler(login));
authRoutes.get("/me", [authMiddleware], errorHandler(me));
authRoutes.post("/signup", errorHandler(signUp));
export default authRoutes;
