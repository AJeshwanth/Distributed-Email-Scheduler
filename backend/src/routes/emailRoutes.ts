import { Router } from "express";
import { AppDataSource } from "../config/db";
import { Email } from "../entities/Email";
import { emailQueue } from "../queue/connection";

const router = Router();

// -------------------- SCHEDULE EMAIL --------------------

router.post("/schedule", async (req, res) => {

  const { to, subject, body, scheduledTime, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID missing" });
  }

  const repo = AppDataSource.getRepository(Email);

  const email = repo.create({
    to,
    subject,
    body,
    scheduledTime,
    userId
  });

  const saved = await repo.save(email);

  const delay = new Date(scheduledTime).getTime() - Date.now();

  await emailQueue.add(
    "sendEmail",
    { emailId: saved.id },
    {
      delay,
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 60000
      }
    }
  );

  res.json({ success: true, id: saved.id });
});

// -------------------- GET SCHEDULED EMAILS (USER) --------------------

router.get("/scheduled/:userId", async (req, res) => {

  const userId = Number(req.params.userId);

  const repo = AppDataSource.getRepository(Email);

  const emails = await repo.find({
    where: {
      status: "scheduled",
      userId
    },
    order: {
      id: "DESC"
    }
  });

  res.json(emails);
});

// -------------------- GET SENT EMAILS (USER) --------------------

router.get("/sent/:userId", async (req, res) => {

  const userId = Number(req.params.userId);

  const repo = AppDataSource.getRepository(Email);

  const emails = await repo.find({
    where: {
      status: "sent",
      userId
    },
    order: {
      id: "DESC"
    }
  });

  res.json(emails);
});

export default router;
