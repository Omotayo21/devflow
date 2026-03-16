import { Queue, Worker } from 'bullmq';
import { logger } from '../utils/logger.js';
import { sendTaskAssignedEmail, sendWelcomeEmail, sendPasswordResetEmail, sendWorkspaceInviteEmail } from '../utils/email.js';

const connection = {
  url: process.env.REDIS_URL,
};

// Email queue
export const emailQueue = new Queue('emails', { connection });

// Worker — processes jobs from the queue
export const emailWorker = new Worker(
  'emails',
  async (job) => {
    const { type, data } = job.data;
    logger.info({ type, jobId: job.id }, 'Processing email job');

    if (type === 'task.assigned') {
      await sendTaskAssignedEmail(data);
    }

    if (type === 'welcome') {
      await sendWelcomeEmail(data);
    }

    if (type === 'password.reset') {
      await sendPasswordResetEmail(data);
    }

    if (type === 'workspace.invited') {
      await sendWorkspaceInviteEmail(data);
    }
  },
  { 
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    },
  }
);

emailWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Email job completed');
});

emailWorker.on('failed', (job, err) => {
  logger.error({ jobId: job.id, err }, 'Email job failed');
});

