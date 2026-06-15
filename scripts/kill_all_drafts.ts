import { execSync } from 'child_process';

try {
  const psOutput = execSync('ps aux || ps -ef').toString();
  const lines = psOutput.split('\n');
  const termName = 'draft_june_newsletter.ts';
  let killedCount = 0;
  
  for (const line of lines) {
    if (line.includes(termName) && !line.includes('grep') && !line.includes('kill_all_drafts')) {
      console.log(`Found process to kill: ${line}`);
      const parts = line.trim().split(/\s+/);
      const pidStr = parts[1];
      const pid = parseInt(pidStr, 10);
      if (!isNaN(pid) && pid > 0) {
        try {
          process.kill(pid, 'SIGKILL');
          killedCount++;
        } catch (killErr: any) {
          console.warn(`Could not kill PID ${pid}:`, killErr.message);
        }
      }
    }
  }
  console.log(`Cleanup complete. Terminated ${killedCount} processes.`);
} catch (err: any) {
  console.warn("Could not kill processes:", err.message);
}
