import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserSales {
  user_id: string;
  user_name: string;
  total: number;
  sales_count: number;
}

export default function VendaTotal() {
  const [totalToday, setTotalToday] = useState(0);
  const [userSales, setUserSales] = useState<UserSales[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Buscar todas as vendas de hoje
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*, users(name)')
        .gte('created_at', todayISO);

      if (error) throw error;

      // Calcular total geral
      const total = sales?.reduce((acc, sale) => acc + sale.total, 0) || 0;
      setTotalToday(total);

      // Agrupar por usuário
      const userSalesMap = new Map<string, UserSales>();
      
      sales?.forEach((sale) => {
        const userId = sale.user_id;
        const userName = sale.users?.name || 'Desconhecido';
        
        if (userSalesMap.has(userId)) {
          const existing = userSalesMap.get(userId)!;
          userSalesMap.set(userId, {
            ...existing,
            total: existing.total + sale.total,
            sales_count: existing.sales_count + 1,
          });
        } else {
          userSalesMap.set(userId, {
            user_id: userId,
            user_name: userName,
            total: sale.total,
            sales_count: 1,
          });
        }
      });

      const userSalesArray = Array.from(userSalesMap.values());
      userSalesArray.sort((a, b) => b.total - a.total);
      setUserSales(userSalesArray);
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };

  return (
    <Layout title="Venda Total" showBack>
      <div className="space-y-6">
        <Card
          className="p-8 text-center cursor-pointer hover:shadow-xl transition-all"
          onClick={() => setShowDialog(true)}
        >
          <div className="mb-4">
            <DollarSign className="w-16 h-16 mx-auto text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Total Vendido Hoje
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <p className="text-5xl font-bold text-primary mb-4">
            R$ {totalToday.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Clique para ver detalhes por vendedor
          </p>
        </Card>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vendas por Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {userSales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma venda registrada hoje
              </p>
            ) : (
              userSales.map((userSale) => (
                <Card key={userSale.user_id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{userSale.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {userSale.sales_count} venda{userSale.sales_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        R$ {userSale.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {((userSale.total / totalToday) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
