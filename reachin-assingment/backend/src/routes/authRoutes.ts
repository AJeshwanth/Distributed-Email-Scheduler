import { Router, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { AppDataSource } from "../config/db";
import { User } from "../entities/User";   // IMPORTANT: Capital U

const router = Router();

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

router.post("/google", async (req: Request, res: Response) => {

  try {

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Google token missing" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token as string,
      audience: process.env.GOOGLE_CLIENT_ID as string
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token payload" });
    }

    const userRepo = AppDataSource.getRepository(User);

    let user = await userRepo.findOneBy({ email: payload.email });

    if (!user) {

      user = userRepo.create({
        email: payload.email,
        name: payload.name || "Google User",
        picture: payload.picture || ""
      });

      await userRepo.save(user);
    }

    return res.json(user);

  } catch (error) {

    console.error("Google Auth Error:", error);

    return res.status(500).json({ error: "Google authentication failed" });
  }

});

export default router;
