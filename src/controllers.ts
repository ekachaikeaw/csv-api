import { Request, Response } from "express";
import { processCSV } from "./csvProcesser";
import pool from './database'

export const uploadCSV = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: "please upload csv" });
    return;
  }

  try {
    await processCSV(req.file.path);
    res.json({ message: "completely upload and save" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed uploading file" });
  }
};

export const getData = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    const countResult = await client.query("SELECT COUNT(*) FROM products");
    client.release();

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      page,
      limit,
      totalItems,
      totalPages,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "retrieving data error" });
  }
}
