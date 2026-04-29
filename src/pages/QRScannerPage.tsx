import { useState } from 'react';
import './QRScannerPage.css';

export default function QRScannerPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleFakeScan = () => {
    setScannedCode('TICKET-2024-00123-ABC');
  };

  return (
    <div className="container qr-scanner-page">
      <h1>QR Code Scanner</h1>
      <p className="subtitle">Scan tickets for event entry validation</p>

      <div className="scanner-container">
        <div className="scanner-box">
          <div className="scanner-preview">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="qr-placeholder">
              <rect x="10" y="10" width="180" height="180" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="50" y1="30" x2="50" y2="50" stroke="currentColor" strokeWidth="2"/>
              <line x1="30" y1="50" x2="50" y2="50" stroke="currentColor" strokeWidth="2"/>
              <line x1="150" y1="30" x2="150" y2="50" stroke="currentColor" strokeWidth="2"/>
              <line x1="150" y1="50" x2="170" y2="50" stroke="currentColor" strokeWidth="2"/>
              <line x1="50" y1="150" x2="50" y2="170" stroke="currentColor" strokeWidth="2"/>
              <line x1="30" y1="150" x2="50" y2="150" stroke="currentColor" strokeWidth="2"/>
              <text x="100" y="105" textAnchor="middle" fill="currentColor" fontSize="12">Point camera at QR code</text>
            </svg>
          </div>
          <p className="scanner-info">Align QR code within the frame</p>
        </div>

        <button className="btn-primary" onClick={handleFakeScan}>
          Simulate Scan
        </button>

        {scannedCode && (
          <div className="scan-result success">
            <h3>✓ Ticket Valid</h3>
            <div className="result-info">
              <div className="info-row">
                <span className="label">Ticket ID:</span>
                <span className="value">{scannedCode}</span>
              </div>
              <div className="info-row">
                <span className="label">Event:</span>
                <span className="value">DIMENSION IV: The Awakening</span>
              </div>
              <div className="info-row">
                <span className="label">Holder:</span>
                <span className="value">John Doe</span>
              </div>
              <div className="info-row">
                <span className="label">Status:</span>
                <span className="value status-valid">VALID</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
