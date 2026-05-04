import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroSense IoT - Weather Monitoring System",
  description: "Real-time sensor telemetry from NodeMCU ESP8266 and DHT11.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
