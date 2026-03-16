import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000, // Increased for cloud stability
  greetingTimeout: 20000,
  socketTimeout: 60000,
  debug: true, // Keep debug logging to monitor Railway logs
  logger: true
});

const commonStyles = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #ffffff;
  border-radius: 12px;
  color: #18181b;
`;

const buttonStyle = `
  display: inline-block;
  background-color: #7c3aed;
  color: #ffffff;
  padding: 16px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  margin-top: 24px;
`;

export async function sendTaskAssignedEmail({ 
  assigneeName, 
  assigneeEmail, 
  taskTitle, 
  projectName, 
  assignedByName,
  workspaceId,
  projectId
}) {
  try {
    await transporter.sendMail({
      from: `"DevFlow" <${process.env.EMAIL_USER}>`,
      to: assigneeEmail,
      subject: `New task assigned: ${taskTitle}`,
      html: `
        <div style="background-color: #f4f4f5; padding: 40px 0;">
          <div style="${commonStyles}">
            <h1 style="color: #7c3aed; margin-bottom: 24px; font-size: 24px;">DevFlow</h1>
            <h2 style="font-size: 20px; margin-bottom: 16px;">You have a new task</h2>
            <p style="font-size: 16px; color: #52525b; margin-bottom: 16px;">Hi ${assigneeName},</p>
            <p style="font-size: 16px; color: #52525b; margin-bottom: 24px;">
              <strong>${assignedByName}</strong> assigned you a task in <strong>${projectName}</strong>:
            </p>
            <div style="border: 2px solid #7c3aed20; background-color: #7c3aed05; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <p style="margin: 0; font-weight: 600; color: #18181b;">${taskTitle}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/workspaces/${workspaceId}/projects/${projectId}" style="${buttonStyle}">
              View Task & Login
            </a>
            <hr style="margin-top: 40px; border: none; border-top: 1px solid #e4e4e7;" />
            <p style="font-size: 12px; color: #a1a1aa; margin-top: 20px; text-align: center;">
              You're receiving this because you're a member of DevFlow
            </p>
          </div>
        </div>
      `,
    });
    logger.info({ assigneeEmail, taskTitle }, 'Task assignment email sent');
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack, code: err.code }, 'Failed to send task assignment email');
    throw err;
  }
}

export async function sendWelcomeEmail({ name, email }) {
  try {
    await transporter.sendMail({
      from: `"DevFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to DevFlow 🎉',
      html: `
        <div style="background-color: #f4f4f5; padding: 40px 0;">
          <div style="${commonStyles}">
            <h1 style="color: #7c3aed; margin-bottom: 24px; font-size: 24px;">DevFlow</h1>
            <h2 style="font-size: 20px; margin-bottom: 16px;">Welcome to DevFlow 🎉</h2>
            <p style="font-size: 16px; color: #52525b; margin-bottom: 16px;">Hi ${name},</p>
            <p style="font-size: 16px; color: #52525b; margin-bottom: 24px;">
              Your account has been created successfully. Here's how to get started:
            </p>
            <ul style="color: #52525b; padding-left: 20px; margin-bottom: 24px;">
              <li style="margin-bottom: 8px;">Create workspaces to organize your teams</li>
              <li style="margin-bottom: 8px;">Run projects with Kanban boards</li>
              <li style="margin-bottom: 8px;">Track tasks and collaborate in real-time</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/login" style="${buttonStyle}">
              Get Started
            </a>
            <hr style="margin-top: 40px; border: none; border-top: 1px solid #e4e4e7;" />
            <p style="font-size: 12px; color: #a1a1aa; margin-top: 20px; text-align: center;">
              Built for engineering teams
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack, code: err.code }, 'Failed to send welcome email');
    throw err;
  }
}

export async function sendPasswordResetEmail({ name, email, resetToken }) {
  try {
    await transporter.sendMail({
      from: `"DevFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="background-color: #f4f4f5; padding: 40px 0;">
          <div style="${commonStyles}">
            <h1 style="color: #7c3aed; margin-bottom: 24px; font-size: 24px;">DevFlow</h1>
            <h2 style="font-size: 20px; margin-bottom: 16px;">Reset your password</h2>
            <p style="font-size: 16px; color: #52525b; margin-bottom: 16px;">Hi ${name},</p>
            <p style="font-size: 16px; color: #52525b; margin-bottom: 16px;">
              We received a request to reset your password. Click the button below to proceed:
            </p>
            <p style="font-size: 14px; color: #7c3aed; font-weight: 500;">
              This link expires in 1 hour.
            </p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" style="${buttonStyle}">
              Reset Password
            </a>
            <p style="font-size: 14px; color: #a1a1aa; margin-top: 32px;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="margin-top: 40px; border: none; border-top: 1px solid #e4e4e7;" />
            <p style="font-size: 12px; color: #a1a1aa; margin-top: 20px; text-align: center;">
              Security for your DevFlow account
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack, code: err.code }, 'Failed to send password reset email');
    throw err;
  }
}

export async function sendWorkspaceInviteEmail({ 
  inviteeEmail, 
  workspaceName, 
  invitedByName,
  role 
}) {
  try {
    await transporter.sendMail({
      from: `"DevFlow" <${process.env.EMAIL_USER}>`,
      to: inviteeEmail,
      subject: `You've been invited to ${workspaceName} on DevFlow`,
      html: `
        <div style="background-color: #f4f4f5; padding: 40px 0;">
          <div style="${commonStyles}">
            <h1 style="color: #7c3aed; margin-bottom: 24px; font-size: 24px;">DevFlow</h1>
            <h2 style="font-size: 20px; margin-bottom: 16px;">Workspace Invitation</h2>
            <p style="font-size: 16px; color: #52525b; margin-bottom: 16px;">Hi there,</p>
            <p style="font-size: 16px; color: #52525b; margin-bottom: 24px;">
              <strong>${invitedByName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace as an <strong>${role}</strong>.
            </p>
            <div style="border: 2px solid #7c3aed20; background-color: #7c3aed05; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <p style="margin: 0; font-weight: 600; color: #18181b;">Join your team and start collaborating!</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/login" style="${buttonStyle}">
              Accept Invitation & Login
            </a>
            <hr style="margin-top: 40px; border: none; border-top: 1px solid #e4e4e7;" />
            <p style="font-size: 12px; color: #a1a1aa; margin-top: 20px; text-align: center;">
              You're receiving this because you've been invited to a DevFlow workspace.
            </p>
          </div>
        </div>
      `,
    });
    logger.info({ inviteeEmail, workspaceName }, 'Workspace invitation email sent');
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack, code: err.code }, 'Failed to send workspace invitation email');
    throw err;
  }
}

