import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  const logPath = path.join(process.cwd(), 'generation.log');
  
  // Wipe old log file if present
  if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
  }
  
  const out = fs.openSync(logPath, 'a');
  const err = fs.openSync(logPath, 'a');

  // Spawn compile script in background
  const p = spawn('npx', ['tsx', 'scripts/draft_june_newsletter.ts'], {
    detached: true,
    stdio: [ 'ignore', out, err ]
  });

  p.unref();
  console.log('SPAWNED_BACKGROUND_PROCESS_WITH_PID:', p.pid);
  process.exit(0);
}

main().catch(console.error);
