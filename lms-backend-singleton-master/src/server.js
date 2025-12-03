import dotenv from "dotenv";
import app from "./app.js";
import { initDb } from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to init DB", err);
  });

