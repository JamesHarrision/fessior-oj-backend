import './config/env';

import { connectMongoDB } from './config/mongoose';
import { startSubmissionWorker } from './workers/submission.worker';

const bootstrap = async () => {
  console.log('Starting Worker Service...');
  await connectMongoDB();
  startSubmissionWorker();
};

bootstrap().catch((err) => {
  console.error('Fatal error starting Worker Service:', err);
  process.exit(1);
});
