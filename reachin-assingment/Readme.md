ReachInbox Email Scheduler

This project is a production-style email scheduling system with persistent background jobs, Google authentication, and a real-time dashboard.

Tech Stack

Backend: Express.js, TypeScript, BullMQ, Redis (Memurai), PostgreSQL
Frontend: React (Vite + TypeScript), Google OAuth, Axios
Queue System: BullMQ (Redis-backed job queue)
Email Service: Ethereal Email (Fake SMTP for testing)

Architecture Overview

The system follows a queue-based scheduling architecture. PostgreSQL is used to store user information and email metadata. BullMQ schedules delayed email jobs using Redis as persistent storage. A separate worker process consumes these jobs and sends emails using SMTP. This design ensures high reliability, scalability, and persistence even after server restarts.

Working Flow

User logs in using Google OAuth. After login, the user schedules an email from the dashboard. The backend stores the email details along with the user ID in PostgreSQL and creates a delayed BullMQ job backed by Redis. Redis persists the job and guarantees reliability across server restarts. When the scheduled time arrives, the BullMQ worker processes the job, sends the email using Ethereal SMTP, and updates the email status to "sent" in the database. The frontend dashboard fetches updated data and reflects the changes in Scheduled and Sent email sections.

How To Run The Project

Step 1: Install PostgreSQL
Download PostgreSQL from the official website and complete the installation process. During installation, keep the default port 5432. After installation, create a database named emaildb and ensure the PostgreSQL service is running.

Step 2: Install Redis Using Memurai (For Windows)
Download Memurai from the official website and complete the installation. Memurai is Redis-compatible and works on Windows systems. Start Memurai server and verify that Redis is running properly.

Step 3: Install Visual Studio Code
Install Visual Studio Code or any preferred code editor to run and manage the project files.

Step 4: Open Project Folder
Open the complete project folder (backend and frontend) inside Visual Studio Code.

Backend Setup

Open a terminal inside the project folder and navigate to the backend directory. 
cd backend
Install all required dependencies:
npm install
npm install express cors dotenv
npm install -D typescript ts-node-dev @types/node @types/express
npm install typeorm pg reflect-metadata
npm install bullmq ioredis
npm install nodemailer
npm install google-auth-library

The backend uses Express, TypeScript, PostgreSQL with TypeORM, BullMQ for queue management, Redis connection through ioredis, Nodemailer for SMTP email sending, and Google authentication library for OAuth verification.

After installing dependencies, start the backend API server. The server will connect to PostgreSQL and Redis and expose REST APIs for scheduling and fetching emails.

Worker Setup

Open a new terminal and navigate to the backend folder. 
cd backend
npm run worker
Start the worker process. The worker is responsible for consuming delayed jobs from BullMQ and sending emails using Ethereal SMTP. The worker must always run along with the backend server.

Frontend Setup

Open a new terminal and navigate to the frontend folder. 
cd frontend
Install frontend dependencies such as React, Google OAuth library, and Axios. 
npm install
npm install @react-oauth/google axios
npm install axios
npm run dev

After installation, start the frontend development server. A local deployment URL will be displayed in the terminal. Open that link in the browser.

Application Usage

Login using Google OAuth from the frontend login page. After successful login, the dashboard will appear. Enter recipient email address, subject, message body, and scheduled time. Click on the Schedule Email button. The email will appear in the Scheduled Emails section. When the scheduled time arrives, the worker will send the email and the status will automatically move to the Sent Emails section. The Ethereal email preview link will be displayed in the worker terminal for verification.

Key Features Implemented

Google OAuth authentication
Multi-user email isolation
Persistent Redis-based scheduling
BullMQ delayed jobs
Worker concurrency support
Retry mechanism for failed jobs
SMTP email sending using Ethereal
Restart-safe background processing
Real-time dashboard updates

Notes and Assumptions

Ethereal SMTP is used only for testing and development purposes. Memurai is used instead of native Redis for Windows compatibility. The frontend UI focuses on functionality and logical flow rather than pixel-perfect Figma implementation.

Conclusion

This project demonstrates a scalable and production-style email scheduling architecture using background workers, persistent job queues, secure authentication, and real-time dashboard integration. It closely simulates how real-world SaaS email scheduling platforms operate.