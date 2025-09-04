import { prismaClient } from "../index";
import { NextFunction, Request, Response } from "express";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { UnprocessableEntity } from "../exceptions/validations";
import { ErrorCode } from "../exceptions/root";
import { BadRequestException } from "../exceptions/bad-requests";
import { signupSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";
import { CustomRequest } from "../types/express";
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user: any = await prismaClient.user.findFirst({ where: { email } });
    if (!user) {
      throw new NotFoundException("User not found.", ErrorCode.USER_NOT_FOUND);
    }
    if (!compareSync(password, user?.password)) {
      throw new BadRequestException(
        "Incorrect password",
        ErrorCode.INCORRECT_PASSWORD
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );
    res.status(200).json({ user, token });
  } catch (err: any) {
    next(
      new UnprocessableEntity(
        err?.issues,
        "Unprocessable Entity",
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    );

    res.status(500).json({ message: err });
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  signupSchema.parse(req.body);
  const { email, password, name } = req.body;
  let user = await prismaClient.user.findFirst({ where: { email } });

  if (user) {
    new BadRequestException(
      "User already exists!",
      ErrorCode.USER_ALREADY_EXISTS
    );
  }

  user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
    },
  });

  return res.status(201).json(user);
};
export const me = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  res.json(req.user);
};
