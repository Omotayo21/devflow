import axios from 'axios';
import { logger } from './logger.js';
import { config } from '../config/index.js';

/**
 * Brevo client initialization. 
 * Using a getter to ensure config is loaded before use.
 */
const getBrevoClient = () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    logger.error('BREVO_API_KEY is missing from environment variables');
  }
  
  return axios.create({
    baseURL: 'https://api.brevo.com/v3',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      'accept': 'application/json'
    }
  });
};

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
  color: #ffffff !important;
  padding: 16px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  margin-top: 24px;
`;

async function sendEmail({ to, subject, htmlContent }) {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'DevFlow <rufaiabdulrahman@gmail.com>';
    const fromMatch = fromEmail.match(/(.*)<(.*)>/);
    const senderName = fromMatch ? fromMatch[1].trim() : 'DevFlow';
    const senderEmail = fromMatch ? fromMatch[2].trim() : fromEmail;

    const client = getBrevoClient();
    const response = await client.post('/smtp/email', {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    });

    logger.info({ messageId: response.data.messageId, to }, 'Email sent successfully via Brevo');
    return response.data;
  } catch (err) {
    const errorData = err.response?.data || err.message;
    logger.error({ err: errorData, to, subject }, 'Failed to send email via Brevo');
    throw new Error(`Email delivery failed: ${JSON.stringify(errorData)}`);
  }
}

export async function sendTaskAssignedEmail({ 
  assigneeName, 
  assigneeEmail, 
  taskTitle, 
  projectName, 
  assignedByName,
  workspaceId,
  projectId
}) {
  const htmlContent = `
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
        <a href="${config.frontendUrl}/workspaces/${workspaceId}/projects/${projectId}" style="${buttonStyle}">
          View Task & Login
        </a>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #e4e4e7;" />
        <p style="font-size: 12px; color: #a1a1aa; margin-top: 20px; text-align: center;">
          You're receiving this because you're a member of DevFlow
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: assigneeEmail,
    subject: `New task assigned: ${taskTitle}`,
    htmlContent
  });
}

export async function sendWelcomeEmail({ name, email }) {
  const htmlContent = `
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
        <a href="${config.frontendUrl}/login" style="${buttonStyle}">
          Get Started
        </a>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #e4e4e7;" />
        <p style="font-size: 12px; color: #a1a1aa; margin-top: 20px; text-align: center;">
          Built for engineering teams
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to DevFlow 🎉',
    htmlContent
  });
}

export async function sendPasswordResetEmail({ name, email, resetToken }) {
  const htmlContent = `
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
        <a href="${config.frontendUrl}/reset-password?token=${resetToken}" style="${buttonStyle}">
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
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your password',
    htmlContent
  });
}

export async function sendWorkspaceInviteEmail({ 
  inviteeEmail, 
  workspaceName, 
  invitedByName,
  role 
}) {
  const htmlContent = `
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
        <a href="${config.frontendUrl}/login" style="${buttonStyle}">
          Accept Invitation & Login
        </a>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #e4e4e7;" />
        <p style="font-size: 12px; color: #a1a1aa; margin-top: 20px; text-align: center;">
          You're receiving this because you've been invited to a DevFlow workspace.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: inviteeEmail,
    subject: `You've been invited to ${workspaceName} on DevFlow`,
    htmlContent
  });
}

