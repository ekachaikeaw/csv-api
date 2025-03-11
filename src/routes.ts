import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import pool from "./database";
import * as controller from "./controllers";

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.post("/upload", upload.single("file"), controller.uploadCSV);

// http://localhost:3000/api/data?page=1&limit=10"
router.get("/data", controller.getData);

export default router;
