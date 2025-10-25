#!/usr/bin/env node

const axios = require('axios');
const net = require('net');

// Configuração do Linx
const LINX_IP = '192.168.15.9';
const COMMON_PORTS = [
  3000,  // Node.js padrão
  5000,  // Flask/Express comum
  8000,  // HTTP alternativo
  8080,  // HTTP proxy padrão
  8089,  // Porta mencionada nos serviços
  3050,  // Firebird (só para teste)
  9000,  // Alternativo
  4000,  // Alternativo
  7000,  // Alternativo
  5050   // Porta original do teste
];

// Função para testar se uma porta está aberta
function testPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// Função para testar endpoint HTTP
async function testHttpEndpoint(url) {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sistema-Caminho-Certo/1.0'
      }
    });
    
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Função principal de teste
async function testLinxPorts() {
  console.log('🔍 Testando conectividade com o Linx...');
  console.log(`📍 IP do Linx: ${LINX_IP}`);
  console.log('🔌 Testando portas comuns...\n');
  
  const openPorts = [];
  const httpEndpoints = [];
  
  // Teste 1: Verificar portas abertas
  console.log('📡 Fase 1: Verificando portas abertas...');
  for (const port of COMMON_PORTS) {
    process.stdout.write(`   Testando porta ${port}... `);
    
    const isOpen = await testPort(LINX_IP, port);
    if (isOpen) {
      console.log('✅ ABERTA');
      openPorts.push(port);
    } else {
      console.log('❌ Fechada');
    }
  }
  
  console.log(`\n📊 Portas abertas encontradas: ${openPorts.length}`);
  if (openPorts.length === 0) {
    console.log('⚠️ Nenhuma porta comum está aberta no IP do Linx');
    console.log('🔧 Sugestões:');
    console.log('   1. Verificar se o IP está correto (192.168.15.9)');
    console.log('   2. Verificar se há firewall bloqueando');
    console.log('   3. Verificar se o serviço Linx está rodando');
    return;
  }
  
  // Teste 2: Verificar endpoints HTTP nas portas abertas
  console.log('\n🌐 Fase 2: Testando endpoints HTTP...');
  for (const port of openPorts) {
    const baseUrl = `http://${LINX_IP}:${port}`;
    const endpoints = [
      '/sync/products',
      '/api/products',
      '/products',
      '/sync/status',
      '/health',
      '/api/health',
      '/',
      '/api'
    ];
    
    console.log(`\n🔌 Testando porta ${port}:`);
    
    for (const endpoint of endpoints) {
      const url = `${baseUrl}${endpoint}`;
      process.stdout.write(`   ${endpoint}... `);
      
      const result = await testHttpEndpoint(url);
      if (result.success) {
        console.log(`✅ OK (${result.status})`);
        httpEndpoints.push({
          port,
          endpoint,
          url,
          status: result.status,
          data: result.data
        });
      } else {
        console.log(`❌ ${result.error}`);
      }
    }
  }
  
  // Resultados finais
  console.log('\n📋 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  
  if (httpEndpoints.length > 0) {
    console.log('✅ Endpoints HTTP encontrados:');
    httpEndpoints.forEach(ep => {
      console.log(`   🌐 ${ep.url} (Status: ${ep.status})`);
      if (ep.data) {
        console.log(`      📦 Dados: ${JSON.stringify(ep.data).substring(0, 100)}...`);
      }
    });
    
    console.log('\n🔧 Próximos passos:');
    console.log('   1. Atualizar o script com a porta correta');
    console.log('   2. Configurar o endpoint correto');
    console.log('   3. Testar sincronização de produtos');
  } else {
    console.log('❌ Nenhum endpoint HTTP válido encontrado');
    console.log('\n🔧 Sugestões:');
    console.log('   1. Verificar se o serviço web do Linx está configurado');
    console.log('   2. Implementar os endpoints necessários no Linx');
    console.log('   3. Verificar documentação do Linx para APIs');
  }
}

// Executar teste
if (require.main === module) {
  testLinxPorts().catch(console.error);
}

module.exports = { testLinxPorts };