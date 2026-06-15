import { execSync } from 'child_process';
try {
  const list = execSync('ps -ef || ps aux').toString();
  const filtered = list.split('\n').filter(l => l.includes('draft_june_newsletter.ts') && !l.includes('grep') && !l.includes('check_running'));
  if (filtered.length > 0) {
    console.log("ACTIVE BACKGROUND PROCESSES:");
    filtered.forEach(x => console.log(x));
  } else {
    console.log("NO RUNNING PROCESSES.");
  }
} catch (e: any) {
  console.log("Error querying process list:", e.message);
}
