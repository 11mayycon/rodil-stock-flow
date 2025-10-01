import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus, Trash2, ShoppingCart, DollarSign, Printer, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  codigo_barras: string;
  nome: string;
  preco: number;
  quantidade_estoque: number;
}

interface CartItem extends Product {
  quantidade: number;
}

export default function PDV() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [generateReceipt, setGenerateReceipt] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (search.length >= 2) {
      searchProducts();
    } else {
      setProducts([]);
    }
  }, [search]);

  const searchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`nome.ilike.%${search}%,codigo_barras.ilike.%${search}%`)
        .limit(10);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantidade + 1);
    } else {
      setCart([...cart, { ...product, quantidade: 1 }]);
    }
    setSearch('');
    setProducts([]);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantidade: newQuantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const finalizeSale = async () => {
    if (!paymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione a forma de pagamento',
      });
      return;
    }

    setLoading(true);
    try {
      const total = calculateTotal();
      const now = new Date();

      // Criar venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          user_id: user?.id,
          total,
          forma_pagamento: paymentMethod,
        }] as any)
        .select()
        .single();

      if (saleError) throw saleError;

      // Inserir itens da venda
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.id,
        codigo_produto: item.codigo_barras,
        nome_produto: item.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems as any);

      if (itemsError) throw itemsError;

      // Atualizar estoque e criar movimentações
      for (const item of cart) {
        // Atualizar estoque
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantidade_estoque: item.quantidade_estoque - item.quantidade })
          .eq('id', item.id);

        if (updateError) throw updateError;

        // Criar movimentação
        await supabase
          .from('stock_movements')
          .insert([{
            product_id: item.id,
            user_id: user?.id,
            tipo: 'venda',
            quantidade: -item.quantidade,
            ref_id: sale.id,
          }] as any);
      }

      // Gerar nota/recibo se solicitado
      if (generateReceipt) {
        await printReceipt(sale.id, total, now);
      }

      toast({
        title: 'Venda finalizada!',
        description: generateReceipt ? 
          `Total: R$ ${total.toFixed(2)} - Cupom gerado!` : 
          `Total: R$ ${total.toFixed(2)}`,
      });

      // Limpar carrinho
      setCart([]);
      setShowCheckout(false);
      setPaymentMethod('');
      setGenerateReceipt(true);
    } catch (error) {
      console.error('Error finalizing sale:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao finalizar venda',
      });
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = async (saleId: string, total: number, date: Date) => {
    try {
      const receiptNumber = `NF-${Date.now()}`;
      
      const receiptData = {
        type: 'sale',
        saleId,
        receiptNumber,
        date: date.toLocaleDateString('pt-BR'),
        time: date.toLocaleTimeString('pt-BR'),
        user: user?.name || 'Sistema',
        items: cart.map(item => ({
          nome: item.nome,
          quantidade: item.quantidade,
          preco: item.preco,
          total: item.preco * item.quantidade,
        })),
        total,
        paymentMethod,
      };

      // Chamar edge function para gerar cupom
      const { data, error } = await supabase.functions.invoke('print-receipt', {
        body: receiptData,
      });

      if (error) throw error;

      // Salvar log do recibo
      await supabase.from('receipts_log').insert([{
        sale_id: saleId,
        user_id: user?.id,
        receipt_number: receiptNumber,
        receipt_data: receiptData,
      }] as any);

      console.log('Receipt text:', data.receiptText);
    } catch (error) {
      console.error('Error printing receipt:', error);
      // Não falhar a venda se a impressão falhar
    }
  };

  return (
    <Layout title="PDV - Ponto de Venda" showBack>
      {isAdmin && (
        <div className="mb-4">
          <Button
            onClick={() => navigate('/finalizar-turno')}
            variant="outline"
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Finalizar Turno
          </Button>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Busca de Produtos */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Buscar Produto</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome ou código de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {products.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.codigo_barras} | Estoque: {product.quantidade_estoque}
                      </p>
                    </div>
                    <p className="font-bold text-primary">
                      R$ {product.preco.toFixed(2)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Carrinho */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrinho
            </h2>
            {cart.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCart([])}
              >
                Limpar
              </Button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {cart.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.preco.toFixed(2)} un
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantidade}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                          disabled={item.quantidade >= item.quantidade_estoque}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="font-bold text-primary">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {calculateTotal().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-success to-green-600"
                  onClick={() => setShowCheckout(true)}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Finalizar Venda
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Dialog de Checkout */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Total da Venda</p>
              <p className="text-3xl font-bold text-primary">
                R$ {calculateTotal().toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="generate-receipt" className="cursor-pointer">
                  Gerar nota/recibo não fiscal?
                </Label>
              </div>
              <Switch
                id="generate-receipt"
                checked={generateReceipt}
                onCheckedChange={setGenerateReceipt}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancelar
            </Button>
            <Button
              onClick={finalizeSale}
              disabled={loading || !paymentMethod}
              className="bg-gradient-to-r from-success to-green-600"
            >
              {loading ? 'Finalizando...' : 'Confirmar Venda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
