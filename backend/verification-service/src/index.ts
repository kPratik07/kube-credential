import { createServer } from './server';
import * as fs from 'fs';

const PORT = process.env.PORT || 3002;

// Ensure data directory exists
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}

const app = createServer();

app.listen(PORT, () => {
  console.log(`Verification service running on port ${PORT}`);
  console.log(`Worker ID: ${require('os').hostname()}`);
});
