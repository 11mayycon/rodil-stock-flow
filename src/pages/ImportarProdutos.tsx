import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, CheckCircle } from 'lucide-react';
import produtosCSV from '@/data/produtos.csv?raw';

export default function ImportarProdutos() {
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(0);
  const { toast } = useToast();

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const produtos = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(';');
      
      // Formato: ID;Nome;Codigo de Barras;Categoria;Data de Criacao;Unidade de Medida;Quantidade;Preco de Custo;Preco de Venda
      const nome = columns[1]?.trim();
      const codigo_barras = columns[2]?.trim() || null;
      const categoria = columns[3]?.trim() || '';
      const unidade = columns[5]?.trim() || 'un';
      const quantidade = parseInt(columns[6]?.trim() || '0');
      const preco = parseFloat(columns[8]?.trim()?.replace(',', '.') || '0');

      if (nome) {
        produtos.push({
          nome,
          codigo_barras,
          descricao: categoria,
          unidade,
          quantidade_estoque: quantidade,
          preco
        });
      }
    }

    return produtos;
  };

  const importarProdutos = async () => {
    try {
      setLoading(true);
      setImported(0);

      const produtos = parseCSV(produtosCSV);

      // Inserir produtos em lotes de 100
      const batchSize = 100;
      let totalImported = 0;

      for (let i = 0; i < produtos.length; i += batchSize) {
        const batch = produtos.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('products')
          .insert(batch);

        if (error) {
          console.error('Erro ao importar lote:', error);
          toast({
            variant: 'destructive',
            title: 'Erro ao importar produtos',
            description: `Erro no lote ${Math.floor(i / batchSize) + 1}: ${error.message}`,
          });
          break;
        }

        totalImported += batch.length;
        setImported(totalImported);
      }

      toast({
        title: 'Importação concluída!',
        description: `${totalImported} produtos importados com sucesso.`,
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao importar',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Importar Produtos</h1>
          <p className="text-muted-foreground">
            Importe os produtos do arquivo CSV para o banco de dados
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Pronto para importar
                </h3>
                <p className="text-muted-foreground">
                  270 produtos serão importados do arquivo CSV
                </p>
              </div>

              {imported > 0 && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{imported} produtos importados</span>
                </div>
              )}
            </div>

            <Button
              onClick={importarProdutos}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Importando...' : 'Iniciar Importação'}
            </Button>

            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-2">Informações sobre a importação:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nome do produto (obrigatório)</li>
                <li>Código de barras (quando disponível)</li>
                <li>Preço de venda (0 quando não informado)</li>
                <li>Quantidade em estoque</li>
                <li>Categoria como descrição</li>
                <li>Unidade de medida (padrão: un)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
