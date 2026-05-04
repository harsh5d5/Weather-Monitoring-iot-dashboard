import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <h3>AeroSense IoT</h3>
          <p>
            An advanced environmental telemetry system using ESP8266 & DHT11 for real-time sensor processing and visualization.
          </p>
        </div>
        <div className={styles.footerLinks}>
          <h4>Features</h4>
          <ul>
            <li><a href="#live-data">Live Monitoring</a></li>
            <li><a href="#analytics">Sensor Data Analytics</a></li>
            <li><a href="#simulator">Weather Simulator</a></li>
          </ul>
        </div>
        <div className={styles.footerLinks}>
          <h4>Hardware Stack</h4>
          <ul>
            <li><a href="https://nodemcu.readthedocs.io/" target="_blank" rel="noreferrer">NodeMCU ESP8266</a></li>
            <li><a href="https://learn.adafruit.com/dht" target="_blank" rel="noreferrer">DHT11 Sensor</a></li>
            <li><a href="https://nextjs.org" target="_blank" rel="noreferrer">Next.js Web Client</a></li>
          </ul>
        </div>
        <div className={styles.footerLinks}>
          <h4>Information</h4>
          <ul>
            <li><a href="#about">About the Project</a></li>
            <li><a href="#architecture">Architecture Diagram</a></li>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} AeroSense IoT Monitoring System. All rights reserved.</p>
        <div className={styles.footerSocials}>
          <span>V1.0.0 Stable</span>
        </div>
      </div>
    </footer>
  );
}
