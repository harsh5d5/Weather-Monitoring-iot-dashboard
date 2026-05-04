import React from 'react';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <>
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)', paddingTop: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link 
            href="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#94a3b8', 
              textDecoration: 'none', 
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'color 0.2s',
              marginBottom: '2rem'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </Link>
        </div>
        <Dashboard />
      </main>
      <Footer />
    </>
  );
}
