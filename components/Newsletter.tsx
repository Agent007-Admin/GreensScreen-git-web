import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
    <div id="newsletter" className="relative z-10 bg-gs-surface border-y border-gs-border px-10 py-[72px] mt-[72px] overflow-hidden">
      <div className="absolute -right-[100px] -top-[100px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,255,136,0.05)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[72px] items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="font-mono text-[11px] tracking-[4px] text-gs-green mb-2">NEWSLETTER</div>
          <h2 className="font-display text-[clamp(32px,4.5vw,56px)] tracking-[3px] text-gs-text mb-3 leading-tight">STAY IN<br />THE LOOP</h2>
          <p className="text-base text-gs-muted max-w-[520px] leading-[1.6] font-medium">
            Drop your email and get exclusive updates, early access, and insider content from Greens Screens Ent — straight to your inbox. No spam. Just signal.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-[10px]"
        >
          <div className="font-mono text-[11px] text-gs-green tracking-[2px] mb-1.5 uppercase">SUBSCRIBE TO THE SIGNAL</div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
            <input 
              type="text" 
              placeholder="YOUR NAME" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gs-card border border-gs-border text-gs-text font-sans text-[15px] font-medium px-[18px] py-3 outline-none transition-colors focus:border-gs-green/40"
              disabled={status === 'loading'}
            />
            <div className="flex">
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gs-card border border-gs-border border-r-0 text-gs-text font-sans text-[15px] font-medium px-[18px] py-3 outline-none transition-colors focus:border-gs-green/40"
                disabled={status === 'loading'}
              />
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="font-mono text-[12px] tracking-[1px] text-gs-dark bg-gs-green border border-gs-green px-6 py-3 cursor-pointer font-bold transition-all hover:bg-gs-accent hover:border-gs-accent disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
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
