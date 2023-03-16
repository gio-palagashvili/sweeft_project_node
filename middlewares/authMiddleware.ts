import jwt from "jsonwebtoken";
import db from "../database/db";
import { Request, Response, NextFunction } from "express";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.header("authorization")?.startsWith("Bearer")) {
    try {
      const token: any = req?.header("authorization")?.split(" ")[1];

      const user: any = jwt.decode(token, process.env.JWT?.toString() as any);
      const getUser = await db.query("SELECT * FROM users_tbl WHERE id = $1", [
        user?.id,
      ]);
      if (getUser.rowCount == 0) {
        return res.status(404).json({ message: "Invalid token" });
      }

      res.locals.user = getUser.rows[0];
      return next();
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  } else {
    return res.status(401).json({ message: "No token" });
  }
};
export default authMiddleware;
