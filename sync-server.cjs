const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.SYNC_PORT || 5000;

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Linx
const LINX_IP = process.env.LINX_IP || '192.168.1.100';
const LINX_PORT = process.env.LINX_PORT || '5050';
const LINX_URL = `http://${LINX_IP}:${LINX_PORT}`;

// Middleware
app.use(express.json());

// Configuração de logs
const LOG_DIR = '/var/log';
const LOG_FILE = path.join(LOG_DIR, 'caminhocerto_sync.log');

// Função para criar log
async function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  try {
    await fs.appendFile(LOG_FILE, logMessage);
    console.log(logMessage.trim());
  } catch (error) {
    console.error('Erro ao escrever log:', error);
  }
}

// Função para criar tabelas de sincronização se não existirem
async function createSyncTables() {
  try {
    // Tabela de sincronizações (histórico)
    const { error: syncError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'sincronizacoes')
      .single();

    if (syncError && syncError.code === 'PGRST116') {
      // Tabela não existe, criar
      const { error: createSyncError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE sincronizacoes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tipo TEXT NOT NULL, -- 'venda_linx', 'venda_cc'
            origem TEXT NOT NULL, -- 'linx', 'caminhocerto'
            destino TEXT NOT NULL, -- 'caminhocerto', 'linx'
            dados JSONB NOT NULL,
            status TEXT DEFAULT 'processado', -- 'processado', 'erro'
            erro TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_sincronizacoes_tipo ON sincronizacoes(tipo);
          CREATE INDEX IF NOT EXISTS idx_sincronizacoes_origem ON sincronizacoes(origem);
          CREATE INDEX IF NOT EXISTS idx_sincronizacoes_created_at ON sincronizacoes(created_at);
        `
      });

      if (createSyncError) {
        await log(`Erro ao criar tabela sincronizacoes: ${createSyncError.message}`, 'ERROR');
      } else {
        await log('Tabela sincronizacoes criada com sucesso', 'INFO');
      }
    }

    // Tabela de sincronização pendente (fila)
    const { error: pendingError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'sincronizacao_pendente')
      .single();

    if (pendingError && pendingError.code === 'PGRST116') {
      // Tabela não existe, criar
      const { error: createPendingError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE sincronizacao_pendente (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tipo TEXT NOT NULL, -- 'venda_cc_para_linx'
            dados JSONB NOT NULL,
            tentativas INTEGER DEFAULT 0,
            max_tentativas INTEGER DEFAULT 3,
            proximo_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_sincronizacao_pendente_proximo_envio ON sincronizacao_pendente(proximo_envio);
          CREATE INDEX IF NOT EXISTS idx_sincronizacao_pendente_tentativas ON sincronizacao_pendente(tentativas);
        `
      });

      if (createPendingError) {
        await log(`Erro ao criar tabela sincronizacao_pendente: ${createPendingError.message}`, 'ERROR');
      } else {
        await log('Tabela sincronizacao_pendente criada com sucesso', 'INFO');
      }
    }

    await log('Verificação/criação de tabelas concluída', 'INFO');
  } catch (error) {
    await log(`Erro ao criar tabelas de sincronização: ${error.message}`, 'ERROR');
  }
}

// Função para buscar produto por código de barras
async function findProductByBarcode(codigoBarras) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('codigo_barras', codigoBarras)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    await log(`Erro ao buscar produto ${codigoBarras}: ${error.message}`, 'ERROR');
    return null;
  }
}

// Função para atualizar estoque do produto
async function updateProductStock(productId, quantidadeReduzir, motivo = 'Venda Linx') {
  try {
    // Buscar estoque atual
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('quantidade_estoque, nome')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    const novoEstoque = Math.max(0, product.quantidade_estoque - quantidadeReduzir);

    // Atualizar estoque
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        quantidade_estoque: novoEstoque,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    // Registrar movimento de estoque
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        product_id: productId,
        tipo: 'saida',
        quantidade: -quantidadeReduzir,
        motivo: motivo
      });

    if (movementError) throw movementError;

    await log(`Estoque atualizado: ${product.nome} - Reduzido ${quantidadeReduzir} unidades (${product.quantidade_estoque} → ${novoEstoque})`);
    
    return { success: true, estoqueAnterior: product.quantidade_estoque, novoEstoque };
  } catch (error) {
    await log(`Erro ao atualizar estoque do produto ${productId}: ${error.message}`, 'ERROR');
    return { success: false, error: error.message };
  }
}

// Função para registrar sincronização
async function registerSync(tipo, origem, destino, dados, status = 'processado', erroDetalhes = null) {
  try {
    const { error } = await supabase
      .from('sincronizacoes')
      .insert({
        tipo,
        origem,
        destino,
        dados,
        status,
        erro_detalhes: erroDetalhes
      });

    if (error) throw error;
  } catch (error) {
    await log(`Erro ao registrar sincronização: ${error.message}`, 'ERROR');
  }
}

// Endpoint principal: Receber vendas do Linx
app.post('/sync/linx-sale', async (req, res) => {
  try {
    const vendaData = req.body;
    await log(`Recebida venda do Linx: ${JSON.stringify(vendaData)}`);

    // Validar estrutura da venda
    if (!vendaData.items || !Array.isArray(vendaData.items)) {
      throw new Error('Estrutura de venda inválida: items não encontrado ou não é array');
    }

    const resultados = [];

    // Processar cada item da venda
    for (const item of vendaData.items) {
      const { codigo_barras, quantidade, nome_produto } = item;

      if (!codigo_barras || !quantidade) {
        await log(`Item inválido ignorado: ${JSON.stringify(item)}`, 'WARN');
        continue;
      }

      // Buscar produto no banco
      const produto = await findProductByBarcode(codigo_barras);
      
      if (!produto) {
        await log(`Produto não encontrado: ${codigo_barras} - ${nome_produto}`, 'WARN');
        resultados.push({
          codigo_barras,
          status: 'produto_nao_encontrado',
          message: `Produto ${codigo_barras} não encontrado no sistema`
        });
        continue;
      }

      // Atualizar estoque
      const resultado = await updateProductStock(
        produto.id, 
        quantidade, 
        `Venda Linx - ${vendaData.source || 'linx'}`
      );

      resultados.push({
        codigo_barras,
        nome_produto: produto.nome,
        quantidade_reduzida: quantidade,
        estoque_anterior: resultado.estoqueAnterior,
        novo_estoque: resultado.novoEstoque,
        status: resultado.success ? 'sucesso' : 'erro',
        erro: resultado.error
      });
    }

    // Registrar sincronização
    await registerSync('venda_linx', 'linx', 'caminhocerto', vendaData);

    await log(`Venda do Linx processada com sucesso. ${resultados.length} itens processados`);

    res.json({
      success: true,
      message: 'Venda sincronizada com sucesso',
      resultados
    });

  } catch (error) {
    await log(`Erro ao processar venda do Linx: ${error.message}`, 'ERROR');
    
    // Registrar erro na sincronização
    await registerSync('venda_linx', 'linx', 'caminhocerto', req.body, 'erro', error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Função para enviar venda para o Linx
async function sendSaleToLinx(saleData) {
  try {
    const response = await axios.post(`${LINX_URL}/sync/cc-sale`, saleData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    await log(`Venda enviada para Linx com sucesso: ${saleData.id}`);
    return { success: true, response: response.data };
  } catch (error) {
    await log(`Erro ao enviar venda para Linx: ${error.message}`, 'ERROR');
    return { success: false, error: error.message };
  }
}

// Função para processar vendas locais e enviar para o Linx
async function processPendingSales() {
  try {
    // Buscar vendas pendentes
    const { data: pendingSales, error } = await supabase
      .from('sincronizacao_pendente')
      .select('*')
      .lte('proximo_envio', new Date().toISOString())
      .lt('tentativas', 5)
      .order('created_at');

    if (error) throw error;

    for (const pendingSale of pendingSales || []) {
      const result = await sendSaleToLinx(pendingSale.dados);
      
      if (result.success) {
        // Remover da fila de pendentes
        await supabase
          .from('sincronizacao_pendente')
          .delete()
          .eq('id', pendingSale.id);

        // Registrar sincronização bem-sucedida
        await registerSync('venda_cc', 'caminhocerto', 'linx', pendingSale.dados);
      } else {
        // Incrementar tentativas e reagendar
        const novasTentativas = pendingSale.tentativas + 1;
        const proximoEnvio = new Date();
        proximoEnvio.setMinutes(proximoEnvio.getMinutes() + (novasTentativas * 5)); // Backoff exponencial

        if (novasTentativas >= 5) {
          // Máximo de tentativas atingido, registrar erro
          await registerSync('venda_cc', 'caminhocerto', 'linx', pendingSale.dados, 'erro', result.error);
          
          await supabase
            .from('sincronizacao_pendente')
            .delete()
            .eq('id', pendingSale.id);
        } else {
          await supabase
            .from('sincronizacao_pendente')
            .update({
              tentativas: novasTentativas,
              proximo_envio: proximoEnvio.toISOString()
            })
            .eq('id', pendingSale.id);
        }
      }
    }
  } catch (error) {
    await log(`Erro ao processar vendas pendentes: ${error.message}`, 'ERROR');
  }
}

// Endpoint para adicionar venda à fila (será chamado pelo sistema principal)
app.post('/sync/queue-sale', async (req, res) => {
  try {
    const saleData = req.body;
    
    // Tentar enviar imediatamente
    const result = await sendSaleToLinx(saleData);
    
    if (result.success) {
      // Registrar sincronização bem-sucedida
      await registerSync('venda_cc', 'caminhocerto', 'linx', saleData);
      
      res.json({
        success: true,
        message: 'Venda enviada para Linx imediatamente'
      });
    } else {
      // Adicionar à fila de pendentes
      const { error } = await supabase
        .from('sincronizacao_pendente')
        .insert({
          tipo: 'venda_cc',
          dados: saleData
        });

      if (error) throw error;

      await log(`Venda adicionada à fila de sincronização: ${saleData.id}`);
      
      res.json({
        success: true,
        message: 'Linx offline - venda adicionada à fila de sincronização'
      });
    }
  } catch (error) {
    await log(`Erro ao processar fila de venda: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para buscar produtos do Linx
app.get('/sync/linx-products', async (req, res) => {
  try {
    await log('Buscando produtos do Linx...');
    
    const response = await axios.get(`${LINX_URL}/sync/products`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    await log(`Produtos do Linx obtidos com sucesso: ${response.data.length} produtos`);
    
    res.json(response.data);
  } catch (error) {
    await log(`Erro ao buscar produtos do Linx: ${error.message}`, 'ERROR');
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro ao conectar com o Linx para buscar produtos'
    });
  }
});

// Endpoint de status
app.get('/sync/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    linx_url: LINX_URL
  });
});

// Endpoint de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Inicializar servidor
async function startServer() {
  try {
    // Criar diretório de logs se não existir
    try {
      await fs.access(LOG_DIR);
    } catch {
      await fs.mkdir(LOG_DIR, { recursive: true });
    }

    // Criar tabelas de sincronização
    await createSyncTables();

    // Iniciar processamento de vendas pendentes (a cada 30 segundos)
    setInterval(processPendingSales, 30000);

    app.listen(PORT, () => {
      log(`🚀 Servidor de sincronização rodando na porta ${PORT}`);
      log(`📡 Linx configurado em: ${LINX_URL}`);
    });
  } catch (error) {
    await log(`Erro ao iniciar servidor: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', async (error) => {
  await log(`Erro não capturado: ${error.message}`, 'ERROR');
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  await log(`Promise rejeitada: ${reason}`, 'ERROR');
});

// Iniciar servidor
startServer();