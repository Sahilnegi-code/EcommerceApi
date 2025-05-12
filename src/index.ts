import express, { Express, Request, Response } from "express";
import expressContext from "express-request-context";
import { PORT } from "./secrets";
import { rootRouter } from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors";
import { signupSchema } from "./schema/users";
const app: Express = express();
app.use(expressContext());
app.use(express.json());
app.use("/api", rootRouter);
console.log(PORT);
export const prismaClient = new PrismaClient({
  log: ["query"],
});
app.use(errorMiddleware);
app.listen(PORT, () => console.log("Hello"));
