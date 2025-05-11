import { Router } from "express";
import authRoutes from "./auth";
import productsRoutes from "./products";
export const rootRouter: Router = Router();
rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productsRoutes);
