import './config/env';

import { startSubmissionWorker } from './workers/submission.worker';

const bootstrap = async () => {
  console.log('Starting Worker Service...');
  startSubmissionWorker();
};

bootstrap().catch((err) => {
  console.error('Fatal error starting Worker Service:', err);
  process.exit(1);
});
