import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, ArrowLeft, RotateCcw } from 'lucide-react';
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
      // Force stop all camera tracks (html5-qrcode doesn't always release them)
      const videos = document.querySelectorAll('#reader video');
      videos.forEach(video => {
        const mediaStream = (video as HTMLVideoElement).srcObject as MediaStream;
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          (video as HTMLVideoElement).srcObject = null;
        }
      });
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

  // Determine result type
  const getResultType = (): 'success' | 'warning' | 'error' => {
    if (!error) return 'success';
    if (scanResult?.status === 'used') return 'warning';
    return 'error';
  };

  const getResultInfo = () => {
    const type = getResultType();
    switch (type) {
      case 'success': return { icon: '✓', title: 'Bilhete Válido', subtitle: 'Entrada autorizada' };
      case 'warning': return { icon: '⚠', title: 'Bilhete Já Utilizado', subtitle: 'Este bilhete já foi usado anteriormente' };
      case 'error': return { icon: '✕', title: 'Bilhete Inválido', subtitle: error || 'Erro na validação' };
    }
  };

  if (!eventId) {
    return (
      <div className="container qr-scanner-page">
        <div className="scanner-empty-state">
          <h2>Nenhum Evento Selecionado</h2>
          <p>Seleciona um evento no dashboard para começar a digitalizar bilhetes.</p>
          <button className="btn-back" onClick={() => navigate('/organizer')}>
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container qr-scanner-page">
      <div className="scanner-header">
        <h1>
          <ScanLine size={24} />
          QR Code Scanner
        </h1>
        <p className="scanner-subtitle">Lê os bilhetes para validar a entrada no evento</p>
      </div>

      <div className="scanner-container">
        {isScanning ? (
          <div className="scanner-viewport">
            <div className="scanner-inner">
              <div id="reader"></div>
            </div>
            <div className="scanner-status">
              <span className="pulse-dot"></span>
              A aguardar leitura de QR Code...
            </div>
          </div>
        ) : (
          <div className="scan-next-area">
            <button className="btn-scan-next" onClick={resetScanner}>
              <RotateCcw size={16} />
              Digitalizar Próximo Bilhete
            </button>
          </div>
        )}

        {scannedCode && scanResult && (() => {
          const info = getResultInfo();
          const type = getResultType();
          return (
            <div className={`scan-result-card ${type}`}>
              <div className="result-banner">
                <div className="result-icon">{info.icon}</div>
                <div className="result-text">
                  <h3>{info.title}</h3>
                  <p>{info.subtitle}</p>
                </div>
              </div>
              <div className="result-details">
                <div className="detail-row">
                  <span className="detail-label">Código</span>
                  <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{scannedCode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Titular</span>
                  <span className="detail-value">{scanResult.users?.full_name || scanResult.users?.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fase</span>
                  <span className="detail-value">{scanResult.ticket_types?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado</span>
                  <span className={`status-pill ${scanResult.status}`}>
                    {scanResult.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {scannedCode && !scanResult && error && (
          <div className="scan-result-card error">
            <div className="result-banner">
              <div className="result-icon">✕</div>
              <div className="result-text">
                <h3>Inválido</h3>
                <p>{error}</p>
              </div>
            </div>
            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Código Lido</span>
                <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{scannedCode}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
