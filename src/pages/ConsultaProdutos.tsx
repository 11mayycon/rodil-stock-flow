import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Package, Search, AlertTriangle, TrendingDown, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductWithSale {
  id: string;
  nome: string;
  codigo_barras: string | null;
  quantidade_estoque: number;
  ultima_venda: string | null;
}

export default function ConsultaProdutos() {
  const [products, setProducts] = useState<ProductWithSale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showOldSalesDialog, setShowOldSalesDialog] = useState(false);
  const [showLowStockDialog, setShowLowStockDialog] = useState(false);
  const [showOutOfStockDialog, setShowOutOfStockDialog] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Buscar produtos com última venda
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, nome, codigo_barras, quantidade_estoque')
        .order('nome');

      if (productsError) throw productsError;

      // Para cada produto, buscar a última venda
      const productsWithSales = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: lastSaleItem } = await supabase
            .from('sale_items')
            .select('sale_id, sales(created_at)')
            .eq('product_id', product.id)
            .order('sales(created_at)', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...product,
            ultima_venda: lastSaleItem?.sales?.created_at || null,
          };
        })
      );

      setProducts(productsWithSales);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (quantidade: number) => {
    if (quantidade > 20) return 'bg-success/10 border-success text-success';
    if (quantidade >= 10) return 'bg-yellow-500/10 border-yellow-500 text-yellow-600';
    return 'bg-destructive/10 border-destructive text-destructive';
  };

  const getStockLabel = (quantidade: number) => {
    if (quantidade > 20) return 'Estoque Normal';
    if (quantidade >= 10) return 'Estoque Médio';
    return 'Estoque Baixo';
  };

  const filteredProducts = products.filter(
    (product) =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular dias desde última venda
  const getDaysSinceLastSale = (lastSaleDate: string | null) => {
    if (!lastSaleDate) return 999; // Nunca vendido
    const diffTime = new Date().getTime() - new Date(lastSaleDate).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Listas filtradas
  const productsNotSoldIn10DaysList = products.filter((p) => getDaysSinceLastSale(p.ultima_venda) > 10);
  const productsLowStockList = products.filter((p) => p.quantidade_estoque > 0 && p.quantidade_estoque < 10);
  const productsOutOfStockList = products.filter((p) => p.quantidade_estoque === 0);

  if (loading) {
    return (
      <Layout title="Consulta de Produtos" showBack>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Consulta de Produtos" showBack>
      <div className="space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="border-2 border-yellow-500/30 bg-yellow-500/5 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setShowOldSalesDialog(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <TrendingDown className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sem venda +10 dias</p>
                  <p className="text-3xl font-bold text-yellow-600">{productsNotSoldIn10DaysList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-orange-500/30 bg-orange-500/5 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setShowLowStockDialog(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque baixo (&lt;10)</p>
                  <p className="text-3xl font-bold text-orange-600">{productsLowStockList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-destructive/30 bg-destructive/5 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setShowOutOfStockDialog(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque zerado</p>
                  <p className="text-3xl font-bold text-destructive">{productsOutOfStockList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar por nome ou código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`border-2 transition-all hover:shadow-lg ${getStockColor(
                  product.quantidade_estoque
                )}`}
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {product.nome}
                      </h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-background/50">
                        {getStockLabel(product.quantidade_estoque)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Código:</span>
                        <span className="font-medium">
                          {product.codigo_barras || 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estoque:</span>
                        <span className="font-bold text-lg">
                          {product.quantidade_estoque} un
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Última Venda:
                        </span>
                        <span className="font-medium">
                          {product.ultima_venda
                            ? format(new Date(product.ultima_venda), 'dd/MM/yyyy')
                            : 'Nunca vendido'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog - Produtos sem venda há mais de 10 dias */}
        <Dialog open={showOldSalesDialog} onOpenChange={setShowOldSalesDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <TrendingDown className="w-5 h-5" />
                Produtos sem venda há mais de 10 dias
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {productsNotSoldIn10DaysList.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum produto nesta categoria</p>
              ) : (
                productsNotSoldIn10DaysList.map((product) => (
                  <Card key={product.id} className="border-yellow-500/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{product.nome}</h4>
                          <p className="text-sm text-muted-foreground">Código: {product.codigo_barras || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Estoque</p>
                          <p className="font-bold">{product.quantidade_estoque} un</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.ultima_venda 
                              ? `${getDaysSinceLastSale(product.ultima_venda)} dias sem venda` 
                              : 'Nunca vendido'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog - Produtos com estoque baixo */}
        <Dialog open={showLowStockDialog} onOpenChange={setShowLowStockDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-5 h-5" />
                Produtos com estoque baixo (menos de 10)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {productsLowStockList.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum produto nesta categoria</p>
              ) : (
                productsLowStockList.map((product) => (
                  <Card key={product.id} className="border-orange-500/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{product.nome}</h4>
                          <p className="text-sm text-muted-foreground">Código: {product.codigo_barras || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Estoque</p>
                          <p className="font-bold text-orange-600">{product.quantidade_estoque} un</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.ultima_venda 
                              ? format(new Date(product.ultima_venda), 'dd/MM/yyyy')
                              : 'Nunca vendido'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog - Produtos com estoque zerado */}
        <Dialog open={showOutOfStockDialog} onOpenChange={setShowOutOfStockDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="w-5 h-5" />
                Produtos com estoque zerado
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {productsOutOfStockList.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum produto nesta categoria</p>
              ) : (
                productsOutOfStockList.map((product) => (
                  <Card key={product.id} className="border-destructive/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{product.nome}</h4>
                          <p className="text-sm text-muted-foreground">Código: {product.codigo_barras || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Estoque</p>
                          <p className="font-bold text-destructive">{product.quantidade_estoque} un</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.ultima_venda 
                              ? format(new Date(product.ultima_venda), 'dd/MM/yyyy')
                              : 'Nunca vendido'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
