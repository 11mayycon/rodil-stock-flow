#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const LINX_IP = '192.168.15.9';
const GATEWAY = '192.168.15.1';

// Função para executar ping
async function pingHost(host, count = 4) {
  try {
    console.log(`📡 Testando ping para ${host}...`);
    const { stdout, stderr } = await execAsync(`ping -c ${count} ${host}`);
    
    if (stderr) {
      console.log(`❌ Erro no ping: ${stderr}`);
      return false;
    }
    
    // Extrair estatísticas do ping
    const lines = stdout.split('\n');
    const statsLine = lines.find(line => line.includes('packet loss'));
    
    if (statsLine) {
      console.log(`✅ Ping OK: ${statsLine.trim()}`);
      
      // Verificar tempo de resposta
      const timeLine = lines.find(line => line.includes('min/avg/max'));
      if (timeLine) {
        console.log(`⏱️ Tempos: ${timeLine.trim()}`);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Falha no ping: ${error.message}`);
    return false;
  }
}

// Função para testar rota de rede
async function testRoute(host) {
  try {
    console.log(`🛣️ Testando rota para ${host}...`);
    const { stdout, stderr } = await execAsync(`traceroute -m 10 ${host} 2>/dev/null || tracepath ${host}`);
    
    if (stdout) {
      const lines = stdout.split('\n').filter(line => line.trim());
      console.log('📍 Rota encontrada:');
      lines.slice(0, 5).forEach(line => {
        if (line.trim()) {
          console.log(`   ${line.trim()}`);
        }
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`⚠️ Não foi possível traçar rota: ${error.message}`);
    return false;
  }
}

// Função para verificar ARP
async function checkArp(ip) {
  try {
    console.log(`🔍 Verificando ARP para ${ip}...`);
    const { stdout } = await execAsync(`arp -n ${ip} 2>/dev/null || echo "ARP não disponível"`);
    
    if (stdout.includes(ip)) {
      console.log(`✅ Entrada ARP encontrada: ${stdout.trim()}`);
      return true;
    } else {
      console.log(`⚠️ Nenhuma entrada ARP para ${ip}`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️ Erro ao verificar ARP: ${error.message}`);
    return false;
  }
}

// Função para verificar conectividade de rede
async function testNetworkConnectivity() {
  console.log('🌐 TESTE DE CONECTIVIDADE DE REDE');
  console.log('='.repeat(50));
  console.log(`📍 IP do Linx: ${LINX_IP}`);
  console.log(`🚪 Gateway: ${GATEWAY}`);
  console.log('');
  
  const results = {
    gateway: false,
    linx: false,
    route: false,
    arp: false
  };
  
  // Teste 1: Ping para o gateway
  console.log('🔸 Teste 1: Conectividade com Gateway');
  results.gateway = await pingHost(GATEWAY, 3);
  console.log('');
  
  // Teste 2: Ping para o Linx
  console.log('🔸 Teste 2: Conectividade com Linx');
  results.linx = await pingHost(LINX_IP, 4);
  console.log('');
  
  // Teste 3: Verificar rota
  console.log('🔸 Teste 3: Rota de Rede');
  results.route = await testRoute(LINX_IP);
  console.log('');
  
  // Teste 4: Verificar ARP
  console.log('🔸 Teste 4: Tabela ARP');
  results.arp = await checkArp(LINX_IP);
  console.log('');
  
  // Resumo dos resultados
  console.log('📋 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  
  if (results.gateway) {
    console.log('✅ Gateway acessível - Rede local OK');
  } else {
    console.log('❌ Gateway inacessível - Problema na rede local');
  }
  
  if (results.linx) {
    console.log('✅ Linx acessível via ping - IP correto');
    console.log('🔧 Próximo passo: Verificar se serviços web estão rodando no Linx');
  } else {
    console.log('❌ Linx inacessível via ping');
    
    if (results.gateway) {
      console.log('🔧 Possíveis causas:');
      console.log('   1. IP do Linx incorreto (verificar se é 192.168.15.9)');
      console.log('   2. Firewall no Linx bloqueando ping');
      console.log('   3. Máquina Linx desligada ou desconectada');
      console.log('   4. Problema na configuração de rede do Linx');
    } else {
      console.log('🔧 Problema na rede local - verificar configuração');
    }
  }
  
  console.log('');
  console.log('🔧 PRÓXIMOS PASSOS:');
  
  if (results.linx) {
    console.log('1. ✅ Conectividade básica OK');
    console.log('2. 🔄 Implementar endpoints web no Linx');
    console.log('3. 🔄 Configurar firewall para liberar portas HTTP');
    console.log('4. 🔄 Testar endpoints específicos');
  } else {
    console.log('1. 🔧 Resolver conectividade básica primeiro');
    console.log('2. 📞 Verificar com equipe do Linx:');
    console.log('   - IP correto da máquina');
    console.log('   - Status da máquina (ligada/conectada)');
    console.log('   - Configuração de firewall');
  }
  
  return results;
}

// Executar teste
if (require.main === module) {
  testNetworkConnectivity().catch(console.error);
}

module.exports = { testNetworkConnectivity };