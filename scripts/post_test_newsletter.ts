async function main() {
  console.log('Triggering June 2026 compilation on the Express server endpoint...');
  const startTime = Date.now();
  try {
    const res = await fetch('http://localhost:3000/api/newsletter/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jgreen2196@gmail.com',
        secret: 'New$letter',
        month: 'June',
        year: '2026',
        forceRefresh: true
      })
    });
    
    console.log(`Finished request in ${Date.now() - startTime}ms`);
    console.log('HTTP Status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('Compilation Server response:', JSON.stringify(data, null, 2));
    } else {
      const text = await res.text();
      console.error('API Error Response:', text);
    }
  } catch (error: any) {
    console.error('Error calling Express newsletter endpoint:', error.message || error);
  }
}

main().catch(console.error);
