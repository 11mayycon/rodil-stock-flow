import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isOpen, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      // Aguardar o DOM estar pronto antes de inicializar o scanner
      const timer = setTimeout(() => {
        const element = document.getElementById("qr-reader");
        if (!element) {
          console.error("Elemento qr-reader não encontrado");
          return;
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        };

        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          config,
          false
        );

        const onScanSuccess = (decodedText: string) => {
          console.log(`Código escaneado: ${decodedText}`);
          onScan(decodedText);
          handleClose();
        };

        const onScanFailure = (error: string) => {
          // Silenciar erros de scan contínuo
          if (!error.includes("NotFoundException")) {
            console.warn(`Erro no scanner: ${error}`);
          }
        };

        scannerRef.current.render(onScanSuccess, onScanFailure);
        setIsScanning(true);
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
        setIsScanning(false);
      }
    };
  }, [isOpen, onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
      setIsScanning(false);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner de Código de Barras
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="space-y-4">
          <div 
            id="qr-reader" 
            className="w-full"
            style={{ minHeight: '300px' }}
          />
          {!isScanning && (
            <div className="text-center text-sm text-muted-foreground">
              Aguardando permissão da câmera...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};