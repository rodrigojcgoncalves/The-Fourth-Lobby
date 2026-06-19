import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './QRScannerPage.css';

interface ScannedTicket {
  qr_code: string;
  status: string;
  users?: { email: string; full_name?: string };
  ticket_types?: { name: string };
}

export default function QRScannerPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  const navigate = useNavigate();

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScannedTicket | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }, false);

      scanner.render(
        (decodedText) => {
          // Quando o código é lido com sucesso
          setScannedCode(decodedText);
          setIsScanning(false);
          if (scanner) {
            scanner.clear().catch(console.error);
          }
          validateTicket(decodedText);
        },
        (error) => {
          // ignorar erros de scan contínuo
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, isScanning]);

  const validateTicket = async (qrCode: string) => {
    setError(null);
    setMessage(null);
    setScanResult(null);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Sessão expirada. Faz login novamente.');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/events/${eventId}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qr_code: qrCode })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erro ao validar bilhete.');
        if (data.ticket) {
           setScanResult(data.ticket);
        }
      } else {
        setMessage(data.message);
        setScanResult(data.ticket);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na comunicação com o servidor.');
    }
  };

  const resetScanner = () => {
    setScannedCode(null);
    setScanResult(null);
    setMessage(null);
    setError(null);
    setIsScanning(true);
  };

  if (!eventId) {
    return (
      <div className="container qr-scanner-page">
        <div style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <h2>Nenhum Evento Selecionado</h2>
          <button className="btn-primary" onClick={() => navigate('/organizer')}>Voltar ao Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container qr-scanner-page">
      <h1>QR Code Scanner</h1>
      <p className="subtitle">Lê os bilhetes para validar a entrada no evento</p>

      <div className="scanner-container">
        {isScanning ? (
          <div className="scanner-box" style={{ background: '#fff', color: '#000', borderRadius: '12px', overflow: 'hidden' }}>
            <div id="reader" style={{ width: '100%', border: 'none' }}></div>
          </div>
        ) : (
          <div className="scan-actions" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button className="btn-primary" onClick={resetScanner}>Digitalizar Próximo Bilhete</button>
          </div>
        )}

        {scannedCode && scanResult && (
          <div className={`scan-result ${error ? (scanResult.status === 'used' ? 'warning' : 'error') : 'success'}`}>
            <h3>
              {error ? (scanResult.status === 'used' ? '⚠️ Bilhete Já Utilizado' : '❌ Bilhete Inválido') : '✓ Bilhete Válido'}
            </h3>
            {message && <p style={{ marginBottom: '1rem', opacity: 0.8 }}>{message}</p>}
            {error && <p style={{ marginBottom: '1rem', color: '#ff4d4f' }}>{error}</p>}
            
            <div className="result-info">
              <div className="info-row">
                <span className="label">Código:</span>
                <span className="value">{scannedCode}</span>
              </div>
              <div className="info-row">
                <span className="label">Titular:</span>
                <span className="value">{scanResult.users?.full_name || scanResult.users?.email || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Fase:</span>
                <span className="value">{scanResult.ticket_types?.name || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="label">Estado Atual:</span>
                <span className={`value status-${scanResult.status}`}>
                  {scanResult.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}

        {scannedCode && !scanResult && error && (
           <div className="scan-result error">
             <h3>❌ Inválido</h3>
             <p>{error}</p>
             <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.5 }}>Código: {scannedCode}</p>
           </div>
        )}
      </div>
    </div>
  );
}
