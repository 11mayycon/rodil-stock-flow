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
import { Search, Plus, Minus, Trash2, ShoppingCart, DollarSign, Printer, Clock, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarcodeScanner } from '@/components/BarcodeScanner';

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
  const [paymentSubMethod, setPaymentSubMethod] = useState<string>('');
  const [generateReceipt, setGenerateReceipt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
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

  const handleBarcodeScan = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('codigo_barras', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Produto não encontrado",
            description: `Nenhum produto encontrado com o código: ${code}`,
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
      
      if (data) {
        addToCart(data);
        toast({
          title: "Produto adicionado",
          description: `${data.nome} foi adicionado ao carrinho`,
        });
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast({
        title: "Erro no scanner",
        description: "Erro ao buscar produto pelo código de barras",
        variant: "destructive",
      });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      handleBarcodeScan(search.trim());
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
    // Mapear forma de pagamento para os valores aceitos pelo enum do banco
    let finalPaymentMethod = paymentMethod;
    
    if (paymentMethod === 'debito') {
      finalPaymentMethod = 'cartao_debito';
    } else if (paymentMethod === 'credito') {
      finalPaymentMethod = 'cartao_credito';
    }
    
    if (!finalPaymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione a forma de pagamento',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Adicione produtos ao carrinho antes de finalizar a venda',
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
          forma_pagamento: finalPaymentMethod,
        }] as any)
        .select()
        .single();

      if (saleError) {
        console.error('Sale error:', saleError);
        throw new Error(`Erro ao criar venda: ${saleError.message}`);
      }

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

      if (itemsError) {
        console.error('Items error:', itemsError);
        throw new Error(`Erro ao inserir itens da venda: ${itemsError.message}`);
      }

      // Atualizar estoque e criar movimentações
      for (const item of cart) {
        // Buscar quantidade atual do estoque
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('quantidade_estoque')
          .eq('id', item.id)
          .single();

        if (fetchError) {
          console.error('Fetch product error:', fetchError);
          throw new Error(`Erro ao buscar produto ${item.nome}: ${fetchError.message}`);
        }

        // Verificar se há estoque suficiente
        if (currentProduct.quantidade_estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para o produto ${item.nome}. Disponível: ${currentProduct.quantidade_estoque}, Solicitado: ${item.quantidade}`);
        }

        // Atualizar estoque
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantidade_estoque: currentProduct.quantidade_estoque - item.quantidade })
          .eq('id', item.id);

        if (updateError) {
          console.error('Update stock error:', updateError);
          throw new Error(`Erro ao atualizar estoque do produto ${item.nome}: ${updateError.message}`);
        }

        // Criar movimentação
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert([{
            product_id: item.id,
            user_id: user?.id,
            tipo: 'venda',
            quantidade: -item.quantidade,
            ref_id: sale.id,
          }] as any);

        if (movementError) {
          console.error('Movement error:', movementError);
          // Não falhar a venda por erro na movimentação, apenas logar
          console.warn(`Erro ao criar movimentação para ${item.nome}:`, movementError);
        }
      }

      // Gerar nota/recibo se solicitado
      let receiptError = null;
      if (generateReceipt) {
        try {
          await printReceipt(sale.id, total, now, finalPaymentMethod);
        } catch (error) {
          receiptError = error;
          console.error('Receipt error:', receiptError);
          // Não falhar a venda por erro na impressão
          toast({
            title: 'Venda finalizada!',
            description: `Total: R$ ${total.toFixed(2)} - Erro ao gerar cupom, mas venda foi registrada.`,
            variant: 'default',
          });
        }
      }

      if (!generateReceipt || !receiptError) {
        toast({
          title: 'Venda finalizada!',
          description: generateReceipt ? 
            `Total: R$ ${total.toFixed(2)} - Cupom gerado!` : 
            `Total: R$ ${total.toFixed(2)}`,
        });
      }

      // Limpar carrinho
      setCart([]);
      setShowCheckout(false);
      setPaymentMethod('');
      setPaymentSubMethod('');
      setGenerateReceipt(true);
    } catch (error: any) {
      console.error('Error finalizing sale:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao finalizar venda',
        description: error.message || 'Erro desconhecido ao finalizar venda',
      });
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = async (saleId: string, total: number, date: Date, finalPaymentMethod: string) => {
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
        paymentMethod: finalPaymentMethod,
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

  // Função para resetar sub-método quando muda o método principal
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    setPaymentSubMethod('');
  };

  // Função para obter as sub-opções baseadas no método principal
  const getSubPaymentOptions = () => {
    console.log('getSubPaymentOptions called with paymentMethod:', paymentMethod);
    if (paymentMethod === 'debito') {
      const options = [
        { value: 'visa_debito', label: 'Visa Débito' },
        { value: 'elo_debito', label: 'Elo Débito' },
        { value: 'maestro_debito', label: 'Maestro Débito' },
      ];
      console.log('Returning debito options:', options);
      return options;
    } else if (paymentMethod === 'credito') {
      const options = [
        { value: 'visa_credito', label: 'Visa Crédito' },
        { value: 'elo_credito', label: 'Elo Crédito' },
        { value: 'mastercard_credito', label: 'Mastercard Crédito' },
        { value: 'amex_hipercard_credsystem', label: 'Amex / Hipercard / Credsystem' },
      ];
      console.log('Returning credito options:', options);
      return options;
    }
    console.log('Returning empty array');
    return [];
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
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Escaneie ou digite o código de barras (Enter para adicionar)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowScanner(true)}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Camera className="w-4 h-4" />
            </Button>
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
              <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Sub-opções de pagamento */}
            {(paymentMethod === 'debito' || paymentMethod === 'credito') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {paymentMethod === 'debito' ? 'Tipo de Débito' : 'Tipo de Crédito'}
                </label>
                <Select value={paymentSubMethod} onValueChange={setPaymentSubMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubPaymentOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
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
              disabled={loading || !paymentMethod || ((paymentMethod === 'debito' || paymentMethod === 'credito') && !paymentSubMethod)}
              className="bg-gradient-to-r from-success to-green-600"
            >
              {loading ? 'Finalizando...' : 'Confirmar Venda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
      />
    </Layout>
  );
}
