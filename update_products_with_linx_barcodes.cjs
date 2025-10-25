const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fouylveqthojpruiscwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Linx
const LINX_CONFIG = {
  baseUrl: 'http://192.168.15.9:8080', // IP real do servidor Linx
  timeout: 10000,
  endpoints: {
    products: '/sync/products'
  }
};

async function updateProductsWithLinxBarcodes() {
  console.log('🔄 Iniciando atualização de produtos com códigos de barras do Linx...');
  
  try {
    // 1. Buscar produtos do Linx
    console.log('1. Buscando produtos do Linx...');
    const linxUrl = `${LINX_CONFIG.baseUrl}${LINX_CONFIG.endpoints.products}`;
    
    const linxResponse = await axios.get(linxUrl, {
      timeout: LINX_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-Caminho-Certo/1.0'
      }
    });

    const linxProducts = linxResponse.data;
    console.log(`✅ Encontrados ${linxProducts.length} produtos no Linx`);

    // 2. Buscar produtos do Supabase
    console.log('2. Buscando produtos do Supabase...');
    const { data: supabaseProducts, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      throw new Error(`Erro ao buscar produtos do Supabase: ${fetchError.message}`);
    }

    console.log(`✅ Encontrados ${supabaseProducts.length} produtos no Supabase`);

    // 3. Fazer correspondência e atualizar
    console.log('3. Fazendo correspondência entre produtos...');
    
    let updated = 0;
    let matched = 0;
    let notFound = 0;

    for (const linxProduct of linxProducts) {
      const { codigo_barras, descricao } = linxProduct;
      
      if (!codigo_barras || !descricao) {
        console.log(`⚠️  Produto do Linx sem código de barras ou descrição: ${JSON.stringify(linxProduct)}`);
        continue;
      }

      // Buscar produto correspondente no Supabase por nome similar
      const matchedProduct = supabaseProducts.find(supabaseProduct => {
        const supabaseName = supabaseProduct.name.toLowerCase().trim();
        const linxName = descricao.toLowerCase().trim();
        
        // Correspondência exata
        if (supabaseName === linxName) return true;
        
        // Correspondência parcial (contém)
        if (supabaseName.includes(linxName) || linxName.includes(supabaseName)) return true;
        
        // Correspondência por palavras-chave (pelo menos 2 palavras em comum)
        const supabaseWords = supabaseName.split(' ').filter(w => w.length > 2);
        const linxWords = linxName.split(' ').filter(w => w.length > 2);
        const commonWords = supabaseWords.filter(word => linxWords.includes(word));
        
        return commonWords.length >= 2;
      });

      if (matchedProduct) {
        matched++;
        
        // Verificar se já tem código de barras
        if (matchedProduct.barcode && matchedProduct.barcode !== codigo_barras) {
          console.log(`⚠️  Produto "${matchedProduct.name}" já tem código de barras diferente:`);
          console.log(`    Supabase: ${matchedProduct.barcode}`);
          console.log(`    Linx: ${codigo_barras}`);
          continue;
        }

        // Atualizar código de barras se não existir
        if (!matchedProduct.barcode) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              barcode: codigo_barras,
              updated_at: new Date().toISOString()
            })
            .eq('id', matchedProduct.id);

          if (updateError) {
            console.error(`❌ Erro ao atualizar produto ${matchedProduct.name}: ${updateError.message}`);
          } else {
            updated++;
            console.log(`✅ Atualizado: "${matchedProduct.name}" → ${codigo_barras}`);
          }
        } else {
          console.log(`ℹ️  Produto "${matchedProduct.name}" já tem código de barras: ${matchedProduct.barcode}`);
        }
      } else {
        notFound++;
        console.log(`❌ Produto não encontrado no Supabase: "${descricao}" (${codigo_barras})`);
      }
    }

    // 4. Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`📦 Produtos do Linx: ${linxProducts.length}`);
    console.log(`📦 Produtos do Supabase: ${supabaseProducts.length}`);
    console.log(`✅ Correspondências encontradas: ${matched}`);
    console.log(`🔄 Produtos atualizados: ${updated}`);
    console.log(`❌ Produtos não encontrados: ${notFound}`);
    
    const successRate = ((matched / linxProducts.length) * 100).toFixed(1);
    console.log(`📈 Taxa de correspondência: ${successRate}%`);

    console.log('\n🎉 Atualização concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Dica: Verifique se o servidor Linx está rodando e acessível');
      console.error(`   URL tentada: http://${LINX_CONFIG.ip}:${LINX_CONFIG.port}/sync/products`);
    }
    
    if (error.response) {
      console.error('📄 Resposta do servidor:', error.response.status, error.response.statusText);
    }
  }
}

// Função para testar conectividade com o Linx
async function testLinxConnectivity() {
  console.log('🔍 Testando conectividade com o Linx...');
  console.log(`📡 Testando: ${LINX_CONFIG.baseUrl}${LINX_CONFIG.endpoints.products}`);
  
  try {
    const response = await axios.get(`${LINX_CONFIG.baseUrl}${LINX_CONFIG.endpoints.products}`, {
      timeout: LINX_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-Caminho-Certo/1.0'
      }
    });
    
    console.log('✅ Conectividade OK!');
    console.log('📊 Status:', response.status);
    console.log('📦 Dados recebidos:', response.data ? 'Sim' : 'Não');
    
    if (response.data && response.data.products) {
      console.log(`📈 Total de produtos: ${response.data.products.length}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Falha na conectividade:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Sugestão: Verificar se o serviço Linx está rodando na porta 8080');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏱️ Sugestão: Verificar firewall e conectividade de rede');
    }
    
    return false;
  }
}

// Executar baseado no argumento
const command = process.argv[2];

if (command === 'test') {
  testLinxConnectivity();
} else if (command === 'update') {
  updateProductsWithLinxBarcodes();
} else {
  console.log('📋 Uso:');
  console.log('  node update_products_with_linx_barcodes.cjs test    # Testar conectividade');
  console.log('  node update_products_with_linx_barcodes.cjs update  # Atualizar produtos');
  console.log('');
  console.log('⚙️  Configuração atual do Linx:');
  console.log(`   IP: ${LINX_CONFIG.ip}`);
  console.log(`   Porta: ${LINX_CONFIG.port}`);
  console.log('');
  console.log('💡 Atualize as configurações no início do arquivo quando receber os dados do Linx');
}