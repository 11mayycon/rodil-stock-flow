import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, DollarSign, Users, TrendingUp, FileText, Printer } from 'lucide-react';

interface ShiftSummary {
  totalSales: number;
  totalAmount: number;
  averageTicket: number;
  paymentSummary: Record<string, { count: number; amount: number }>;
  startTime: Date;
  endTime: Date;
}

export default function FinalizarTurno() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateShiftSummary = async () => {
    setLoading(true);
    try {
      // Buscar o turno ativo do usuário
      const { data: activeShift, error: shiftError } = await supabase
        .from('active_shifts')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (shiftError || !activeShift) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Você precisa iniciar um turno antes de finalizá-lo.',
        });
        setLoading(false);
        return;
      }

      const shiftStartTime = new Date(activeShift.start_time);
      const now = new Date();

      // Buscar vendas desde o início do turno
      const { data: sales, error } = await supabase
        .from('sales')
        .select('id,total,forma_pagamento,payment_submethod,created_at,sale_items(*)')
        .eq('user_id', user?.id)
        .gte('created_at', shiftStartTime.toISOString())
        .lte('created_at', now.toISOString());

      if (error) throw error;

      if (!sales || sales.length === 0) {
        toast({
          title: 'Sem vendas',
          description: 'Você não possui vendas registradas no turno de hoje.',
        });
        setLoading(false);
        return;
      }

      // Calcular resumo
      const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
      const paymentSummary: Record<string, { count: number; amount: number }> = {};

      sales.forEach(sale => {
        // Usar payment_submethod se disponível, caso contrário usar forma_pagamento
        const method = (sale as any).payment_submethod || sale.forma_pagamento || 'outro';
        if (!paymentSummary[method]) {
          paymentSummary[method] = { count: 0, amount: 0 };
        }
        paymentSummary[method].count++;
        paymentSummary[method].amount += Number(sale.total);
      });

      const shiftSummary: ShiftSummary = {
        totalSales: sales.length,
        totalAmount,
        averageTicket: totalAmount / sales.length,
        paymentSummary,
        startTime: shiftStartTime,
        endTime: now,
      };

      setSummary(shiftSummary);
      setShowReport(true);
    } catch (error) {
      console.error('Error calculating shift summary:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao calcular resumo do turno',
      });
    } finally {
      setLoading(false);
    }
  };

  const finalizeShift = async () => {
    if (!summary) return;

    setLoading(true);
    try {
      // Salvar fechamento no banco
      const { error } = await supabase
        .from('shift_closures')
        .insert([{
          user_id: user?.id,
          start_time: summary.startTime.toISOString(),
          end_time: summary.endTime.toISOString(),
          shift_start_time: summary.startTime.toISOString(),
          shift_end_time: summary.endTime.toISOString(),
          total_sales: summary.totalSales,
          total_amount: summary.totalAmount,
          average_ticket: summary.averageTicket,
          payment_summary: summary.paymentSummary,
          report_data: summary,
        }] as any);

      if (error) throw error;

      // Remover o turno ativo
      await supabase
        .from('active_shifts')
        .delete()
        .eq('user_id', user?.id);

      toast({
        title: 'Turno finalizado!',
        description: 'Relatório salvo com sucesso.',
      });

      setShowReport(false);
      // Mantemos o resumo para permitir a impressão
      setShowPrintDialog(true);
    } catch (error) {
      console.error('Error finalizing shift:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao finalizar turno',
      });
    } finally {
      setLoading(false);
    }
  };

  const printReport = async () => {
    if (!summary) return;

    try {
      const receiptNumber = `TURNO-${Date.now()}`;
      const now = new Date();

      // Preparar dados para impressão
      const paymentSummaryForPrint: Record<string, number> = {};
      Object.entries(summary.paymentSummary).forEach(([method, data]) => {
        paymentSummaryForPrint[method] = data.amount;
      });

      const reportData = {
        type: 'shift_closure',
        receiptNumber,
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR'),
        user: user?.name || 'Sistema',
        total: summary.totalAmount,
        shiftData: {
          totalSales: summary.totalSales,
          averageTicket: summary.averageTicket,
          paymentSummary: paymentSummaryForPrint,
          entryTotal: summary.totalAmount,
          exitTotal: summary.totalAmount,
          difference: 0,
        },
      };

      // Chamar edge function
      const { data, error } = await supabase.functions.invoke('print-receipt', {
        body: reportData,
      });

      if (error) throw error;

      toast({
        title: 'Relatório gerado!',
        description: 'Envie para a impressora térmica.',
      });

      console.log('Report text:', data.receiptText);
      setShowPrintDialog(false);
      // Limpa o resumo após a impressão
      setSummary(null);
    } catch (error) {
      console.error('Error printing report:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao gerar relatório para impressão',
      });
    }
  };

  const paymentMethodLabels: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'cartao_debito': 'Cartão de Débito',
    'cartao_credito': 'Cartão de Crédito',
    'pix': 'PIX',
    'cheque': 'Cheque',
    'outro': 'Outro',
    // Subcategorias de débito
    'visa_debito': 'Visa Débito',
    'elo_debito': 'Elo Débito',
    'maestro_debito': 'Maestro Débito',
    // Subcategorias de crédito
    'visa_credito': 'Visa Crédito',
    'elo_credito': 'Elo Crédito',
    'mastercard_credito': 'Mastercard Crédito',
    'amex_hipercard_credsystem': 'Amex / Hipercard / Credsystem',
  };

  return (
    <Layout title="Finalizar Turno" showBack>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Fechamento de Caixa - {user?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Clique no botão abaixo para calcular o resumo das suas vendas do dia e finalizar seu turno.
            </p>
            <Button
              onClick={calculateShiftSummary}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? 'Calculando...' : 'Calcular Resumo do Turno'}
            </Button>
          </CardContent>
        </Card>

        {/* Dialog com Relatório */}
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Relatório de Fechamento de Turno</DialogTitle>
            </DialogHeader>

            {summary && (
              <div className="space-y-6">
                {/* Resumo Geral */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Users className="w-8 h-8 mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Total de Vendas</p>
                        <p className="text-2xl font-bold">{summary.totalSales}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <DollarSign className="w-8 h-8 mb-2 text-success" />
                        <p className="text-sm text-muted-foreground">Total Vendido</p>
                        <p className="text-2xl font-bold">R$ {summary.totalAmount.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <TrendingUp className="w-8 h-8 mb-2 text-info" />
                        <p className="text-sm text-muted-foreground">Ticket Médio</p>
                        <p className="text-2xl font-bold">R$ {summary.averageTicket.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resumo por Forma de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo por Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(summary.paymentSummary).map(([method, data]) => (
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

                {/* Diferença de Caixa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Fechamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Entrada Total (A):</span>
                        <span className="font-medium">R$ {summary.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Saída Total (B):</span>
                        <span className="font-medium">R$ {summary.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Diferença (B - A):</span>
                        <span className="text-success">R$ 0.00</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReport(false)}>
                Cancelar
              </Button>
              <Button onClick={finalizeShift} disabled={loading}>
                {loading ? 'Finalizando...' : 'Finalizar e Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Impressão */}
        <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Imprimir Relatório
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Deseja gerar o relatório de fechamento de turno para impressão térmica?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
                Não
              </Button>
              <Button onClick={printReport}>
                <Printer className="w-4 h-4 mr-2" />
                Sim, Gerar Relatório
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
