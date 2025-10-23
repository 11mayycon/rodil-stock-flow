import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, Sunrise } from 'lucide-react';

interface StartShiftDialogProps {
  onShiftStarted: () => void;
}

export function StartShiftDialog({ onShiftStarted }: StartShiftDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    checkActiveShift();
  }, [user]);

  const checkActiveShift = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('active_shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(1);

      if (error) throw error;

      // Se não há turno ativo, mostrar o dialog
      if (!data || data.length === 0) {
        setOpen(true);
      } else {
        onShiftStarted();
      }
    } catch (error) {
      console.error('Error checking active shift:', error);
      setOpen(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Bom dia', icon: Sunrise };
    if (hour < 18) return { text: 'Boa tarde', icon: Sun };
    return { text: 'Boa noite', icon: Moon };
  };

  const handleStartShift = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('active_shifts')
        .insert([{
          user_id: user?.id,
          start_time: new Date().toISOString(),
        }]);

      if (error) throw error;

      setOpen(false);
      onShiftStarted();
    } catch (error) {
      console.error('Error starting shift:', error);
    } finally {
      setLoading(false);
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const firstName = user?.name?.split(' ')[0] || 'Usuário';

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <div className="flex items-center justify-center gap-3 mb-2">
              <GreetingIcon className="w-8 h-8 text-primary" />
              <span>{greeting.text}, {firstName}!</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-6">
          <p className="text-lg text-muted-foreground mb-4">
            Pronto para começar seu turno?
          </p>
          <p className="text-sm text-muted-foreground">
            Clique no botão abaixo para iniciar o dia
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={handleStartShift}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? 'Iniciando...' : 'Iniciar Dia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}