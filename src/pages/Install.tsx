import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/iskxhand-logo.png";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <img src={logo} alt="ISKXHand Logo" className="w-24 h-24 rounded-3xl" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Install ISKXHand</h1>
          <p className="text-muted-foreground">
            Get the full app experience on your device
          </p>
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">App is installed!</span>
            </div>
            <Button onClick={() => navigate('/errands')} className="w-full">
              Open App
            </Button>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Install Now
            </Button>
            <p className="text-sm text-muted-foreground">
              Install ISKXHand to use it offline and get a native app experience
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-left space-y-3">
              <h3 className="font-semibold text-foreground">How to install:</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-primary">iOS:</span>
                  <span>Tap Share → Add to Home Screen</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-primary">Android:</span>
                  <span>Tap Menu (⋮) → Install app or Add to Home screen</span>
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm text-foreground">Benefits:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 text-left">
            <li>✓ Works offline</li>
            <li>✓ Faster loading</li>
            <li>✓ Native app feel</li>
            <li>✓ Home screen access</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Install;
