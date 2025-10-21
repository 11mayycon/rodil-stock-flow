import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fouylveqthojpruiscwq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importProducts() {
  try {
    console.log('🚀 Iniciando importação de produtos...');
    
    // Ler o arquivo produtos.txt
    const produtosPath = path.join(__dirname, '..', 'produtos.txt');
    const fileContent = fs.readFileSync(produtosPath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    // Remover cabeçalho
    const dataLines = lines.slice(1);
    
    console.log(`📄 Encontradas ${dataLines.length} linhas de produtos para importar`);
    
    const products = [];
    let skippedLines = 0;
    
    for (const line of dataLines) {
      const parts = line.split('\t');
      
      // Verificar se a linha tem o formato correto
      if (parts.length < 4) {
        console.log(`⚠️  Linha ignorada (formato inválido): ${line}`);
        skippedLines++;
        continue;
      }
      
      const [codigo, descricao, quantidade, preco] = parts;
      
      // Validar dados
      if (!codigo || !descricao || !quantidade || !preco) {
        console.log(`⚠️  Linha ignorada (dados faltando): ${line}`);
        skippedLines++;
        continue;
      }
      
      // Converter valores
      const quantidadeNum = parseInt(quantidade);
      const precoNum = parseFloat(preco.replace(',', '.'));
      
      if (isNaN(quantidadeNum) || isNaN(precoNum)) {
        console.log(`⚠️  Linha ignorada (valores inválidos): ${line}`);
        skippedLines++;
        continue;
      }
      
      // Criar objeto do produto
      // Conforme solicitado, não usar código como codigo_barras, mas incluir na descrição
      const product = {
        codigo_barras: null, // Não usar o código como código de barras
        nome: `${codigo} - ${descricao.trim()}`, // Incluir código junto com a descrição
        preco: precoNum,
        quantidade_estoque: quantidadeNum,
        unidade: 'un',
        descricao: `Produto código ${codigo}: ${descricao.trim()}`
      };
      
      products.push(product);
    }
    
    console.log(`✅ ${products.length} produtos preparados para importação`);
    if (skippedLines > 0) {
      console.log(`⚠️  ${skippedLines} linhas foram ignoradas devido a problemas de formato`);
    }
    
    // Verificar se há produtos para importar
    if (products.length === 0) {
      console.log('❌ Nenhum produto válido encontrado para importar');
      return;
    }
    
    // Limpar produtos existentes (opcional - descomente se quiser limpar antes)
    // console.log('🗑️  Limpando produtos existentes...');
    // const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // if (deleteError) {
    //   console.error('❌ Erro ao limpar produtos existentes:', deleteError);
    //   return;
    // }
    
    // Importar produtos em lotes de 100
    const batchSize = 100;
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      console.log(`📦 Importando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)} (${batch.length} produtos)...`);
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, error);
        errors += batch.length;
        
        // Tentar importar um por um para identificar problemas específicos
        console.log('🔍 Tentando importar produtos individualmente...');
        for (const product of batch) {
          const { error: individualError } = await supabase
            .from('products')
            .insert([product]);
          
          if (individualError) {
            console.error(`❌ Erro ao importar produto "${product.nome}":`, individualError.message);
          } else {
            imported++;
            console.log(`✅ Produto importado: ${product.nome}`);
          }
        }
      } else {
        imported += batch.length;
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} importado com sucesso (${batch.length} produtos)`);
      }
    }
    
    console.log('\n🎉 Importação concluída!');
    console.log(`✅ Produtos importados com sucesso: ${imported}`);
    if (errors > 0) {
      console.log(`❌ Produtos com erro: ${errors}`);
    }
    console.log(`📊 Total processado: ${imported + errors}/${products.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
  }
}

// Executar importação
importProducts();