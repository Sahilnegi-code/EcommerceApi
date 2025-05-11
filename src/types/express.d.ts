import { User } from "@prisma/client";
import express, { Request, Response } from "express";
// declare global {
//   namespace Express {
//     interface Request {
//       user?: User;
//     }
//   }
// }

export interface CustomRequest extends Request {
  user?: User;
}

export interface CustomResponse extends Response {
  user?: User;
}
