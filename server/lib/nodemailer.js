import nodemailer from "nodemailer";

// crea el trasporter para enviar emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.AUTH_USER,
    pass: process.env.AUTH_PASS,
  },
});

// envia el status de la sesion al mail deseado (campo to)

export async function sendMail(sessionStatus) {
  return await transporter.sendMail({
    from: process.env.EMAIL_SENDER,
    to: "wasd12.ns@gmail.com",
    subject: "Whatsapp bot session status",
    text: `Bot Session Status: ${sessionStatus}`,
  });
}
