import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserAuthComplete() {
  try {
    console.log('🔍 Debugando autenticação completa do usuário com CPF 10533219531...\n');

    const cpf = '10533219531';
    const password = '1285041';

    // 1. Verificar se o usuário existe
    console.log('1️⃣ Verificando se o usuário existe...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .eq('blocked', false);

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Usuário não encontrado com CPF:', cpf);
      return;
    }

    const user = users[0];
    console.log('✅ Usuário encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   CPF: ${user.cpf}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Blocked: ${user.blocked}`);

    // 2. Verificar senha
    console.log('\n2️⃣ Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`   Senha válida: ${isValidPassword ? '✅' : '❌'}`);

    if (!isValidPassword) {
      console.log('❌ Senha inválida, parando debug');
      return;
    }

    // 3. Verificar produtos existentes
    console.log('\n3️⃣ Verificando produtos...');
    let { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productError) {
      console.error('❌ Erro ao buscar produtos:', productError);
      return;
    }

    let product;
    if (!products || products.length === 0) {
      console.log('   Nenhum produto encontrado, criando produto de teste...');
      
      // Criar produto de teste
      const { data: newProduct, error: createError } = await supabase
        .from('products')
        .insert([{
          nome: 'Produto Teste Debug',
          codigo_barras: '1234567890123',
          preco: 10.50,
          quantidade_estoque: 100,
          unidade: 'UN',
          descricao: 'Produto criado para teste de debug'
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar produto:', createError);
        return;
      }

      product = newProduct;
      console.log('✅ Produto de teste criado:', product.nome);
    } else {
      product = products[0];
      console.log('✅ Produto encontrado:', product.nome);
    }

    // 4. Simular inserção de waste_record como se fosse o frontend
    console.log('\n4️⃣ Simulando inserção de waste_record...');
    
    console.log(`   Produto para teste: ${product.nome} (ID: ${product.id})`);

    // Tentar inserir waste_record
    const wasteData = {
      product_id: product.id,
      user_id: user.id,
      quantidade: 1,
      motivo: 'Teste de debug - CPF específico',
    };

    console.log('   Dados do waste_record:', wasteData);

    const { data: wasteResult, error: wasteError } = await supabase
      .from('waste_records')
      .insert([wasteData])
      .select();

    if (wasteError) {
      console.error('❌ Erro ao inserir waste_record:', wasteError);
      console.error('   Detalhes:', wasteError.message);
      console.error('   Código:', wasteError.code);
      console.error('   Hint:', wasteError.hint);
      
      // Verificar se é erro de RLS
      if (wasteError.message.includes('row-level security policy')) {
        console.log('\n🔍 Erro de RLS detectado! Verificando políticas...');
        
        // Verificar políticas RLS ativas
        const { data: policies, error: policyError } = await supabase
          .rpc('exec_sql', {
            sql: `
              SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
              FROM pg_policies 
              WHERE tablename = 'waste_records'
              ORDER BY policyname;
            `
          });

        if (policyError) {
          console.error('❌ Erro ao verificar políticas:', policyError);
        } else {
          console.log('📋 Políticas RLS ativas para waste_records:');
          policies.forEach(policy => {
            console.log(`   - ${policy.policyname} (${policy.cmd}): ${policy.permissive}`);
          });
        }
      }
    } else {
      console.log('✅ Waste_record inserido com sucesso:', wasteResult[0].id);
      
      // 5. Testar atualização de estoque
      console.log('\n5️⃣ Testando atualização de estoque...');
      const { error: stockError } = await supabase
        .from('products')
        .update({ quantidade_estoque: product.quantidade_estoque - 1 })
        .eq('id', product.id);

      if (stockError) {
        console.error('❌ Erro ao atualizar estoque:', stockError);
      } else {
        console.log('✅ Estoque atualizado com sucesso');
      }

      // 6. Testar inserção de stock_movement
      console.log('\n6️⃣ Testando inserção de stock_movement...');
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: product.id,
          user_id: user.id,
          tipo: 'desperdicio',
          quantidade: -1,
          motivo: 'Teste de debug - CPF específico',
        }]);

      if (movementError) {
        console.error('❌ Erro ao inserir stock_movement:', movementError);
      } else {
        console.log('✅ Stock_movement inserido com sucesso');
      }

      // Limpar os testes
      console.log('\n🧹 Limpando dados de teste...');
      await supabase.from('stock_movements').delete().eq('motivo', 'Teste de debug - CPF específico');
      await supabase.from('waste_records').delete().eq('id', wasteResult[0].id);
      await supabase.from('products').update({ quantidade_estoque: product.quantidade_estoque }).eq('id', product.id);
      console.log('✅ Dados de teste removidos');
    }

    // 7. Verificar políticas RLS para este usuário
    console.log('\n7️⃣ Verificando políticas RLS...');
    
    // Testar SELECT
    const { data: selectTest, error: selectError } = await supabase
      .from('waste_records')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (selectError) {
      console.error('❌ Erro no SELECT:', selectError.message);
    } else {
      console.log(`✅ SELECT funcionando - ${selectTest.length} registros encontrados`);
    }

    console.log('\n📊 Resumo do debug:');
    console.log(`   ✅ Usuário existe e está ativo`);
    console.log(`   ✅ Senha está correta`);
    console.log(`   ✅ Produto disponível para teste`);
    console.log(`   ${wasteError ? '❌' : '✅'} Inserção de waste_record`);

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

debugUserAuthComplete();