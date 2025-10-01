import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Movement {
  id: string;
  tipo: string;
  quantidade: number;
  motivo?: string;
  created_at: string;
  products?: { nome: string };
  users?: { name: string };
}

export default function Movimentacoes() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      let query = supabase
        .from('stock_movements')
        .select('*, products(nome), users(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      // Se não for admin, mostrar apenas movimentações do usuário
      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Error loading movements:', error);
    }
  };

  const getMovementTypeLabel = (tipo: string) => {
    const types: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' }> = {
      entrada: { label: 'Entrada', variant: 'secondary' },
      venda: { label: 'Venda', variant: 'default' },
      ajuste: { label: 'Ajuste', variant: 'secondary' },
      desperdicio: { label: 'Desperdício', variant: 'destructive' },
    };
    return types[tipo] || { label: tipo, variant: 'default' };
  };

  const getIcon = (tipo: string, quantidade: number) => {
    if (quantidade > 0) {
      return <TrendingUp className="w-4 h-4 text-success" />;
    }
    return <TrendingDown className="w-4 h-4 text-destructive" />;
  };

  return (
    <Layout title="Movimentações" showBack>
      <div className="space-y-4">
        {movements.length === 0 ? (
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
          </Card>
        ) : (
          movements.map((movement) => {
            const typeInfo = getMovementTypeLabel(movement.tipo);
            return (
              <Card key={movement.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getIcon(movement.tipo, movement.quantidade)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                        {movement.products && (
                          <p className="font-medium">{movement.products.nome}</p>
                        )}
                      </div>
                      {isAdmin && movement.users && (
                        <p className="text-sm text-muted-foreground">
                          Por: {movement.users.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(movement.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {movement.motivo && (
                        <p className="text-sm text-muted-foreground">
                          Motivo: {movement.motivo}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${movement.quantidade > 0 ? 'text-success' : 'text-destructive'}`}>
                      {movement.quantidade > 0 ? '+' : ''}{movement.quantidade}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Layout>
  );
}
