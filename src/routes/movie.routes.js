import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello,Welcome To Movies World!" });
});

export default router;
