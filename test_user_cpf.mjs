import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testUserCPF() {
  console.log('🔍 Testando com CPF específico: 10533219531')
  
  try {
    // 1. Verificar se o usuário existe
    console.log('\n1️⃣ Verificando usuário...')
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', '10533219531')
      .single()
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError)
      return
    }
    
    if (!user) {
      console.error('❌ Usuário com CPF 10533219531 não encontrado')
      return
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role
    })
    
    // 2. Buscar um produto para teste
    console.log('\n2️⃣ Buscando produto para teste...')
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .gt('quantidade_estoque', 0)
      .limit(1)
      .single()
    
    if (productError || !product) {
      console.error('❌ Erro ao buscar produto:', productError)
      return
    }
    
    console.log('✅ Produto encontrado:', {
      id: product.id,
      name: product.nome,
      stock: product.quantidade_estoque
    })
    
    // 3. Testar inserção de waste_record com o usuário específico
    console.log('\n3️⃣ Testando inserção de waste_record...')
    const wasteData = {
      product_id: product.id,
      quantidade: 1,
      motivo: 'Teste com CPF específico do usuário',
      user_id: user.id,
      created_at: new Date().toISOString()
    }
    
    const { data: wasteRecord, error: wasteError } = await supabase
      .from('waste_records')
      .insert(wasteData)
      .select()
      .single()
    
    if (wasteError) {
      console.error('❌ ERRO ao inserir waste_record:', wasteError)
      console.error('Detalhes do erro:', JSON.stringify(wasteError, null, 2))
      return
    }
    
    console.log('✅ Waste record inserido com sucesso:', wasteRecord)
    
    // 4. Testar atualização de estoque
    console.log('\n4️⃣ Testando atualização de estoque...')
    const newStock = product.quantidade_estoque - 1
    
    const { error: stockError } = await supabase
      .from('products')
      .update({ quantidade_estoque: newStock })
      .eq('id', product.id)
    
    if (stockError) {
      console.error('❌ ERRO ao atualizar estoque:', stockError)
      return
    }
    
    console.log('✅ Estoque atualizado com sucesso')
    
    // 5. Testar inserção de stock_movement
    console.log('\n5️⃣ Testando inserção de stock_movement...')
    const movementData = {
      product_id: product.id,
      tipo: 'desperdicio',
      quantidade: -1,
      motivo: 'Desperdício - Teste CPF específico',
      user_id: user.id,
      created_at: new Date().toISOString()
    }
    
    const { data: movement, error: movementError } = await supabase
      .from('stock_movements')
      .insert(movementData)
      .select()
      .single()
    
    if (movementError) {
      console.error('❌ ERRO ao inserir stock_movement:', movementError)
      return
    }
    
    console.log('✅ Stock movement inserido com sucesso:', movement)
    
    // 6. Limpeza - remover dados de teste
    console.log('\n6️⃣ Limpando dados de teste...')
    
    // Restaurar estoque
    await supabase
      .from('products')
      .update({ quantidade_estoque: product.quantidade_estoque })
      .eq('id', product.id)
    
    // Remover registros de teste
    await supabase.from('waste_records').delete().eq('id', wasteRecord.id)
    await supabase.from('stock_movements').delete().eq('id', movement.id)
    
    console.log('✅ Dados de teste removidos')
    
    console.log('\n🎉 TESTE COMPLETO - Todas as operações funcionaram com o CPF específico!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar teste
testUserCPF()