import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Sale {
  id: string;
  user_id: string;
  total: number;
  forma_pagamento: string;
  created_at: string;
  users?: { name: string };
}

interface SaleItem {
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
}

export default function HistoricoVendas() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      let query = supabase
        .from('sales')
        .select('*, users(name)')
        .order('created_at', { ascending: false });

      // Se não for admin, mostrar apenas vendas do usuário
      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const openSaleDetails = async (sale: Sale) => {
    try {
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id);

      if (error) throw error;
      setSaleItems(data || []);
      setSelectedSale(sale);
      setShowDialog(true);
    } catch (error) {
      console.error('Error loading sale items:', error);
    }
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      dinheiro: 'Dinheiro',
      cartao_debito: 'Cartão de Débito',
      cartao_credito: 'Cartão de Crédito',
      pix: 'PIX',
      outro: 'Outro',
    };
    return methods[method] || method;
  };

  return (
    <Layout title="Histórico de Vendas" showBack>
      <div className="space-y-4">
        {sales.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhuma venda registrada</p>
          </Card>
        ) : (
          sales.map((sale) => (
            <Card
              key={sale.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => openSaleDetails(sale)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  {isAdmin && sale.users && (
                    <p className="text-sm font-medium text-primary">
                      {sale.users.name}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                  <p className="text-sm">
                    Pagamento: {formatPaymentMethod(sale.forma_pagamento)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <DollarSign className="w-6 h-6" />
                    R$ {sale.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Data:</span>{' '}
                  {format(new Date(selectedSale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                {isAdmin && selectedSale.users && (
                  <p>
                    <span className="font-medium">Vendedor:</span> {selectedSale.users.name}
                  </p>
                )}
                <p>
                  <span className="font-medium">Pagamento:</span>{' '}
                  {formatPaymentMethod(selectedSale.forma_pagamento)}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Itens</h3>
                {saleItems.map((item, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.nome_produto}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantidade}x R$ {item.preco_unitario.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
