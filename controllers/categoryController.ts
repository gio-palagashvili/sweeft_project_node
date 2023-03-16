import db from "../database/db";
import { Request, Response } from "express";

export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "category name is required" });
    }
    try {
        const duplicateCategory = await db.query(
            "SELECT id from categories_tbl where name = $1 and user_id = $2",
            [name.trim(), res.locals.user.id]
        );

        if (duplicateCategory.rowCount > 0) return res.status(400).json({ message: "the category name already exists" });

        const create = await db.query<{ id: number }>(
            "insert into categories_tbl(name,user_id) values($1,$2) returning id",
            [name.trim(), res.locals.user.id]
        );

        return res.status(201).json({
            message: `category '${name}' created with id of '${create.rows[0].id}'`,
        });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};
export const editCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) res.status(400).json({ message: "provide a new name for the category" });

    try {
        const renameCat = await
            db.query<{ name: string }>("update categories_tbl set name = $1 where id = $2 and user_id = $3",
                [name, id, res.locals.user.id]);

        if (renameCat.rowCount == 0) return res.status(404).json({ message: "Invalid id" });

        res.status(200).json({ message: `updated category by the id of ${id}` })
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const defaultId = await db.query<{ id: string }>("SELECT id FROM categories_tbl WHERE user_id = $1 AND name = 'default'", [res.locals.user.id]);
        if (defaultId.rowCount == 0) return res.status(404).json({ message: "invalid id" });
        const { rowCount } = await db.query("UPDATE transaction_categories_tbl SET category_id = $1 WHERE category_id = $2", [defaultId.rows[0].id, id])
        await db.query("delete from categories_tbl where id = $1 and user_id = $2", [id, res.locals.user.id])

        res.sendStatus(204);
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
}