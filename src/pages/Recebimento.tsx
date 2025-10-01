import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, Search, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  codigo_barras: string;
  nome: string;
  preco: number;
}

interface ReceiptItem {
  product_id: string;
  codigo_produto: string;
  nome_produto: string;
  quantidade: number;
  valor_unitario: number;
}

export default function Recebimento() {
  const [showDialog, setShowDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [formData, setFormData] = useState({
    numero_nota: '',
    fornecedor: '',
  });
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    quantidade: '',
    valor_unitario: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (searchProduct.length >= 2) {
      searchProducts();
    } else {
      setProducts([]);
    }
  }, [searchProduct]);

  const searchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`nome.ilike.%${searchProduct}%,codigo_barras.ilike.%${searchProduct}%`)
        .limit(10);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const selectProduct = (product: Product) => {
    setCurrentItem({
      ...currentItem,
      product_id: product.id,
      valor_unitario: product.preco.toString(),
    });
    setSearchProduct(product.nome);
    setProducts([]);
  };

  const addItem = () => {
    if (!currentItem.product_id || !currentItem.quantidade || !currentItem.valor_unitario) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos do item' });
      return;
    }

    const product = products.find(p => p.id === currentItem.product_id);
    if (!product) return;

    const newItem: ReceiptItem = {
      product_id: currentItem.product_id,
      codigo_produto: product.codigo_barras,
      nome_produto: product.nome,
      quantidade: parseInt(currentItem.quantidade),
      valor_unitario: parseFloat(currentItem.valor_unitario),
    };

    setItems([...items, newItem]);
    setCurrentItem({ product_id: '', quantidade: '', valor_unitario: '' });
    setSearchProduct('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast({ variant: 'destructive', title: 'Adicione pelo menos um item' });
      return;
    }

    try {
      // Criar recebimento
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert([{
          numero_nota: formData.numero_nota,
          fornecedor: formData.fornecedor,
          created_by: user?.id,
        }] as any)
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Inserir itens
      const receiptItems = items.map(item => ({
        receipt_id: receipt.id,
        product_id: item.product_id,
        codigo_produto: item.codigo_produto,
        nome_produto: item.nome_produto,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
      }));

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(receiptItems as any);

      if (itemsError) throw itemsError;

      // Atualizar estoque e criar movimentações
      for (const item of items) {
        // Buscar produto atual
        const { data: product } = await supabase
          .from('products')
          .select('quantidade_estoque')
          .eq('id', item.product_id)
          .single();

        if (product) {
          // Atualizar estoque
          await supabase
            .from('products')
            .update({ quantidade_estoque: product.quantidade_estoque + item.quantidade })
            .eq('id', item.product_id);

          // Criar movimentação
          await supabase
            .from('stock_movements')
            .insert([{
              product_id: item.product_id,
              user_id: user?.id,
              tipo: 'entrada',
              quantidade: item.quantidade,
              ref_id: receipt.id,
            }] as any);
        }
      }

      toast({ title: 'Recebimento registrado com sucesso!' });
      setShowDialog(false);
      setFormData({ numero_nota: '', fornecedor: '' });
      setItems([]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  return (
    <Layout title="Recebimento de Produtos" showBack>
      <div className="space-y-6">
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-success to-green-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Recebimento
        </Button>

        <Card className="p-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Clique em "Novo Recebimento" para registrar a entrada de produtos
          </p>
        </Card>
      </div>

      {/* Dialog de Novo Recebimento */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Recebimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Dados da Nota */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número da Nota</Label>
                <Input
                  value={formData.numero_nota}
                  onChange={(e) => setFormData({ ...formData, numero_nota: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                />
              </div>
            </div>

            {/* Adicionar Item */}
            <Card className="p-4 bg-accent/50">
              <h3 className="font-semibold mb-4">Adicionar Item</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produto..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {products.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-accent cursor-pointer"
                          onClick={() => selectProduct(product)}
                        >
                          <p className="font-medium">{product.nome}</p>
                          <p className="text-sm text-muted-foreground">{product.codigo_barras}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={currentItem.quantidade}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantidade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Unitário (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currentItem.valor_unitario}
                      onChange={(e) => setCurrentItem({ ...currentItem, valor_unitario: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addItem} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </Card>

            {/* Lista de Itens */}
            {items.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Itens do Recebimento</h3>
                {items.map((item, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.nome_produto}</p>
                        <p className="text-sm text-muted-foreground">
                          Qtd: {item.quantidade} | R$ {item.valor_unitario.toFixed(2)} un
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={items.length === 0}>
              Confirmar Recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
