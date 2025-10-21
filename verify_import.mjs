import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fouylveqthojpruiscwq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyImport() {
  try {
    console.log('🔍 Verificando importação de produtos...');
    
    // Contar total de produtos
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar produtos:', countError);
      return;
    }
    
    console.log(`📊 Total de produtos no banco: ${count}`);
    
    // Buscar alguns produtos de exemplo
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(10);
    
    if (sampleError) {
      console.error('❌ Erro ao buscar produtos de exemplo:', sampleError);
      return;
    }
    
    console.log('\n📋 Exemplos de produtos importados:');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nome}`);
      console.log(`   Preço: R$ ${product.preco}`);
      console.log(`   Estoque: ${product.quantidade_estoque}`);
      console.log(`   Código de barras: ${product.codigo_barras || 'Não definido'}`);
      console.log('');
    });
    
    // Verificar produtos específicos mencionados no arquivo
    const testProducts = [
      '1 - REFRG COCA COLA LT 350ML',
      '472 - SUCO DEL VALLE GOIABA',
      '100 - PIRULITOS'
    ];
    
    console.log('🔎 Verificando produtos específicos:');
    for (const productName of testProducts) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('nome', `%${productName}%`)
        .limit(1);
      
      if (error) {
        console.error(`❌ Erro ao buscar "${productName}":`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        const product = data[0];
        console.log(`✅ Encontrado: ${product.nome}`);
        console.log(`   Preço: R$ ${product.preco}, Estoque: ${product.quantidade_estoque}`);
      } else {
        console.log(`❌ Não encontrado: ${productName}`);
      }
    }
    
    console.log('\n🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar verificação
verifyImport();