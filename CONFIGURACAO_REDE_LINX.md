# 🌐 Configuração de Rede - Integração Linx

## 📋 Status Atual

### ✅ Servidor Linx Local
- **IP Local**: `192.168.15.9`
- **Porta**: `8080`
- **Status**: ✅ Funcionando perfeitamente
- **Endpoints Disponíveis**:
  - `GET /health` - Status do servidor
  - `GET /sync/products` - Lista todos os produtos (458 produtos)
  - `GET /sync/products/:id` - Busca produto específico

### ✅ VPS Atualizada
- **Node.js**: Atualizado de v18.19.1 → v20.19.5 ✅
- **IP VPS**: `148.230.76.60`
- **Porta**: `5000`

## 🚧 Problema Atual: Conectividade Externa

### ❌ Diagnóstico de Rede
```
❌ Gateway inacessível (192.168.15.1)
❌ Linx inacessível via ping (192.168.15.9)
🔧 Problema na rede local - verificar configuração
```

## 🔧 Soluções Necessárias

### 1. 🏠 Configuração do Roteador (CRÍTICO)

Para que a VPS (`148.230.76.60`) possa acessar o servidor Linx (`192.168.15.9:8080`), é necessário configurar o roteador:

#### Opção A: Port Forwarding (Recomendado)
```
Porta Externa: 8080
IP Interno: 192.168.15.9
Porta Interna: 8080
Protocolo: TCP
```

#### Opção B: DMZ (Alternativa)
```
IP DMZ: 192.168.15.9
```

### 2. 🔥 Verificação de Firewall

#### Windows 10 Pro (Máquina Linx)
```cmd
# Verificar regras do firewall
netsh advfirewall firewall show rule name=all | findstr 8080

# Adicionar regra se necessário
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=8080
```

### 3. 🌐 Teste de Conectividade Externa

Após configurar o roteador, testar:
```bash
# Da VPS, testar:
curl -v http://SEU_IP_EXTERNO:8080/health
curl -v http://SEU_IP_EXTERNO:8080/sync/products
```

## 📊 Dados do Sistema Linx

### 🖥️ Hardware/Software
- **OS**: Windows 10 Pro
- **RAM**: 8 GB
- **Linx**: Posto Fácil - Módulo PDV v15.0.9.0
- **Database**: Firebird 3.0.4.33054
- **Node.js**: v22.21.0 (local)

### 🗄️ Estrutura de Dados
```json
{
  "success": true,
  "timestamp": "2025-10-24T04:42:16.411Z",
  "total_products": 458,
  "products": [
    {
      "id": 1,
      "description": "REFRG COCA COLA LT 350ML",
      "unit": 7,
      "cost_price": 3.89,
      "sale_price": 7,
      "sale_price_term": 7,
      "ncm_code": "22021000",
      "active": true
    }
  ]
}
```

## 🎯 Próximos Passos

### 1. ⚙️ Configuração Imediata (Equipe Linx)
- [ ] Configurar port forwarding no roteador (8080 → 192.168.15.9:8080)
- [ ] Verificar/configurar firewall do Windows
- [ ] Obter IP externo da rede

### 2. 🧪 Testes de Conectividade (VPS)
- [ ] Testar acesso externo aos endpoints
- [ ] Validar retorno de dados
- [ ] Configurar script de sincronização

### 3. 🔄 Integração Final
- [ ] Atualizar configurações do script
- [ ] Executar sincronização de produtos
- [ ] Documentar processo completo

## 📞 Informações de Contato

### Endpoints VPS (Já Funcionando)
- **Base URL**: `http://148.230.76.60:5000`
- **Receber Vendas**: `POST /sync/cc-sale`
- **Status**: `GET /health`

### Script de Sincronização
- **Arquivo**: `update_products_with_linx_barcodes.cjs`
- **Status**: Pronto para uso após conectividade
- **Localização**: `/root/posto/posto/`

---

**⚠️ IMPORTANTE**: A conectividade externa é o único bloqueio restante para completar a integração. Todos os outros componentes estão funcionando perfeitamente.