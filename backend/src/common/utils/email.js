import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

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

    console.log(info);
  } catch (error) {
    console.error(error);
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

    console.log(info);
  } catch (error) {
    console.error(error);
  }
};

export { sendMail, sendVerificationEmail };