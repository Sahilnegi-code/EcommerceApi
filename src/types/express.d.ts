import { User } from "@prisma/client";
import express, { Request, Response } from "express";

export interface CustomRequest extends Request {
  user?: User;
}

export interface CustomResponse extends Response {
  user?: User;
}
