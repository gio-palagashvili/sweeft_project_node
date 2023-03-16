import db from "../database/db";
import { Request, Response } from "express";

export const createTransaction = async (req: Request, res: Response) => {
    let { description, amount, status, type, categories } = req.body;
    try {
        status = status.toLowerCase();
        type = type.toLowerCase();

        if (status != "completed" && status != "processing") return res.status(400).json({ message: "status can only be completed or processing" });
        if (type != "income" && type != "expense") return res.status(400).json({ message: "type can only be expense or income" });
        if (!description) return res.status(400).json({ message: "description is required" });
        if (typeof amount != "number") return res.status(400).json({ message: "amount can only be a number" });
        if (!Array.isArray(categories)) return res.status(400).json({ message: "categories must be an array (empty array for default category)" })

        const { rows, rowCount } = await db.query<{ id: number }>(`INSERT INTO transactions_tbl (description, amount, user_id, status, type) 
        VALUES ($1, $2, $3, $4, $5) returning id`, [description, amount, res.locals.user.id, status, type]);

        if (categories.length == 0) {
            const defaultId = await db.query<{ id: string }>("SELECT id FROM categories_tbl WHERE user_id = $1 AND name = 'default'", [res.locals.user.id]);
            categories = [defaultId.rows[0].id]
        }

        const insertCategoryQuery = `INSERT INTO transaction_categories_tbl (transaction_id, category_id,user_id) VALUES ($1, $2, $3)`;

        for (const categoryId of categories) {
            const categoryValues = [rows[0].id, categoryId, res.locals.user.id];
            await db.query(insertCategoryQuery, categoryValues);
        }
        res.sendStatus(200)
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
}
export const getTransactionById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { rows, rowCount } = await db.query("select * from transactions_tbl where id = $1 and user_id = $2", [id, res.locals.user.id])
        if (rowCount == 0) return res.status(404).json({ message: "invalid id" });
        return res.status(200).json({ transaction: rows[0] })
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
}
export const searchTransaction = async (req: Request, res: Response) => {
    let { description, filter, sort } = req.body;
    try {
        const { period, amount, status } = filter;
        let baseQuery = `SELECT * FROM transactions_tbl WHERE user_id = $1`;

        if (!description && !filter && !sort) {
            return res.status(400).json({ message: "provide atleas one search term" })
        }

        if (description) {
            baseQuery += ` AND description LIKE '%${description.toString()}%'`
        }

        if (period) {
            const { from, to } = period;
            if (!to) {
                baseQuery += ` AND DATE(created_at) >= '${from}'`;
            }
            if (!from) {
                baseQuery += ` AND DATE(created_at) <= '${to}'`;
            } if (from && to) {
                baseQuery += ` AND DATE(created_at) >= '${from}' AND DATE(created_at) <= '${to}'`;
            }
        }
        if (amount) {
            const { min, max } = amount;
            if (!min) {
                baseQuery += ` AND amount <= '${max}'`;
            }
            if (!max) {
                baseQuery += ` AND amount >= '${min}'`;
            } if (min && max) {
                baseQuery += ` AND amount >= '${min}' AND amount <= '${max}'`;
            }
        }
        if (sort?.by && sort?.order) {
            const { by, order } = sort;
            baseQuery += ` ORDER by ${by} ${order}`;
        }
        if (status) {
            baseQuery += ` AND status = '${status}'`;
        }

        const result = (await db.query(baseQuery, [res.locals.user.id])).rows;
        return res.status(200).json(result)

    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
}
