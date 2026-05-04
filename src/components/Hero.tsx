"use client";
import React, { useState, useEffect } from 'react';
import styles from './Hero.module.css';
import Aurora from './Aurora';
import BlurText from './BlurText';
import Link from 'next/link';

export default function Hero() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme on mount
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') setIsDark(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.auroraContainer}>
        <Aurora
          colorStops={isDark ? ["#38bdf8", "#818cf8", "#4f46e5"] : ["#4e66c9", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>Live IoT Network Enabled</div>
        <BlurText
          text="Smart Weather Monitoring & Analytics"
          delay={80}
          animateBy="words"
          direction="top"
          className={styles.heroTitle}
        />
        <p className={styles.heroSubtitle}>
          Real-time telemetry from NodeMCU ESP8266 and DHT11 sensors directly to the cloud. Stay connected to critical environmental metrics from anywhere.
        </p>
        <div className={styles.heroActions}>
          <Link href="/dashboard" className={styles.primaryBtn}>
            View Dashboard
          </Link>
          <button onClick={toggleTheme} className={styles.themeToggleBtn}>
            {isDark ? '☀️ Light Theme' : '🌙 Dark Theme'}
          </button>
        </div>
      </div>
    </section>
  );
}
