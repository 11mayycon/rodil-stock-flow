const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fouylveqthojpruiscwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXlsdmVxdGhvanBydWlzY3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MjM5ODYsImV4cCI6MjA3NjQ5OTk4Nn0.h2fT3BlnwR3bb06ZeOQD8cs88owCe6CpqeOPtt2fZO0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados simulados do Linx (baseados nos produtos que já existem no Supabase)
const linxProducts = [
  {
    codigo_barras: '7891000100103',
    descricao: 'BOLINHO DUO BAUDUCCO 27G',
    preco: 2.50
  },
  {
    codigo_barras: '7622210951045',
    descricao: 'BALA HALLS CEREJA 28G',
    preco: 3.00
  },
  {
    codigo_barras: '7891000053607',
    descricao: 'BISCOITO PASSATEMPO RECHEADO MORANGO 130G',
    preco: 4.50
  },
  {
    codigo_barras: '7891000244203',
    descricao: 'CHOCOLATE LACTA AO LEITE 90G',
    preco: 5.99
  },
  {
    codigo_barras: '7891991010924',
    descricao: 'REFRIGERANTE COCA COLA 350ML',
    preco: 3.50
  },
  {
    codigo_barras: '7891000100110',
    descricao: 'ÁGUA MINERAL CRYSTAL 500ML',
    preco: 2.00
  },
  {
    codigo_barras: '7891118015504',
    descricao: 'SALGADINHO CHEETOS REQUEIJÃO 57G',
    preco: 4.00
  },
  {
    codigo_barras: '7891000244210',
    descricao: 'CHOCOLATE LACTA OREO 90G',
    preco: 6.50
  }
];

async function updateProductsWithBarcodes() {
  console.log('Iniciando atualização de códigos de barras dos produtos...');
  
  try {
    // Primeiro, vamos buscar todos os produtos do Supabase
    const { data: supabaseProducts, error: fetchError } = await supabase
      .from('products')
      .select('*');
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Encontrados ${supabaseProducts.length} produtos no Supabase`);
    console.log(`Temos ${linxProducts.length} produtos do Linx para sincronizar`);
    
    let updatedCount = 0;
    let matchedProducts = [];
    
    // Para cada produto do Linx, tentar encontrar correspondência no Supabase
    for (const linxProduct of linxProducts) {
      console.log(`\nProcessando: ${linxProduct.descricao}`);
      
      // Buscar produto por nome similar
      const matchingProduct = supabaseProducts.find(product => {
        const linxName = linxProduct.descricao.toLowerCase();
        const supabaseName = product.name.toLowerCase();
        
        // Verificar se há correspondência por nome (parcial ou completa)
        return linxName.includes(supabaseName) || 
               supabaseName.includes(linxName) ||
               linxName === supabaseName;
      });
      
      if (matchingProduct) {
        console.log(`✓ Produto encontrado: ${matchingProduct.name}`);
        console.log(`  - ID: ${matchingProduct.id}`);
        console.log(`  - Código de barras atual: ${matchingProduct.barcode || 'não definido'}`);
        console.log(`  - Novo código de barras: ${linxProduct.codigo_barras}`);
        
        // Atualizar o produto com o código de barras do Linx
        const { error: updateError } = await supabase
          .from('products')
          .update({
            barcode: linxProduct.codigo_barras,
            updated_at: new Date().toISOString()
          })
          .eq('id', matchingProduct.id);
        
        if (updateError) {
          console.error(`  ✗ Erro ao atualizar: ${updateError.message}`);
        } else {
          console.log(`  ✓ Código de barras atualizado com sucesso!`);
          updatedCount++;
          matchedProducts.push({
            supabase: matchingProduct,
            linx: linxProduct
          });
        }
      } else {
        console.log(`✗ Produto não encontrado no Supabase: ${linxProduct.descricao}`);
      }
    }
    
    console.log(`\n=== RESUMO DA SINCRONIZAÇÃO ===`);
    console.log(`Total de produtos atualizados: ${updatedCount}`);
    console.log(`Total de produtos do Linx: ${linxProducts.length}`);
    console.log(`Taxa de correspondência: ${((updatedCount / linxProducts.length) * 100).toFixed(1)}%`);
    
    if (matchedProducts.length > 0) {
      console.log(`\n=== PRODUTOS SINCRONIZADOS ===`);
      matchedProducts.forEach((match, index) => {
        console.log(`${index + 1}. ${match.supabase.name}`);
        console.log(`   Código de barras: ${match.linx.codigo_barras}`);
      });
    }
    
    // Verificar produtos que ainda não têm código de barras
    const { data: productsWithoutBarcode, error: noBarcodeError } = await supabase
      .from('products')
      .select('*')
      .is('barcode', null);
    
    if (!noBarcodeError && productsWithoutBarcode.length > 0) {
      console.log(`\n=== PRODUTOS SEM CÓDIGO DE BARRAS ===`);
      console.log(`${productsWithoutBarcode.length} produtos ainda não possuem código de barras:`);
      productsWithoutBarcode.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
      });
    }
    
  } catch (error) {
    console.error('Erro durante a sincronização:', error.message);
  }
}

updateProductsWithBarcodes();