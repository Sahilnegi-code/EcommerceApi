import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";
import { errorHandler } from "../error-handler";
import {
  addAddress,
  changeUserRole,
  deleteAddress,
  getUserById,
  listAddress,
  listUsers,
  updateUser,
} from "../controllers/users";

const usersRoute = Router();
usersRoute.post("/address", [authMiddleware], errorHandler(addAddress));
usersRoute.delete(
  "/address/:id",
  [authMiddleware],
  errorHandler(deleteAddress)
);
usersRoute.get("/address", [authMiddleware], errorHandler(listAddress));
usersRoute.put(
  "/:id/role",
  [authMiddleware, adminMiddleware],
  errorHandler(changeUserRole)
);
usersRoute.get(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(getUserById)
);
usersRoute.get("/", [authMiddleware, adminMiddleware], errorHandler(listUsers));
usersRoute.put("/", [authMiddleware], errorHandler(updateUser));

export default usersRoute;
