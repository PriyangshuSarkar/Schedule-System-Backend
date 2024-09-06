import cookieParser from "cookie-parser";
import express, { json, type Express } from "express";
import { dbConnection } from "./database/dbConnection";
import { errorHandler } from "./middlewares/errorHandler";
import rootRouter from "./routes";

const app: Express = express();

app.use(cookieParser());
app.use(json());

// *Connect to Mongo DB
dbConnection();

// *Routes
app.use("/api", rootRouter);

// *Middleware to handel errors
app.use(errorHandler);

// *Server Start
const port = process.env.PORT ?? 4000;
app.listen(port, (err?: any) => {
  if (err) {
    console.log(`Server failed to start with the error:\n${err}`);
  } else {
    console.log(`App working at http://localhost:${process.env.PORT}`);
  }
});
