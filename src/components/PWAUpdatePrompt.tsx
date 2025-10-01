import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function PWAUpdatePrompt() {
  const { toast } = useToast();
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: 'Atualização Disponível',
        description: 'Uma nova versão do app está disponível.',
        action: (
          <Button
            size="sm"
            onClick={() => {
              updateServiceWorker(true);
            }}
          >
            Atualizar
          </Button>
        ),
        duration: 10000,
      });
    }
  }, [needRefresh, toast, updateServiceWorker]);

  return null;
}
