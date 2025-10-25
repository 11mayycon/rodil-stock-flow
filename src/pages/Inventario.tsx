import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Camera, Search, FileText, Package } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Product {
  id: string;
  codigo_barras: string | null;
  nome: string;
  descricao: string | null;
  quantidade_estoque: number;
}

interface Contagem {
  id: string;
  codigo_barras: string | null;
  nome: string;
  descricao: string | null;
  quantidade_estoque: number;
  quantidade_contada: number;
  usuario: string;
  created_at: string;
}

export default function Inventario() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantidadeContada, setQuantidadeContada] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [contagens, setContagens] = useState<Contagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Buscar produtos em tempo real
  useEffect(() => {
    if (searchTerm.length < 2) {
      setProducts([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, codigo_barras, nome, descricao, quantidade_estoque')
          .or(`codigo_barras.ilike.%${searchTerm}%,nome.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível buscar os produtos',
          variant: 'destructive',
        });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Carregar contagens
  const loadContagens = async () => {
    try {
      let query = supabase
        .from('contagens_inventario')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', new Date(startDate).toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', new Date(endDate + ' 23:59:59').toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setContagens(data || []);
    } catch (error) {
      console.error('Erro ao carregar contagens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as contagens',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadContagens();
  }, [startDate, endDate]);

  const handleScan = async (code: string) => {
    setSearchTerm(code);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, codigo_barras, nome, descricao, quantidade_estoque')
        .eq('codigo_barras', code)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSelectedProduct(data);
        setProducts([data]);
      } else {
        toast({
          title: 'Produto não encontrado',
          description: 'Nenhum produto com este código de barras',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.nome);
    setProducts([]);
  };

  const handleSaveContagem = async () => {
    if (!selectedProduct || !quantidadeContada) {
      toast({
        title: 'Erro',
        description: 'Selecione um produto e informe a quantidade contada',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Salvar contagem
      const { error: insertError } = await supabase
        .from('contagens_inventario')
        .insert({
          product_id: selectedProduct.id,
          codigo_barras: selectedProduct.codigo_barras,
          nome: selectedProduct.nome,
          descricao: selectedProduct.descricao,
          quantidade_estoque: selectedProduct.quantidade_estoque,
          quantidade_contada: parseInt(quantidadeContada),
          usuario: user?.name || 'Desconhecido',
        });

      if (insertError) throw insertError;

      // Atualizar updated_at do produto
      const { error: updateError } = await supabase
        .from('products')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      toast({
        title: 'Sucesso',
        description: 'Contagem registrada com sucesso',
      });

      // Limpar formulário
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantidadeContada('');
      loadContagens();
    } catch (error) {
      console.error('Erro ao salvar contagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a contagem',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Relatório de Inventário', 14, 15);
    
    // Data
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
    
    // Tabela
    const tableData = contagens.map(c => [
      c.codigo_barras || 'N/A',
      c.nome,
      c.quantidade_contada.toString(),
      c.quantidade_estoque.toString(),
      (c.quantidade_contada - c.quantidade_estoque).toString(),
    ]);

    (doc as any).autoTable({
      head: [['Código de Barras', 'Descrição', 'Qtd. Contada', 'Qtd. Estoque', 'Diferença']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`inventario_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: 'PDF Gerado',
      description: 'Relatório de inventário baixado com sucesso',
    });
  };

  return (
    <Layout title="Inventário" showBack>
      <div className="space-y-6">
        <Tabs defaultValue="contagem" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contagem">
              <Package className="w-4 h-4 mr-2" />
              Contagem
            </TabsTrigger>
            <TabsTrigger value="relatorios">
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contagem">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Contagem de Inventário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Busca de produto */}
                <div className="space-y-2">
                  <Label>Buscar Produto</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Digite o código ou nome do produto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                      {products.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto">
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                              onClick={() => handleSelectProduct(product)}
                            >
                              <p className="font-medium">{product.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.codigo_barras} - Estoque: {product.quantidade_estoque}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsScannerOpen(true)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Produto selecionado */}
                {selectedProduct && (
                  <Card className="border-primary">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-muted-foreground">Produto</Label>
                          <p className="font-semibold">{selectedProduct.nome}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Código de Barras</Label>
                            <p>{selectedProduct.codigo_barras || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Estoque Atual</Label>
                            <p className="font-bold text-lg">{selectedProduct.quantidade_estoque}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quantidade contada */}
                {selectedProduct && (
                  <div className="space-y-2">
                    <Label>Quantidade Contada</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Digite a quantidade contada"
                      value={quantidadeContada}
                      onChange={(e) => setQuantidadeContada(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  onClick={handleSaveContagem}
                  disabled={!selectedProduct || !quantidadeContada || loading}
                  className="w-full"
                >
                  {loading ? 'Salvando...' : 'Salvar Contagem'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Inventário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={generatePDF} disabled={contagens.length === 0}>
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar PDF
                </Button>

                {/* Lista de contagens */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Contagens Registradas ({contagens.length})</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Produto</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Código</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Contada</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Estoque</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Diferença</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Usuário</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {contagens.map((contagem) => {
                            const diferenca = contagem.quantidade_contada - contagem.quantidade_estoque;
                            return (
                              <tr key={contagem.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 text-sm">
                                  {new Date(contagem.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-sm">{contagem.nome}</td>
                                <td className="px-4 py-3 text-sm">{contagem.codigo_barras || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-right">{contagem.quantidade_contada}</td>
                                <td className="px-4 py-3 text-sm text-right">{contagem.quantidade_estoque}</td>
                                <td className={`px-4 py-3 text-sm text-right font-semibold ${
                                  diferenca > 0 ? 'text-green-600' : diferenca < 0 ? 'text-red-600' : ''
                                }`}>
                                  {diferenca > 0 ? '+' : ''}{diferenca}
                                </td>
                                <td className="px-4 py-3 text-sm">{contagem.usuario}</td>
                              </tr>
                            );
                          })}
                          {contagens.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                Nenhuma contagem registrada
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </Layout>
  );
}
