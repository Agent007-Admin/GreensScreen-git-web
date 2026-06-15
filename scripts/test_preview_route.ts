async function main() {
  console.log('Sending POST to /api/newsletter/preview for June 2026...');
  const startTime = Date.now();
  try {
    const res = await fetch('http://localhost:3000/api/newsletter/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: 'New$letter',
        month: 'June',
        year: '2026',
        forceRefresh: true
      })
    });
    
    console.log(`Request completed in ${Date.now() - startTime}ms`);
    console.log('HTTP Status:', res.status);
    
    if (res.ok) {
      const html = await res.text();
      console.log('Successfully received preview HTML! Character length:', html.length);
      console.log('HTML snippet:', html.substring(0, 500) + '...');
    } else {
      const text = await res.text();
      console.error('Error response:', text);
    }
  } catch (error: any) {
    console.error('Fetch error:', error.message || error);
  }
}

main().catch(console.error);
