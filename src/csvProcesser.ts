import fs from "fs";
import { parse } from "fast-csv";
import pool from "./database";
import { error } from "console";

interface Product {
  Brand: string;
  Description: string;
  Price: number;
  Size: string;
  Volume: number;
  Classification: string;
  PurchasePrice: number;
  VendorNumber: string;
  VendorName: string;
}

export const processCSV = async (filePath: string): Promise<void> => {
  const stream = fs.createReadStream(filePath);
  const rows: Product[] = [];

  return new Promise((resolve, reject) => {
    stream
      .pipe(parse({ headers: true }))
      .on("data", (row) => {
        rows.push({
          Brand: row.Brand,
          Description: row.Description,
          Price: row.Price,
          Size: row.Size,
          Volume: parseInt(row.Volume) || 0,
          Classification: row.Classification,
          PurchasePrice: row.PurchasePrice,
          VendorNumber: row.VendorNumber,
          VendorName: row.VendorName,
        });
      })
      .on("end", async () => {
        try {
          const client = await pool.connect();
          for (const row of rows) {
            await client.query(
              "INSERT INTO products (brand, description, price, size, volume, classification, purchaseprice, vendornumber, vendorname) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
              [
                row.Brand,
                row.Description,
                row.Price,
                row.Size,
                row.Volume,
                row.Classification,
                row.PurchasePrice,
                row.VendorNumber,
                row.VendorName,
              ]
            );
          }
          client.release();
          fs.unlinkSync(filePath);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error)
      })
  });
};
