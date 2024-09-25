import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import db from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    try {
      const { rows } = await db.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
        [email, hashedPassword]
      );
      const newUser = rows[0];
      await sendEmailToAdmin(email)
      res.status(200).json({ message: "User created successfully", user: newUser })
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Error creating user" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}

async function sendEmailToAdmin(newUserEmail) {
  let transporter = nodemailer.createTransport({
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Your App" <noreply@yourapp.com>',
    to: "admin@example.com",
    subject: "New User Registration",
    text: `A new user has registered with the email: ${newUserEmail}`,
    html: `<p>A new user has registered with the email: <strong>${newUserEmail}</strong></p>`,
  });
}