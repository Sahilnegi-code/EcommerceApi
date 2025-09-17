import express, { Express } from "express";
import expressContext from "express-request-context";
import { PORT } from "./secrets";
import { rootRouter } from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors";
const app: Express = express();
app.use(expressContext());
app.use(express.json());
app.use("/api", rootRouter);
export const prismaClient = new PrismaClient({
  log: ["query"],
}).$extends({
  result: {
    address: {
      formatAddress: {
        needs: {
          lineOne: true,
          lineTwo: true,
          city: true,
          country: true,
          pincode: true,
        },
        compute: (address) => {
          return `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.country} - ${address.pincode}`;
        },
      },
    },
  },
});
app.use(errorMiddleware);
app.listen(PORT);
