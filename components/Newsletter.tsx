import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showTest, setShowTest] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [testEmail, setTestEmail] = useState('jgreen2196@gmail.com');
  const [testMonth, setTestMonth] = useState('April');
  const [testYear, setTestYear] = useState('2026');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleTestNewsletter = async (forceRefresh: boolean = false) => {
    if (!adminSecret) {
      alert('ADMIN SECRET REQUIRED');
      return;
    }
    setTestStatus('loading');
    try {
      const response = await fetch('/api/newsletter/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail, 
          secret: adminSecret,
          month: testMonth,
          year: testYear,
          forceRefresh
        }),
      });
      if (!response.ok) throw new Error('Test failed');
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (e) {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const handlePreviewNewsletter = async (forceRefresh: boolean = false) => {
    if (!adminSecret) {
      alert('ADMIN SECRET REQUIRED');
      return;
    }
    
    setTestStatus('loading');
    try {
      const response = await fetch('/api/newsletter/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secret: adminSecret,
          month: testMonth,
          year: testYear,
          forceRefresh
        }),
      });
      
      if (!response.ok) throw new Error('Preview failed');
      
      const html = await response.text();
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(html);
        previewWindow.document.close();
      } else {
        alert('POPUP BLOCKED. PLEASE ALLOW POPUPS TO SEE PREVIEW.');
      }
      setTestStatus('idle');
    } catch (e) {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const handleMarkTest = async () => {
    if (!adminSecret) {
      alert('ADMIN SECRET REQUIRED');
      return;
    }
    try {
      const response = await fetch('/api/newsletter/mark-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, secret: adminSecret }),
      });
      if (response.ok) alert('MARKED AS TEST USER');
    } catch (e) {
      alert('FAILED TO MARK AS TEST USER');
    }
  };

  const handleReleaseNewsletter = async () => {
    if (!adminSecret) {
      alert('ADMIN SECRET REQUIRED');
      return;
    }
    if (!confirm(`ARE YOU SURE YOU WANT TO RELEASE THE ${testMonth.toUpperCase()} ${testYear} NEWSLETTER TO ALL SUBSCRIBERS?`)) return;
    
    setTestStatus('loading');
    try {
      const response = await fetch('/api/newsletter/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secret: adminSecret,
          month: testMonth,
          year: testYear
        }),
      });
      if (!response.ok) throw new Error('Release failed');
      setTestStatus('success');
      alert(`${testMonth.toUpperCase()} NEWSLETTER RELEASE STARTED`);
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (e) {
      setTestStatus('error');
      alert(`FAILED TO RELEASE ${testMonth.toUpperCase()} NEWSLETTER`);
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setMessage('PLEASE ENTER A VALID EMAIL ADDRESS.');
      return;
    }
    
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          name: name.trim() || 'Subscriber'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Subscription failed');
      }

      setStatus('success');
      setMessage('YOU\'RE ON THE LIST. SIGNAL INCOMING.');
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Subscription error:', error);
      setStatus('error');
      setMessage('FAILED TO SUBSCRIBE. PLEASE TRY AGAIN.');
    }
  };

  return (
    <div id="newsletter" className="relative z-10 bg-gs-surface border-y border-[rgba(255,224,51,0.2)] px-10 py-[72px] mt-[72px] overflow-hidden">
      <div className="absolute -right-[100px] -top-[100px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,224,51,0.05)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[72px] items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div 
            className="font-mono text-[11px] tracking-[5px] text-[#C9A800] mb-2 cursor-pointer select-none uppercase"
            onClick={() => setShowTest(!showTest)}
          >
            // join the frequency
          </div>
          <h2 className="font-display text-[clamp(32px,4.5vw,56px)] tracking-[3px] text-[#FFE033] mb-3 leading-tight" style={{ textShadow: '0 0 30px rgba(255,224,51,0.3)' }}>THE COLLECTIVE</h2>
          <p className="text-base text-gs-muted max-w-[520px] leading-[1.6] font-medium mb-6">
            Subscribe to The Frequency — our newsletter built for the community. Gaming. Tech. Entertainment. Delivered to you.
          </p>

          {showTest && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 p-4 border border-gs-green/20 bg-gs-green/5 rounded flex flex-col gap-3"
            >
              <div className="font-mono text-[10px] text-gs-green tracking-[2px] uppercase">ADMIN TEST PANEL</div>
              <input 
                type="password" 
                placeholder="ADMIN SECRET" 
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="w-full bg-gs-dark border border-gs-green/30 text-gs-green font-mono text-[12px] px-3 py-2 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="MONTH (e.g. March)" 
                  value={testMonth}
                  onChange={(e) => setTestMonth(e.target.value)}
                  className="bg-gs-dark border border-gs-green/30 text-gs-green font-mono text-[12px] px-3 py-2 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="YEAR (e.g. 2026)" 
                  value={testYear}
                  onChange={(e) => setTestYear(e.target.value)}
                  className="bg-gs-dark border border-gs-green/30 text-gs-green font-mono text-[12px] px-3 py-2 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePreviewNewsletter(false)}
                  disabled={testStatus === 'loading'}
                  className="flex-1 font-mono text-[10px] bg-gs-green text-gs-dark py-2 font-bold uppercase tracking-[1px] nav-btn-clip transition-all hover:bg-gs-accent"
                >
                  {testStatus === 'loading' ? 'LOADING...' : 'PREVIEW NEWSLETTER'}
                </button>
                <button 
                  onClick={() => handleTestNewsletter(false)}
                  disabled={testStatus === 'loading'}
                  className="flex-1 font-mono text-[10px] border border-gs-green text-gs-green py-2 font-bold uppercase tracking-[1px] nav-btn-clip transition-all hover:bg-gs-green/10"
                >
                  {testStatus === 'loading' ? 'SENDING...' : 'SEND TEST'}
                </button>
                <button 
                  onClick={() => handleTestNewsletter(true)}
                  disabled={testStatus === 'loading'}
                  title="Regenerate content from scratch"
                  className="font-mono text-[10px] border border-gs-green/50 text-gs-green/50 px-3 py-2 font-bold uppercase tracking-[1px] hover:text-gs-green hover:border-gs-green transition-all nav-btn-clip"
                >
                  REFRESH
                </button>
                <button 
                  onClick={handleMarkTest}
                  className="font-mono text-[10px] border border-gs-green/20 text-gs-green/20 px-4 py-2 font-bold uppercase tracking-[1px] nav-btn-clip transition-all hover:border-gs-green/50"
                >
                  MARK
                </button>
              </div>
            <button 
              onClick={handleReleaseNewsletter}
              disabled={testStatus === 'loading'}
              className="w-full font-mono text-[10px] border border-[#ff4455] text-[#ff4455] py-2 font-bold uppercase tracking-[1px] hover:bg-[#ff4455]/10 nav-btn-clip transition-all"
            >
              {testStatus === 'loading' ? 'RELEASING...' : `🚀 RELEASE ${testMonth.toUpperCase()} NEWSLETTER TO ALL`}
            </button>
              {testStatus === 'success' && <div className="text-[10px] text-gs-green font-mono">✓ ACTION COMPLETED</div>}
              {testStatus === 'error' && <div className="text-[10px] text-[#ff6b6b] font-mono">✗ FAILED TO SEND TEST</div>}
            </motion.div>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-[10px]"
        >
          <div className="font-mono text-[11px] text-[#C9A800] tracking-[2px] mb-1.5 uppercase">SUBSCRIBE TO THE SIGNAL</div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
            <input 
              type="text" 
              placeholder="YOUR NAME" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gs-card border border-gs-border text-gs-text font-sans text-[15px] font-medium px-[18px] py-3 outline-none transition-colors focus:border-[#FFE033]/40"
              disabled={status === 'loading'}
            />
            <div className="flex">
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gs-card border border-gs-border border-r-0 text-gs-text font-sans text-[15px] font-medium px-[18px] py-3 outline-none transition-colors focus:border-[#FFE033]/40"
                disabled={status === 'loading'}
              />
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="font-mono text-[12px] tracking-[2px] text-black bg-[#FFE033] border border-[#FFE033] px-7 py-3 cursor-pointer font-bold transition-all hover:bg-[#FFE033] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap btn-clip"
              >
                {status === 'loading' ? 'SENDING...' : 'SUBSCRIBE'}
              </button>
            </div>
          </form>
          
          {status === 'success' && (
            <div className="font-mono text-[12px] text-gs-green tracking-[1px] py-2.5">✓ &nbsp;{message}</div>
          )}
          {status === 'error' && (
            <div className="font-mono text-[11px] text-[#ff6b6b] tracking-[1px] py-1.5">✗ &nbsp;{message}</div>
          )}
          
          <p className="text-[12px] text-gs-muted opacity-70">No spam, ever. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </div>
  );
};
