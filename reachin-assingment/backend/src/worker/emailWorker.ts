import { Worker } from "bullmq";
import { redisConnection } from "../queue/connection";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { AppDataSource } from "../config/db";
import { Email } from "../entities/Email";

dotenv.config();

async function startWorker() {

  // Connect DB
  await AppDataSource.initialize();
  console.log("Worker DB Connected");

  // Create Ethereal Account
  const testAccount = await nodemailer.createTestAccount();

  console.log("Ethereal Account Created");

  // Create Transporter
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Create Worker
  new Worker(
    "emailQueue",
    async (job) => {


      const repo = AppDataSource.getRepository(Email);

      const email = await repo.findOneBy({ id: job.data.emailId });

      if (!email) {
        console.log("Email not found");
        return;
      }

      if (email.status === "sent") {
        console.log("Already sent");
        return;
      }


      const info = await transporter.sendMail({
        from: '"ReachInbox" <no-reply@reachinbox.ai>',
        to: email.to,
        subject: email.subject,
        text: email.body,
      });


      const previewUrl = nodemailer.getTestMessageUrl(info);

      email.previewUrl=previewUrl || ""
      email.status = "sent";
      await repo.save(email);

    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );
}

startWorker().catch((err) => {
  console.error("Worker startup failed:", err);
});
