import express from "express";
import router from "./routes/movie.routes.js";
import { config } from "dotenv";
import { connetDB, disconnetDB } from "./config/db.js";
const app = express();
config();
connetDB();

const PORT = 5001;

app.use("/movies", router);

const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}.`);
});
