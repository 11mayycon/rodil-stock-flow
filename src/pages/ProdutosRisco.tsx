import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ProductAtRisk {
  id: string;
  nome: string;
  codigo_barras: string | null;
  quantidade_estoque: number;
  ultima_venda: string | null;
  risco: 'baixo_estoque' | 'sem_vendas' | 'ambos';
}

export default function ProdutosRisco() {
  const [products, setProducts] = useState<ProductAtRisk[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductAtRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProductsAtRisk();
  }, []);

  const loadProductsAtRisk = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, nome, codigo_barras, quantidade_estoque')
        .order('quantidade_estoque');

      if (productsError) throw productsError;

      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const productsAtRisk = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: lastSaleItem } = await supabase
            .from('sale_items')
            .select('sale_id, sales(created_at)')
            .eq('product_id', product.id)
            .order('sales(created_at)', { ascending: false })
            .limit(1)
            .maybeSingle();

          const ultima_venda = lastSaleItem?.sales?.created_at || null;
          const temEstoqueBaixo = product.quantidade_estoque < 5;
          const temEstoqueMedio = product.quantidade_estoque >= 10 && product.quantidade_estoque <= 20;
          const semVendasRecentes = !ultima_venda || new Date(ultima_venda) < tenDaysAgo;

          let risco: 'baixo_estoque' | 'sem_vendas' | 'ambos' = 'baixo_estoque';
          
          if ((temEstoqueBaixo || temEstoqueMedio) && semVendasRecentes) {
            risco = 'ambos';
          } else if (semVendasRecentes) {
            risco = 'sem_vendas';
          }

          return {
            ...product,
            ultima_venda,
            risco,
          };
        })
      );

      // Filtrar apenas produtos em risco
      const filtered = productsAtRisk.filter(
        (p) => p.quantidade_estoque < 5 || (p.quantidade_estoque >= 10 && p.quantidade_estoque <= 20) || p.risco === 'sem_vendas' || p.risco === 'ambos'
      );

      setProducts(filtered);
    } catch (error) {
      console.error('Erro ao carregar produtos em risco:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (product: ProductAtRisk) => {
    if (product.quantidade_estoque < 5) {
      return 'border-destructive bg-destructive/5';
    }
    if (product.quantidade_estoque >= 10 && product.quantidade_estoque <= 20) {
      return 'border-yellow-500 bg-yellow-500/5';
    }
    return 'border-blue-500 bg-blue-500/5';
  };

  const getRiskLabel = (product: ProductAtRisk) => {
    if (product.risco === 'ambos') return 'Estoque Baixo + Sem Vendas';
    if (product.risco === 'sem_vendas') return 'Sem Vendas Recentes';
    if (product.quantidade_estoque < 5) return 'Estoque Crítico';
    if (product.quantidade_estoque >= 10 && product.quantidade_estoque <= 20) return 'Estoque Médio';
    return 'Em Risco';
  };

  const getRiskIcon = (product: ProductAtRisk) => {
    if (product.quantidade_estoque < 5) {
      return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
    if (product.risco === 'sem_vendas' || product.risco === 'ambos') {
      return <TrendingDown className="w-5 h-5 text-blue-500" />;
    }
    return <Package className="w-5 h-5 text-yellow-500" />;
  };

  const handleAjustarEstoque = () => {
    setSelectedProduct(null);
    navigate('/recebimento');
  };

  if (loading) {
    return (
      <Layout title="Produtos em Risco" showBack>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Produtos em Risco" showBack>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-destructive/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estoque Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {products.filter((p) => p.quantidade_estoque < 5).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Menos de 5 unidades
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estoque Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {products.filter((p) => p.quantidade_estoque >= 10 && p.quantidade_estoque <= 20).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Entre 10 e 20 unidades
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sem Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {products.filter((p) => p.risco === 'sem_vendas' || p.risco === 'ambos').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mais de 10 dias sem vender
              </p>
            </CardContent>
          </Card>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto em risco</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className={`border-2 cursor-pointer transition-all hover:shadow-lg ${getRiskColor(
                  product
                )}`}
                onClick={() => setSelectedProduct(product)}
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {product.nome}
                      </h3>
                      {getRiskIcon(product)}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estoque:</span>
                        <span className="font-bold">{product.quantidade_estoque} un</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Última Venda:
                        </span>
                        <span className="font-medium">
                          {product.ultima_venda
                            ? format(new Date(product.ultima_venda), 'dd/MM/yyyy')
                            : 'Nunca'}
                        </span>
                      </div>

                      <div className="pt-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-background">
                          {getRiskLabel(product)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{selectedProduct.nome}</h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Código de Barras:</span>
                    <p className="font-medium">{selectedProduct.codigo_barras || 'N/A'}</p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Quantidade em Estoque:</span>
                    <p className="font-bold text-lg">{selectedProduct.quantidade_estoque} un</p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Última Venda:</span>
                    <p className="font-medium">
                      {selectedProduct.ultima_venda
                        ? format(new Date(selectedProduct.ultima_venda), 'dd/MM/yyyy HH:mm')
                        : 'Nunca vendido'}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Categoria de Risco:</span>
                    <p className="font-medium">{getRiskLabel(selectedProduct)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAjustarEstoque} className="flex-1">
                  Ajustar Estoque
                </Button>
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
