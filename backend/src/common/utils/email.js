import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import { logger } from "../config/logger.js";

const TOKEN = process.env.EMAIL_TOKEN;

const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  }),
);

const sender = {
  address: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};

const sendMail = async (email, msg) => {
  try {
    const info = await transport.sendMail({
      from: sender,
      to: email,
      subject: "You are awesome!",
      text: msg,
    });

    logger.info({ info, email }, "Email sent successfully");
  } catch (error) {
    logger.error({ err: error, email }, "Failed to send email");
  }
};

const sendVerificationEmail = async (email, token) => {
  try {
    const info = await transport.sendMail({
      from: sender,
      to: email,
      subject: "Email Verification",
      text: `Your verification token is: ${token}`,
    });

    logger.info({ info, email }, "Verification email sent successfully");
  } catch (error) {
    logger.error({ err: error, email }, "Failed to send verification email");
  }
};

export { sendMail, sendVerificationEmail };