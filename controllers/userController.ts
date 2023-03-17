import db from "../database/db";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { isEmail, generateLink } from "../utils/validators";
import nodemailer from "nodemailer";

export const registerUser = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Invalid data" });
  }
  try {
    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    const user = await db.query<{ email: string; id: number }>(
      "insert into users_tbl(email, password) values($1, $2) returning email, id",
      [email, password]
    );

    const { rowCount } = await db.query<{ id: number }>(
      "insert into categories_tbl(name, user_id) values($1,$2) returning id",
      ["default", user.rows[0].id]
    );

    if (rowCount == 0) {
      return res.status(400).json({
        message: "server error"
      });
    }

    return res.status(200).json({
      token: jwt.sign(user.rows[0], process.env.JWT as string, {
        expiresIn: "1d",
      }),
    });

  } catch (error: any) {
    return res.status(400).json({
      message: error.message.includes("users_tbl_email_key")
        ? "Email is already taken"
        : error.message,
    });
  }
};
export const loginUser = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Invalid data" });
  }
  try {
    let createUser = await db.query<{
      email: string;
      password: any;
      id: number;
    }>("SELECT * FROM users_tbl WHERE email = $1", [email]);

    if (createUser.rowCount == 0) {
      return res.status(400).json({ message: "Invalid data" });
    }
    if (!(await bcrypt.compare(password, createUser.rows[0].password))) {
      return res.status(400).json({ message: "Invalid data" });
    }

    delete createUser.rows[0].password;

    return res.status(200).json({
      token: jwt.sign(createUser.rows[0], process.env.JWT as string, {
        expiresIn: "1d",
      }),
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
export const recoerPasswordGen = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Invalid email" });

  let now = new Date();
  let time = new Date(now.setMinutes(now.getMinutes() + 15)).toISOString();
  const iden = generateLink();

  try {
    await db.query("UPDATE users_tbl SET reset_token = $1, token_expires = $2 WHERE email = $3", [iden, time, email]);

    // gmail no longer supports this function so you have to use mail.ru
    // let transporter = nodemailer.createTransport({
    //   host: 'smtp.mail.ru',
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user: 'youremail@mail.ru',
    //     pass: ''
    //   }
    // });

    // let mailOptions = {
    //   from: 'recover',
    //   to: email,
    //   subject: 'Password reocvery',
    //   html: `send a post request to this link with this id : ${iden} | <b>http://localhost:5500/user/recover/link</b>`
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     return console.log(error);
    //   }
    // });

    return res.status(200).json({ message: `send a post request to this link with this id : '${iden}' | <b>http://localhost:5500/user/recover/link` });
    // return res.status(200).json({ message: "if the email you've entered matches with any user, you will recieve the reset link." });

  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
}
export const recoverPassword = async (req: Request, res: Response) => {
  try {
    let { id, password } = req.body;
    if (!id || !password) return res.status(401).json({ message: "invalid data" });

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    let now = new Date().toISOString();
    const { rowCount } = await db.query("select * from users_tbl where reset_token = $1 AND token_expires > $2", [id, now])
    if (rowCount == 0) return res.sendStatus(404);
    const update = await db.query("update users_tbl set password = $1, reset_token = null, token_expires = null where reset_token = $2 and token_expires > $3", [password, id, now]);
    if (update.rowCount == 0) return res.status(400).json({ message: "something went wron" });

    return res.sendStatus(204);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
}
