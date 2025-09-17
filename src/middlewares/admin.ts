import { NextFunction, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { CustomRequest } from "../types/express";

const adminMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user?.role === "ADMIN") {
    next();
    return;
  } else {
    next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
  }
};

export default adminMiddleware;
