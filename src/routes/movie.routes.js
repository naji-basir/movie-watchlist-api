import express from "express";
const movieRouter = express.Router();

movieRouter.get("/", (req, res) => {
  res.json({ message: "Hello,Welcome To Movies World!" });
});

export default movieRouter;
