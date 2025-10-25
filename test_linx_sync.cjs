const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fouylveqthojpruiscwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLinxSync() {
  console.log('Testando sincronização de produtos do Linx...');
  
  try {
    // Primeiro, vamos buscar produtos do Linx
    console.log('1. Buscando produtos do Linx...');
    const linxResponse = await axios.get('http://localhost:5000/sync/linx-products', {
      timeout: 10000
    });
    
    console.log('Resposta do Linx:', linxResponse.data);
    
    if (linxResponse.data && linxResponse.data.length > 0) {
      console.log(`Encontrados ${linxResponse.data.length} produtos no Linx`);
      
      // Vamos verificar alguns produtos específicos
      const sampleProducts = linxResponse.data.slice(0, 5);
      console.log('\nPrimeiros 5 produtos do Linx:');
      sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.descricao} - Código: ${product.codigo_barras}`);
      });
      
      // Agora vamos verificar se esses produtos existem no Supabase
      console.log('\n2. Verificando produtos correspondentes no Supabase...');
      
      for (const linxProduct of sampleProducts) {
        const { data: supabaseProduct, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${linxProduct.descricao}%,barcode.eq.${linxProduct.codigo_barras}`)
          .limit(1);
        
        if (error) {
          console.error(`Erro ao buscar produto ${linxProduct.descricao}:`, error);
        } else if (supabaseProduct && supabaseProduct.length > 0) {
          console.log(`✓ Produto encontrado no Supabase: ${supabaseProduct[0].name}`);
          console.log(`  - Código de barras atual: ${supabaseProduct[0].barcode || 'não definido'}`);
          console.log(`  - Código de barras do Linx: ${linxProduct.codigo_barras}`);
        } else {
          console.log(`✗ Produto não encontrado no Supabase: ${linxProduct.descricao}`);
        }
      }
      
    } else {
      console.log('Nenhum produto encontrado no Linx');
    }
    
  } catch (error) {
    console.error('Erro ao testar sincronização:', error.message);
    if (error.response) {
      console.error('Resposta do erro:', error.response.data);
    }
  }
}

testLinxSync();