import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Users } from 'lucide-react';

interface UserSales {
  user_id: string;
  user_name: string;
  total_amount: number;
  total_sales: number;
  payment_breakdown: Record<string, { count: number; amount: number }>;
}

export default function VendasAdmin() {
  const [userSales, setUserSales] = useState<UserSales[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSales | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserSales();
  }, []);

  const loadUserSales = async () => {
    try {
      // Buscar todas as vendas com informações do usuário
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id, user_id, total, forma_pagamento, payment_submethod, created_at');

      if (salesError) throw salesError;

      // Buscar informações dos usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name');

      if (usersError) throw usersError;

      // Criar um mapa de usuários
      const userMap = new Map(users?.map(u => [u.id, u.name]));

      // Agrupar vendas por usuário
      const salesByUser = new Map<string, UserSales>();

      sales?.forEach(sale => {
        const userId = sale.user_id;
        if (!userId) return;

        if (!salesByUser.has(userId)) {
          salesByUser.set(userId, {
            user_id: userId,
            user_name: userMap.get(userId) || 'Usuário Desconhecido',
            total_amount: 0,
            total_sales: 0,
            payment_breakdown: {},
          });
        }

        const userSale = salesByUser.get(userId)!;
        userSale.total_amount += Number(sale.total);
        userSale.total_sales += 1;

        // Agrupar por forma de pagamento
        const paymentMethod = sale.payment_submethod || sale.forma_pagamento || 'outro';
        if (!userSale.payment_breakdown[paymentMethod]) {
          userSale.payment_breakdown[paymentMethod] = { count: 0, amount: 0 };
        }
        userSale.payment_breakdown[paymentMethod].count += 1;
        userSale.payment_breakdown[paymentMethod].amount += Number(sale.total);
      });

      // Converter para array e ordenar por total vendido
      const salesArray = Array.from(salesByUser.values()).sort(
        (a, b) => b.total_amount - a.total_amount
      );

      setUserSales(salesArray);
    } catch (error) {
      console.error('Error loading user sales:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar vendas por usuário',
      });
    } finally {
      setLoading(false);
    }
  };

  const openUserDetails = (userSale: UserSales) => {
    setSelectedUser(userSale);
    setShowDetails(true);
  };

  const paymentMethodLabels: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'cartao_debito': 'Cartão de Débito',
    'cartao_credito': 'Cartão de Crédito',
    'pix': 'PIX',
    'cheque': 'Cheque',
    'outro': 'Outro',
    'visa_debito': 'Visa Débito',
    'elo_debito': 'Elo Débito',
    'maestro_debito': 'Maestro Débito',
    'visa_credito': 'Visa Crédito',
    'elo_credito': 'Elo Crédito',
    'mastercard_credito': 'Mastercard Crédito',
    'amex_hipercard_credsystem': 'Amex / Hipercard / Credsystem',
  };

  if (loading) {
    return (
      <Layout title="Vendas por Usuário" showBack>
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  const totalGeral = userSales.reduce((sum, u) => sum + u.total_amount, 0);

  return (
    <Layout title="Vendas por Usuário" showBack>
      <div className="space-y-4">
        {/* Card Total Geral */}
        <Card className="bg-gradient-to-br from-primary to-primary-hover text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Geral de Vendas</p>
                <p className="text-3xl font-bold">R$ {totalGeral.toFixed(2)}</p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Cards de Usuários */}
        {userSales.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma venda registrada</p>
            </CardContent>
          </Card>
        ) : (
          userSales.map((userSale) => (
            <Card
              key={userSale.user_id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => openUserDetails(userSale)}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{userSale.user_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {userSale.total_sales} vendas realizadas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((userSale.total_amount / totalGeral) * 100).toFixed(1)}% do total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      R$ {userSale.total_amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total vendido</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes de Vendas - {selectedUser?.user_name}</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {/* Resumo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de Vendas:</span>
                    <span className="font-medium">{selectedUser.total_sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ticket Médio:</span>
                    <span className="font-medium">
                      R$ {(selectedUser.total_amount / selectedUser.total_sales).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Total Vendido:</span>
                    <span className="font-bold text-primary">
                      R$ {selectedUser.total_amount.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Detalhamento por Subcategoria de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Subcategoria de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(selectedUser.payment_breakdown).map(([method, data]) => (
                      <div key={method} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{paymentMethodLabels[method] || method}</p>
                          <p className="text-sm text-muted-foreground">{data.count} transações</p>
                        </div>
                        <p className="font-bold text-primary">R$ {data.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}