import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReceiptData {
  type: 'sale' | 'shift_closure';
  saleId?: string;
  receiptNumber: string;
  date: string;
  time: string;
  user: string;
  items?: Array<{
    nome: string;
    quantidade: number;
    preco: number;
    total: number;
  }>;
  total: number;
  paymentMethod?: string;
  shiftData?: {
    totalSales: number;
    averageTicket: number;
    paymentSummary: Record<string, number>;
    entryTotal: number;
    exitTotal: number;
    difference: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReceiptData = await req.json();
    
    let receiptText = '';
    
    if (data.type === 'sale') {
      // Gerar cupom de venda
      receiptText = generateSaleReceipt(data);
    } else if (data.type === 'shift_closure') {
      // Gerar relatório de fechamento de turno
      receiptText = generateShiftClosureReport(data);
    }
    
    console.log('Receipt generated:', receiptText);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        receiptText,
        message: 'Cupom gerado com sucesso. Envie para impressora térmica ESC/POS.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating receipt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateSaleReceipt(data: ReceiptData): string {
  const lines: string[] = [];
  
  lines.push('========================================');
  lines.push(' CENTRO AUTOMOTIVO CAMINHO CERTO LTDA');
  lines.push('      AV MANUEL DOMINGOS PINTO');
  lines.push('   PQ ANHANGUERA S10 PAULO-SP');
  lines.push('          CEP: 05120-000');
  lines.push('      CNPJ: 02.727.407/0001-40');
  lines.push('         IE: 115.263.059.110');
  lines.push('========================================');
  lines.push('');
  lines.push(`Doc: ${data.receiptNumber} FDV ${data.saleId || 'N/A'}`);
  lines.push(`Data/Hora: ${data.date} ${data.time}`);
  lines.push(`Responsável: ${data.user}`);
  lines.push('');
  lines.push('ESSE DOCUMENTO NÃO POSSUI VALOR FISCAL.');
  lines.push('========================================');
  lines.push('              PRODUTOS');
  lines.push('========================================');
  
  if (data.items && data.items.length > 0) {
    data.items.forEach(item => {
      lines.push(`${item.nome}`);
      lines.push(`  ${item.quantidade} x R$ ${item.preco.toFixed(2)} = R$ ${item.total.toFixed(2)}`);
    });
  }
  
  lines.push('========================================');
  lines.push(`TOTAL: R$ ${data.total.toFixed(2)}`);
  if (data.paymentMethod) {
    const paymentLabels: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'cartao_debito': 'Cartão de Débito',
      'cartao_credito': 'Cartão de Crédito',
      'pix': 'PIX',
      'outro': 'Outro'
    };
    lines.push(`Forma de Pagamento: ${paymentLabels[data.paymentMethod] || data.paymentMethod}`);
  }
  lines.push('========================================');
  lines.push('     OBRIGADO PELA PREFERÊNCIA!');
  lines.push('========================================');
  lines.push('');
  lines.push('');
  
  return lines.join('\n');
}

function generateShiftClosureReport(data: ReceiptData): string {
  const lines: string[] = [];
  
  lines.push('========================================');
  lines.push(' CENTRO AUTOMOTIVO CAMINHO CERTO LTDA');
  lines.push('      AV MANUEL DOMINGOS PINTO');
  lines.push('   PK ANHANGUERA S10 PAULO-SP');
  lines.push('          CEP: 05120-000');
  lines.push('      CNPJ: 02.727.407/0001-40');
  lines.push('         IE: 115.263.059.110');
  lines.push('========================================');
  lines.push('');
  lines.push(`Doc: ${data.receiptNumber}`);
  lines.push(`Data/Hora: ${data.date} ${data.time}`);
  lines.push(`Responsável: ${data.user}`);
  lines.push('');
  lines.push('   RELATÓRIO DE FECHAMENTO DE TURNO');
  lines.push('========================================');
  lines.push('');
  
  if (data.shiftData) {
    lines.push('--------------------------------------');
    lines.push('         RESUMO DO MOVIMENTO');
    lines.push('--------------------------------------');
    lines.push(`· Total de vendas: ${data.shiftData.totalSales}`);
    lines.push(`· Ticket médio: R$ ${data.shiftData.averageTicket.toFixed(2)}`);
    lines.push('');
    
    lines.push('--------------------------------------');
    lines.push('       RESUMO POR FORMA DE PGTO');
    lines.push('--------------------------------------');
    Object.entries(data.shiftData.paymentSummary).forEach(([method, amount]) => {
      const methodLabels: Record<string, string> = {
        'dinheiro': 'DINHEIRO',
        'cartao_debito': 'CARTÃO DÉBITO',
        'cartao_credito': 'CARTÃO CRÉDITO',
        'pix': 'PIX',
        'outro': 'OUTRO'
      };
      lines.push(`${methodLabels[method] || method}: R$ ${(amount as number).toFixed(2)}`);
    });
    lines.push('');
    
    lines.push('--------------------------------------');
    lines.push('         ENTRADA/RESUMO');
    lines.push('--------------------------------------');
    lines.push(`VENDA PRODUTOS: R$ ${data.shiftData.entryTotal.toFixed(2)}`);
    lines.push(`SUB TOTAL (A): R$ ${data.shiftData.entryTotal.toFixed(2)}`);
    lines.push('');
    
    lines.push('--------------------------------------');
    lines.push('        SAÍDA/FECHAMENTO');
    lines.push('--------------------------------------');
    lines.push(`TOTAL RECEBIDO: R$ ${data.shiftData.exitTotal.toFixed(2)}`);
    lines.push(`SUB TOTAL (B): R$ ${data.shiftData.exitTotal.toFixed(2)}`);
    lines.push('');
    
    lines.push('--------------------------------------');
    const diffType = data.shiftData.difference >= 0 ? 'SOBRA' : 'FALTA';
    lines.push(`DIFERENÇA (B - A) ${diffType} CAIXA:`);
    lines.push(`R$ ${Math.abs(data.shiftData.difference).toFixed(2)}`);
    lines.push('--------------------------------------');
  }
  
  lines.push('');
  lines.push('========================================');
  lines.push('');
  lines.push('');
  
  return lines.join('\n');
}
