import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Package, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Product {
  id: string;
  codigo_barras: string;
  nome: string;
  preco: number;
  quantidade_estoque: number;
  unidade: string;
  descricao?: string;
}

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    codigo_barras: '',
    nome: '',
    preco: '',
    quantidade_estoque: '',
    unidade: 'un',
    descricao: '',
  });
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    loadProducts();
  }, [search]);

  const loadProducts = async () => {
    try {
      let query = supabase.from('products').select('*').order('nome');
      
      if (search) {
        query = query.or(`nome.ilike.%${search}%,codigo_barras.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({
      codigo_barras: '',
      nome: '',
      preco: '',
      quantidade_estoque: '',
      unidade: 'un',
      descricao: '',
    });
    setShowDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      codigo_barras: product.codigo_barras,
      nome: product.nome,
      preco: product.preco.toString(),
      quantidade_estoque: product.quantidade_estoque.toString(),
      unidade: product.unidade,
      descricao: product.descricao || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        codigo_barras: formData.codigo_barras,
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        quantidade_estoque: parseInt(formData.quantidade_estoque),
        unidade: formData.unidade,
        descricao: formData.descricao || null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: 'Produto atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData as any]);
        if (error) throw error;
        toast({ title: 'Produto cadastrado com sucesso!' });
      }

      setShowDialog(false);
      loadProducts();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      toast({ title: 'Produto excluído com sucesso!' });
      loadProducts();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const scanBarcode = async () => {
    try {
      setShowScanner(true);
      
      // Criar instância do scanner
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Configurar e iniciar o scanner
      await scanner.start(
        { facingMode: "environment" }, // Câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Código escaneado com sucesso
          setFormData({ ...formData, codigo_barras: decodedText });
          toast({
            title: 'Código escaneado!',
            description: decodedText,
          });
          stopScanner();
        },
        (errorMessage) => {
          // Erros durante o scan (pode ignorar)
          console.log('Scanning...', errorMessage);
        }
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar scanner',
        description: 'Verifique as permissões da câmera',
      });
      setShowScanner(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
      setShowScanner(false);
    } catch (error) {
      console.error('Error stopping scanner:', error);
      setShowScanner(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup ao desmontar o componente
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <Layout title="Produtos" showBack>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openCreateDialog} className="bg-gradient-to-r from-primary to-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Produto
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.nome}</h3>
                      <p className="text-sm text-muted-foreground">{product.codigo_barras}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        R$ {product.preco.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {product.quantidade_estoque} {product.unidade}
                      </p>
                    </div>
                  </div>
                  {product.descricao && (
                    <p className="text-sm text-muted-foreground">{product.descricao}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Criar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código de Barras</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  className="flex-1"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon"
                  onClick={scanBarcode}
                  title="Escanear código de barras"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Scanner Dialog */}
            {showScanner && (
              <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4">
                  <div className="text-center">
                    <h3 className="text-white text-lg font-semibold mb-2">
                      Escaneie o Código de Barras
                    </h3>
                    <p className="text-white/70 text-sm">
                      Posicione o código de barras dentro da área marcada
                    </p>
                  </div>
                  
                  <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
                  
                  <Button 
                    onClick={stopScanner}
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quantidade em Estoque</Label>
              <Input
                type="number"
                value={formData.quantidade_estoque}
                onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
