import fs from 'fs';
import path from 'path';

function patch() {
  const file = path.join(process.cwd(), 'src', 'services', 'newsletterAgent.ts');
  let content = fs.readFileSync(file, 'utf-8');

  // Let's replace the cache write block using a reliable multiline regex that replaces the entire block from "// 2. Cache the result" up to "story.hasLink"
  const regexPattern = /\/\/ 2\. Cache the result for future runs[\s\S]*?if\s*\(\s*resolvedLink\s*\)\s*\{\s*story\.hasLink\s*=\s*true;/;

  const replacement = `// 2. Cache the result for future runs
                if (this.db && !(this.db as any).mock) {
                  try {
                    const cacheRef = doc(this.db, 'verified_game_links', safeQueryTitle);
                    if (resolvedLink) {
                      await setDoc(cacheRef, {
                        title: story.title,
                        url: resolvedLink,
                        status: 'verified',
                        addedAt: new Date().toISOString()
                      });
                    } else {
                      await setDoc(cacheRef, {
                        title: story.title,
                        url: "",
                        status: 'blocked',
                        reason: 'No API match found',
                        addedAt: new Date().toISOString()
                      });
                    }
                  } catch (e: any) {
                    console.warn(\`[WARNING] Error writing to link cache: \${e.message}\`);
                  }
                }
              }

              if (resolvedLink) {
                story.hasLink = true;`;

  if (regexPattern.test(content)) {
    content = content.replace(regexPattern, replacement);
    console.log('Successfully regex-patched cash-write block!');
  } else {
    console.error('Regex pattern did not match!');
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log('Patch complete!');
}

patch();
