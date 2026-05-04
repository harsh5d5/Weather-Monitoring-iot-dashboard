"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './Dashboard.module.css';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

type WeatherMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: string;
  icon: React.ReactNode;
};

type Station = {
  id: string;
  name: string;
  lat: string;
  lng: string;
  latNum: number;
  lngNum: number;
  temp: number;
  humidity: number;
  rainfall: number;
  pressure: number;
  wifi: string;
  wifiNum: number;
  uptime: string;
  voltage: string;
  voltNum: number;
};

const defaultStations: Station[] = [
  {
    id: "alpha",
    name: "Navrangpura Station",
    lat: "23.0360° N",
    lng: "72.5612° E",
    latNum: 23.0360,
    lngNum: 72.5612,
    temp: 42.5,
    humidity: 25,
    rainfall: 0,
    pressure: 1002,
    wifi: "-65 dBm (Strong)",
    wifiNum: 80,
    uptime: "4d 12h 30m",
    voltage: "3.28 V",
    voltNum: 85
  },
  {
    id: "beta",
    name: "LD College Node",
    lat: "23.0343° N",
    lng: "72.5458° E",
    latNum: 23.0343,
    lngNum: 72.5458,
    temp: 41.2,
    humidity: 28,
    rainfall: 0,
    pressure: 1004,
    wifi: "-74 dBm (Stable)",
    wifiNum: 60,
    uptime: "1d 08h 15m",
    voltage: "3.22 V",
    voltNum: 70
  },
  {
    id: "gamma",
    name: "CG Road Center",
    lat: "23.0304° N",
    lng: "72.5574° E",
    latNum: 23.0304,
    lngNum: 72.5574,
    temp: 43.1,
    humidity: 22,
    rainfall: 0,
    pressure: 1001,
    wifi: "-58 dBm (Excellent)",
    wifiNum: 95,
    uptime: "12d 04h 50m",
    voltage: "3.31 V",
    voltNum: 92
  }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("map");
  const [stations, setStations] = useState<Station[]>(defaultStations);
  const [activeStationId, setActiveStationId] = useState<string>("alpha");
  const [isPinging, setIsPinging] = useState(false);
  const [isPushingData, setIsPushingData] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);
  const [dataPoints, setDataPoints] = useState(1452);
  const [exportFormat, setExportFormat] = useState("CSV");
  const [terminalLogs, setTerminalLogs] = useState<{time: string, text: string}[]>([
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), text: "System initialized. Polling DHT11 sensors..." }
  ]);

  const activeStation = stations.find(s => s.id === activeStationId) || stations[0];

  const updateActiveStation = (updater: Partial<Station>) => {
    setStations(prev => prev.map(s => s.id === activeStationId ? { ...s, ...updater } : s));
  };

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const updatedStations = await Promise.all(defaultStations.map(async (station) => {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${station.latNum}&longitude=${station.lngNum}&current=temperature_2m,relative_humidity_2m,surface_pressure,precipitation`);
          if (!res.ok) return station;
          const data = await res.json();
          
          return {
            ...station,
            temp: data.current?.temperature_2m || station.temp,
            humidity: data.current?.relative_humidity_2m || station.humidity,
            pressure: data.current?.surface_pressure || station.pressure,
            rainfall: data.current?.precipitation || station.rainfall,
          };
        }));
        setStations(updatedStations);
      } catch (error) {
        console.error("Failed to fetch real weather data", error);
      }
    };

    // Fetch immediately on mount
    fetchRealData();

    // Re-fetch every 4 hours (4 * 60 * 60 * 1000 ms)
    const fourHourInterval = setInterval(fetchRealData, 14400000);
    
    return () => clearInterval(fourHourInterval);
  }, []);

  const [chartData, setChartData] = useState<number[]>([21, 23, 24, 25, 23, 24]);
  const [activeArchStep, setActiveArchStep] = useState<number | null>(null);

  const simulateArchitecture = () => {
    setActiveArchStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step > 7) {
        clearInterval(interval);
        setActiveArchStep(null);
      } else {
        setActiveArchStep(step);
      }
    }, 1500);
  };

  const updateMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    setChartData(prev => [...prev.slice(1), activeStation.temp]);
    
    setIsPushingData(true);
    setTimeout(() => {
      setIsPushingData(false);
      setPushSuccess(true);
      setTimeout(() => setPushSuccess(false), 2500);
    }, 1500);
  };

  useEffect(() => {
    if (activeTab !== "sensor") return;
    const terminalMsgs = [
      "Payload 48 bytes delivered successfully",
      "Network handshake complete via 192.168.1.100",
      "Parsing JSON body from DHT11 registry",
      "Syncing EEPROM state arrays",
      `Station [${activeStationId}] broadcast confirmed`,
      "Receiving new telemetry snapshot",
    ];
    const logInterval = setInterval(() => {
      const msg = terminalMsgs[Math.floor(Math.random() * terminalMsgs.length)];
      setTerminalLogs(prev => {
        const newLogs = [...prev, { time: new Date().toLocaleTimeString('en-US', { hour12: false }), text: msg }];
        return newLogs.slice(-20);
      });
    }, 2800);
    return () => clearInterval(logInterval);
  }, [activeTab, activeStationId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => prev.map(s => ({
        ...s,
        // Add tiny sensor jitter to the real data to simulate live hardware fluctuations
        temp: +(s.temp + (Math.random() * 0.2 - 0.1)).toFixed(1),
        humidity: Math.min(100, Math.max(0, +(s.humidity + (Math.random() * 0.4 - 0.2)).toFixed(1)))
      })));
      setDataPoints(prev => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Station Name,Latitude,Longitude,Temperature (°C),Humidity (%),Rainfall (mm),Air Pressure (hPa),Wifi,Uptime,Voltage\n" +
      stations.map(s => `${s.name},${s.lat},${s.lng},${s.temp},${s.humidity},${s.rainfall},${s.pressure},${s.wifi},${s.uptime},${s.voltage}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AeroSense_IoT_Live_Data_${activeStationId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
    }, 1500);
  };

  const metrics: WeatherMetric[] = [
    {
      id: "temp",
      label: "Temperature",
      value: activeStation.temp,
      unit: "°C",
      status: "Active Tracking",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4v10.5a4.5 4.5 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
          <line x1="12" y1="11" x2="12" y2="11.01"/>
        </svg>
      )
    },
    {
      id: "humidity",
      label: "Humidity",
      value: activeStation.humidity,
      unit: "%",
      status: "Direct Telemetry",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      )
    },
    {
      id: "rainfall",
      label: "Rainfall",
      value: activeStation.rainfall,
      unit: "mm",
      status: "Rain Gauge Active",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 17.58A5 5 0 0 1 18 20H6a5 5 0 0 1-2-2.42A7 7 0 1 1 16 11.2a4 4 0 0 1 4 6.38z"/>
          <line x1="12" y1="16" x2="12" y2="20"/>
          <line x1="8" y1="18" x2="8" y2="18.01"/>
          <line x1="16" y1="18" x2="16" y2="18.01"/>
        </svg>
      )
    },
    {
      id: "pressure",
      label: "Air Pressure",
      value: activeStation.pressure,
      unit: "hPa",
      status: "Direct Broadcast",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    }
  ];

  const maxY = Math.max(...chartData, 30);
  const minY = Math.min(...chartData, 10);
  const rangeY = maxY - minY || 1;
  
  const points = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1)) * 500;
    const y = 180 - ((val - minY) / rangeY) * 140;
    return { x, y, val };
  });

  const d = points.reduce((acc, point, i) => {
    return acc + `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }, '');

  const areaD = `${d} L 500 180 L 0 180 Z`;

  return (
    <div id="live-data" className={styles.dashboardWrapper}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Live IoT Telemetry</h2>
        <p className={styles.dashboardSubtitle}>
          Secure, direct sensor network broadcasting with hardware simulations, data logs, and system architectures.
        </p>
      </div>

      <div className={styles.tabNav}>
        <button 
          onClick={() => setActiveTab("map")} 
          className={`${styles.tabBtn} ${activeTab === "map" ? styles.activeTabBtn : ''}`}
        >
          MAP & TELEMETRY
        </button>
        <button 
          onClick={() => setActiveTab("sensor")} 
          className={`${styles.tabBtn} ${activeTab === "sensor" ? styles.activeTabBtn : ''}`}
        >
          SENSOR MANAGEMENT
        </button>
        <button 
          onClick={() => setActiveTab("analysis")} 
          className={`${styles.tabBtn} ${activeTab === "analysis" ? styles.activeTabBtn : ''}`}
        >
          ANALYSIS & REPORTS
        </button>
        <button 
          onClick={() => setActiveTab("architecture")} 
          className={`${styles.tabBtn} ${activeTab === "architecture" ? styles.activeTabBtn : ''}`}
        >
          SYSTEM ARCHITECTURE
        </button>
      </div>

      {activeTab === "map" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div className={styles.metricsGrid}>
            {metrics.map((m) => (
              <div key={m.id} className={styles.metricCard}>
                <div className={styles.metricTop}>
                  <span className={styles.metricLabel}>{m.label}</span>
                  <div className={styles.metricIcon}>{m.icon}</div>
                </div>
                <div className={styles.metricValue}>
                  {m.value}
                  <span className={styles.metricUnit}>{m.unit}</span>
                </div>
                <div className={styles.metricStatus}>
                  <span className={styles.statusDot}></span>
                  <span>{m.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.mapAndStatusSection}>
            <div className={styles.mapCard}>
              <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Station Geolocation Tracking
              </h3>
              <div className={styles.mapVisual} style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <MapComponent 
                  stations={stations} 
                  activeStationId={activeStationId} 
                  onStationSelect={setActiveStationId} 
                />
              </div>
              <div className={styles.mapControls}>
                {stations.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setActiveStationId(s.id)}
                    className={`${styles.mapButton} ${s.id === activeStationId ? styles.mapButtonActive : ''}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    </svg>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.deviceHealthCard}>
              <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                Region NodeMCU Status
                <span className={styles.statusDot} style={{ width: '10px', height: '10px', display: 'inline-block', marginLeft: 'auto' }}></span>
              </h3>
              <div className={styles.deviceHealthGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.healthItem}>
                  <span className={styles.healthLabel}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                      <line x1="12" y1="20" x2="12.01" y2="20"></line>
                    </svg>
                    WiFi Signal
                  </span>
                  <div className={styles.healthValue}>
                    <span style={{ color: "#10b981", fontSize: '0.95rem' }}>{activeStation.wifi}</span>
                    <div className={styles.progressBarBg}>
                      <div className={styles.progressBarFill} style={{ width: `${activeStation.wifiNum}%`, background: '#10b981' }}></div>
                    </div>
                  </div>
                </div>
                <div className={styles.healthItem}>
                  <span className={styles.healthLabel}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    Latitude
                  </span>
                  <span className={styles.healthValue}>{activeStation.lat}</span>
                </div>
                <div className={styles.healthItem}>
                  <span className={styles.healthLabel}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    Longitude
                  </span>
                  <span className={styles.healthValue}>{activeStation.lng}</span>
                </div>
                <div className={styles.healthItem}>
                  <span className={styles.healthLabel}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Active Uptime
                  </span>
                  <span className={styles.healthValue}>{activeStation.uptime}</span>
                </div>
                <div className={styles.healthItem}>
                  <span className={styles.healthLabel}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    Node Voltage
                  </span>
                  <div className={styles.healthValue}>
                    <span style={{ fontSize: '0.95rem' }}>{activeStation.voltage}</span>
                    <div className={styles.progressBarBg}>
                      <div className={styles.progressBarFill} style={{ width: `${activeStation.voltNum}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handlePing}
                className={styles.pingBtn}
                disabled={isPinging}
              >
                {isPinging ? (
                  <>
                    <svg className={styles.spinIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Pinging Module...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    Ping Target Device
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sensor" && (
        <div className={styles.dashboardMain}>
          <div className={styles.simulatorCard}>
            <h3 className={styles.cardTitle}>Sensor Diagnostics & Control</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Interact directly with simulated sensor signals to test target parameters before writing live to NodeMCU.
            </p>
            <form className={styles.simulatorForm} onSubmit={updateMetrics}>
              <div className={styles.simField}>
                <div className={styles.simLabelWrapper}>
                  <span>
                    <span style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '6px' }}>🌡️</span>
                    Target Temperature
                  </span>
                  <span>{activeStation.temp} °C</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={activeStation.temp}
                  onChange={e => updateActiveStation({ temp: parseFloat(e.target.value) })}
                  className={styles.simInput}
                  style={{ accentColor: activeStation.temp > 38 ? '#ef4444' : activeStation.temp < 20 ? '#3b82f6' : '#f59e0b' }}
                />
              </div>
              <div className={styles.simField}>
                <div className={styles.simLabelWrapper}>
                  <span>
                    <span style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '6px' }}>💧</span>
                    Target Humidity
                  </span>
                  <span>{activeStation.humidity} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={activeStation.humidity}
                  onChange={e => updateActiveStation({ humidity: parseInt(e.target.value) })}
                  className={styles.simInput}
                  style={{ accentColor: '#0ea5e9' }}
                />
              </div>
              <div className={styles.simField}>
                <div className={styles.simLabelWrapper}>
                  <span>
                    <span style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '6px' }}>🌧️</span>
                    Rainfall Gauge
                  </span>
                  <span>{activeStation.rainfall} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="1"
                  value={activeStation.rainfall}
                  onChange={e => updateActiveStation({ rainfall: parseInt(e.target.value) })}
                  className={styles.simInput}
                  style={{ accentColor: '#3b82f6' }}
                />
              </div>
              <div className={styles.simField}>
                <div className={styles.simLabelWrapper}>
                  <span>
                    <span style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '6px' }}>🌬️</span>
                    Target Air Pressure
                  </span>
                  <span>{activeStation.pressure} hPa</span>
                </div>
                <input
                  type="range"
                  min="950"
                  max="1050"
                  step="1"
                  value={activeStation.pressure}
                  onChange={e => updateActiveStation({ pressure: parseInt(e.target.value) })}
                  className={styles.simInput}
                  style={{ accentColor: '#8b5cf6' }}
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.simButton}
                disabled={isPushingData}
                style={pushSuccess ? { background: '#10b981' } : {}}
              >
                {isPushingData ? (
                  <>
                    <svg className={styles.spinIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Syncing to NodeMCU...
                  </>
                ) : pushSuccess ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Successfully Pushed!
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5"></path>
                      <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                    Push to Cloud Server
                  </>
                )}
              </button>
            </form>
          </div>

          <div className={styles.deviceHealthCard} style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className={styles.cardTitle}>Active Node Logs</h3>
            <div className={styles.deviceHealthGrid} style={{ flexGrow: 1 }}>
              <div className={styles.healthItem}>
                <span className={styles.healthLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Total Connected Nodes
                </span>
                <span className={`${styles.statusPill} ${styles.pillBlue}`}>3 Modules</span>
              </div>
              <div className={styles.healthItem}>
                <span className={styles.healthLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                    <rect x="9" y="9" width="6" height="6"></rect>
                    <line x1="9" y1="1" x2="9" y2="4"></line>
                    <line x1="15" y1="1" x2="15" y2="4"></line>
                    <line x1="9" y1="20" x2="9" y2="23"></line>
                    <line x1="15" y1="20" x2="15" y2="23"></line>
                    <line x1="20" y1="9" x2="23" y2="9"></line>
                    <line x1="20" y1="14" x2="23" y2="14"></line>
                    <line x1="1" y1="9" x2="4" y2="9"></line>
                    <line x1="1" y1="14" x2="4" y2="14"></line>
                  </svg>
                  DHT11 Status
                </span>
                <span className={`${styles.statusPill} ${styles.pillGreen}`}>Healthy (Good)</span>
              </div>
              <div className={styles.healthItem}>
                <span className={styles.healthLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Cloud Broadcast Time
                </span>
                <span className={styles.healthValue}>Every 2 Seconds</span>
              </div>
              <div className={styles.healthItem}>
                <span className={styles.healthLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  Current Target IP
                </span>
                <span className={styles.healthValue} style={{ color: 'var(--primary)' }}>192.168.1.100</span>
              </div>
            </div>
            
            <div className={styles.terminalContainer}>
               <div className={styles.terminalHeader}>
                 <div className={styles.terminalDot} style={{ background: '#ef4444' }} />
                 <div className={styles.terminalDot} style={{ background: '#eab308' }} />
                 <div className={styles.terminalDot} style={{ background: '#22c55e' }} />
                 <span className={styles.terminalTitle} style={{ marginLeft: '10px' }}>LIVE_NODE_CONSOLE ~ ./watch</span>
               </div>
               <div className={styles.terminalBody}>
                 {terminalLogs.map((log, i) => (
                   <div key={i} className={styles.logLine}>
                     <span className={styles.logTime}>[{log.time}]</span>
                     <span className={styles.logText}>{log.text}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analysis" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div className={styles.dashboardMain}>
            <div className={styles.chartCard}>
              <h3 className={styles.cardTitle}>Analytics & Trending Data</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
                Real-time 24-hour graphing metrics processing and tracking active data flows over the region.
              </p>
              <div className={styles.chartContainer}>
                <svg className={styles.svgChart} viewBox="-20 -10 540 220">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  <text x="-15" y="45" className={styles.axisLabel}>45°C</text>
                  <line x1="20" y1="40" x2="500" y2="40" className={styles.chartGridLine}/>
                  
                  <text x="-15" y="115" className={styles.axisLabel}>35°C</text>
                  <line x1="20" y1="110" x2="500" y2="110" className={styles.chartGridLine}/>
                  
                  <text x="-15" y="185" className={styles.axisLabel}>25°C</text>
                  <line x1="20" y1="180" x2="500" y2="180" className={styles.chartGridLine}/>

                  <text x="20" y="205" className={styles.axisLabel}>08:00</text>
                  <text x="116" y="205" className={styles.axisLabel}>10:00</text>
                  <text x="212" y="205" className={styles.axisLabel}>12:00</text>
                  <text x="308" y="205" className={styles.axisLabel}>14:00</text>
                  <text x="404" y="205" className={styles.axisLabel}>16:00</text>
                  <text x="480" y="205" className={styles.axisLabel}>Now</text>

                  <path d={areaD} className={styles.chartArea}/>
                  <path d={d} className={styles.chartPath}/>

                  <g className={styles.chartPoints}>
                    {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="5">
                        <title>{p.val}°C</title>
                      </circle>
                    ))}
                  </g>
                </svg>
              </div>
            </div>

            <div className={styles.deviceHealthCard} style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 className={styles.cardTitle}>Report Generator</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Analyze all real-time sensor data sets on a country-wide tracking scale and generate direct reports.
              </p>
              
              <div className={styles.deviceHealthGrid} style={{ marginBottom: '1rem' }}>
                <div className={styles.healthItem}>
                  <span className={styles.healthLabel}>Report Date</span>
                  <span className={styles.healthValue}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className={styles.healthItem}>
                  <span className={styles.healthLabel}>Data Points Harvested</span>
                  <span className={styles.healthValue} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    {dataPoints.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={styles.formatSelector}>
                <button 
                  onClick={() => setExportFormat("CSV")}
                  className={`${styles.formatBtn} ${exportFormat === "CSV" ? styles.formatBtnActive : ''}`}
                >
                  CSV
                </button>
                <button 
                  onClick={() => setExportFormat("JSON")}
                  className={`${styles.formatBtn} ${exportFormat === "JSON" ? styles.formatBtnActive : ''}`}
                >
                  JSON
                </button>
                <button 
                  onClick={() => setExportFormat("PDF")}
                  className={`${styles.formatBtn} ${exportFormat === "PDF" ? styles.formatBtnActive : ''}`}
                >
                  PDF
                </button>
              </div>

              <button 
                type="button" 
                onClick={exportCSV}
                className={styles.csvBtn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export {exportFormat} Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "architecture" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className={styles.archCard}>
            <h3 className={styles.cardTitle}>System Architecture & Data Flow</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5', maxWidth: '600px' }}>
                Full breakdown of the ESP8266 Weather Report data pipelines, client-server interactions, and backend setups. Hover over cards for details or run the live simulation.
              </p>
              <button 
                onClick={simulateArchitecture}
                disabled={activeArchStep !== null}
                className={styles.simButton} 
                style={{ marginTop: 0, padding: '0.75rem 1.5rem', width: 'auto' }}
              >
                {activeArchStep !== null ? 'Simulating...' : '▶ Run Simulation'}
              </button>
            </div>

            {/* Visual Pipeline Animation */}
            <div className={styles.pipelineContainer}>
              <div className={styles.pipelineLine}></div>
              <div className={`${styles.dataPacket} ${activeArchStep !== null ? '' : 'hidden'}`} style={{ display: activeArchStep !== null ? 'block' : 'none' }}></div>
              <div className={`${styles.dataPacket} ${styles.dataPacket2} ${activeArchStep !== null ? '' : 'hidden'}`} style={{ display: activeArchStep !== null ? 'block' : 'none' }}></div>
              
              <div className={`${styles.pipelineNode} ${activeArchStep === 0 || activeArchStep === 1 ? styles.pipelineNodeActive : ''}`}>
                <div className={styles.nodeIcon}>
                  <span style={{ fontSize: '1.8rem' }}>🌡️</span>
                </div>
                <span className={styles.nodeLabel}>DHT11</span>
              </div>
              <div className={`${styles.pipelineNode} ${activeArchStep === 1 || activeArchStep === 4 || activeArchStep === 5 ? styles.pipelineNodeActive : ''}`}>
                <div className={styles.nodeIcon}>
                  <span style={{ fontSize: '1.8rem' }}>📟</span>
                </div>
                <span className={styles.nodeLabel}>ESP8266</span>
              </div>
              <div className={`${styles.pipelineNode} ${activeArchStep === 2 ? styles.pipelineNodeActive : ''}`}>
                <div className={styles.nodeIcon}>
                  <span style={{ fontSize: '1.8rem' }}>🛜</span>
                </div>
                <span className={styles.nodeLabel}>WiFi Router</span>
              </div>
              <div className={`${styles.pipelineNode} ${activeArchStep === 3 || activeArchStep === 6 || activeArchStep === 7 ? styles.pipelineNodeActive : ''}`}>
                <div className={styles.nodeIcon}>
                  <span style={{ fontSize: '1.8rem' }}>💻</span>
                </div>
                <span className={styles.nodeLabel}>Client</span>
              </div>
            </div>

            <div className={styles.archGrid}>
              {[
                { title: '1. DHT11 Sensor Setup', desc: 'Reads temperature and humidity using standard digital sensor readings over pin D4.', icon: '🌡️' },
                { title: '2. ESP8266 Cloud Client', desc: 'The NodeMCU pulls data from DHT11, registers to WiFi, and hosts a web-server generating HTML files with live telemetry.', icon: '📟' },
                { title: '3. Local WiFi Router Connection', desc: 'Facilitates standard HTTP requests to local networks using default static IPs (e.g. http://192.168.1.100).', icon: '🛜' },
                { title: '4. Client Web Browser Engine', desc: 'Receives sensor updates via HTTP pages on port 80, refreshing every 2 seconds via a client meta-refresh tag.', icon: '💻' },
                { title: '5. setup() Initializations', desc: 'Runs Serial initialization at 9600 baud rate, connects directly to WiFi, and starts local server configurations.', icon: '⚙️' },
                { title: '6. loop() Iterations', desc: 'Listens continually for browser clients to connect and responds with fresh digital metrics.', icon: '🔄' },
                { title: '7. handleRoot() Logic', desc: 'Invoked on target URL hits. It reads DHT metrics, parses into visual HTML templates, and delivers payloads.', icon: '🧠' },
                { title: '8. HTML Payload Delivery', desc: 'Builds clean text/html payloads that present parsed numbers and trigger meta-refresh auto loops for real-time views.', icon: '📦' }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`${styles.glassCard} ${activeArchStep === index ? styles.glassCardActive : ''}`}
                >
                  <div className={styles.archHeader}>
                    <div className={styles.archIconBox}>
                      <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    </div>
                    <div className={styles.archItemTitle}>{item.title}</div>
                  </div>
                  <div className={styles.archItemDesc}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
