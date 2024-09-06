import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(String(process.env.MONGO_URI))
    .then(() => {
      console.log("Connected to Database");
    })
    .catch((err) => {
      console.error("Error:", err);
    });
};
