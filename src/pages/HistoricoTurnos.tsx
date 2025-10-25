import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, DollarSign, FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

interface ShiftClosure {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  shift_start_time: string | null;
  shift_end_time: string | null;
  total_sales: number;
  total_amount: number;
  average_ticket: number;
  payment_summary: Record<string, { count: number; amount: number }>;
  created_at: string;
}

export default function HistoricoTurnos() {
  const [shifts, setShifts] = useState<ShiftClosure[]>([]);
  const [selectedShift, setSelectedShift] = useState<ShiftClosure | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadShifts();
  }, [user]);

  const loadShifts = async () => {
    try {
      let query = supabase
        .from('shift_closures')
        .select('*')
        .order('created_at', { ascending: false });

      // Se não for admin, mostrar apenas os próprios turnos
      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setShifts((data || []) as unknown as ShiftClosure[]);
    } catch (error) {
      console.error('Error loading shifts:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar histórico de turnos',
      });
    } finally {
      setLoading(false);
    }
  };

  const openShiftDetails = (shift: ShiftClosure) => {
    setSelectedShift(shift);
    setShowDetails(true);
  };

  const printShiftReport = async () => {
    if (!selectedShift) return;

    try {
      const receiptNumber = `TURNO-${selectedShift.id.substring(0, 8)}`;
      const shiftDate = new Date(selectedShift.created_at);

      // Criar novo documento PDF
      const doc = new jsPDF();
      
      // Configurar fonte e título
      doc.setFontSize(16);
      doc.text('RELATÓRIO DE TURNO', 105, 20, { align: 'center' });
      
      // Linha separadora
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      // Informações do turno
      doc.setFontSize(12);
      let yPosition = 35;
      
      doc.text(`Número do Turno: ${receiptNumber}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Data: ${shiftDate.toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Hora: ${shiftDate.toLocaleTimeString('pt-BR')}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Usuário: ${user?.name || 'Sistema'}`, 20, yPosition);
      yPosition += 15;
      
      // Resumo do turno
      doc.setFontSize(14);
      doc.text('RESUMO DO TURNO', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      if (selectedShift.shift_start_time) {
        doc.text(`Início do Turno: ${new Date(selectedShift.shift_start_time).toLocaleTimeString('pt-BR')}`, 20, yPosition);
        yPosition += 8;
      }
      if (selectedShift.shift_end_time) {
        doc.text(`Fim do Turno: ${new Date(selectedShift.shift_end_time).toLocaleTimeString('pt-BR')}`, 20, yPosition);
        yPosition += 8;
      }
      doc.text(`Total de Vendas: ${selectedShift.total_sales}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Ticket Médio: R$ ${selectedShift.average_ticket.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.setFont(undefined, 'bold');
      doc.text(`TOTAL VENDIDO: R$ ${selectedShift.total_amount.toFixed(2)}`, 20, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 20;
      
      // Formas de pagamento
      doc.setFontSize(14);
      doc.text('FORMAS DE PAGAMENTO', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      Object.entries(selectedShift.payment_summary || {}).forEach(([method, data]) => {
        const methodLabel = paymentMethodLabels[method] || method;
        doc.text(`${methodLabel}: ${data.count} transações - R$ ${data.amount.toFixed(2)}`, 20, yPosition);
        yPosition += 8;
      });
      
      // Rodapé
      yPosition += 20;
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text('Relatório gerado automaticamente pelo sistema', 105, yPosition, { align: 'center' });
      
      // Salvar o PDF
      doc.save(`relatorio-turno-${receiptNumber}.pdf`);

      toast({
        title: 'Relatório gerado!',
        description: 'PDF baixado com sucesso.',
      });
    } catch (error) {
      console.error('Error printing report:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao gerar PDF',
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
      <Layout title="Histórico de Turnos" showBack>
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Histórico de Turnos" showBack>
      <div className="grid gap-4">
        {shifts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum turno finalizado encontrado</p>
            </CardContent>
          </Card>
        ) : (
          shifts.map((shift) => {
            const shiftDate = new Date(shift.created_at);
            return (
              <Card
                key={shift.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openShiftDetails(shift)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{shiftDate.toLocaleDateString('pt-BR')} às {shiftDate.toLocaleTimeString('pt-BR')}</span>
                      </div>
                      {shift.shift_start_time && shift.shift_end_time && (
                        <div className="text-sm text-muted-foreground">
                          Turno: {new Date(shift.shift_start_time).toLocaleTimeString('pt-BR')} - {new Date(shift.shift_end_time).toLocaleTimeString('pt-BR')}
                        </div>
                      )}
                      <p className="text-sm">
                        {shift.total_sales} vendas • Ticket médio: R$ {shift.average_ticket.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        R$ {shift.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Turno</DialogTitle>
          </DialogHeader>

          {selectedShift && (
            <div className="space-y-4">
              {/* Informações Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span className="font-medium">
                      {new Date(selectedShift.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {selectedShift.shift_start_time && (
                    <div className="flex justify-between">
                      <span>Horário Início:</span>
                      <span className="font-medium">
                        {new Date(selectedShift.shift_start_time).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {selectedShift.shift_end_time && (
                    <div className="flex justify-between">
                      <span>Horário Fim:</span>
                      <span className="font-medium">
                        {new Date(selectedShift.shift_end_time).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Total de Vendas:</span>
                    <span className="font-medium">{selectedShift.total_sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ticket Médio:</span>
                    <span className="font-medium">R$ {selectedShift.average_ticket.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Total Vendido:</span>
                    <span className="font-bold text-primary">
                      R$ {selectedShift.total_amount.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Detalhamento por Forma de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(selectedShift.payment_summary || {}).map(([method, data]) => (
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Fechar
            </Button>
            <Button onClick={printShiftReport}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}