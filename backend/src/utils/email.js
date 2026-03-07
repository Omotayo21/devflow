import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendTaskAssignedEmail({ assigneeName, assigneeEmail, taskTitle, projectName, assignedByName }) {
  try {
    await transporter.sendMail({
      from: `"DevFlow" <${process.env.EMAIL_USER}>`,
      to: assigneeEmail,
      subject: `You've been assigned: ${taskTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Task Assignment</h2>
          <p>Hi ${assigneeName},</p>
          <p><strong>${assignedByName}</strong> assigned you a task in <strong>${projectName}</strong>:</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <strong>${taskTitle}</strong>
          </div>
          <p>Login to DevFlow to view the full task details.</p>
          <a href="http://localhost:5173/login" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to DevFlow</a>
        </div>
      `,
    });
    logger.info({ assigneeEmail, taskTitle }, 'Task assignment email sent');
  } catch (err) {
    logger.error({ err }, 'Failed to send task assignment email');
    throw err;
  }
}

export async function sendWelcomeEmail({ name, email }) {
  try {
    await transporter.sendMail({
      from: `"DevFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to DevFlow',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to DevFlow, ${name}! 🎉</h2>
          <p>Your account has been created successfully.</p>
          <p>Start by creating your first workspace and inviting your team.</p>
        </div>
      `,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to send welcome email');
    throw err;
  }
}
