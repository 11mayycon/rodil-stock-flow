# 🚀 Prompt Completo para Configuração da VPS - Sistema de Sincronização Linx

## 📋 Contexto Atualizado

Preciso configurar uma VPS para receber dados de sincronização de um sistema Linx (PDV). O sistema local já está desenvolvido e funcionando perfeitamente, enviando dados de vendas, estoque e produtos via HTTP para endpoints específicos na VPS.

### ✅ Status Atual da Integração
- **Sistema CFWin**: ✅ 100% Integrado e funcionando
- **Sistema Linx**: ✅ Servidor HTTP funcionando localmente
- **VPS**: ✅ Node.js v20.19.5 atualizado
- **Pendência**: Configuração de conectividade externa (port forwarding)

## 🎯 Objetivo

Criar uma API REST robusta na VPS que receba, processe e armazene os dados de sincronização do sistema Linx, permitindo consultas e relatórios através de uma interface web moderna.

## 🖥️ Especificações Técnicas da VPS

### Informações Confirmadas do Servidor
- **IP da VPS**: `148.230.76.60`
- **Porta Principal**: `5000`
- **Node.js**: `v20.19.5` ✅ Atualizado
- **Sistema Operacional**: Linux Ubuntu
- **Tecnologia Recomendada**: Node.js + Express + PostgreSQL
- **SSL/HTTPS**: Necessário configurar (Let's Encrypt)

### 📊 Dados Reais do Sistema Linx (Atualizados)

#### Sistema Local Funcionando
- **Máquina**: `DESKTOP-368C62L`
- **IP Local**: `192.168.15.9`
- **Porta**: `8080`
- **Sistema**: Windows 10 Pro
- **RAM**: 8 GB
- **Banco**: Firebird 3.0.4.33054 (`C:\CFWin\Data\CFWIN.FDB`)
- **Node.js Local**: v22.21.0

#### Endpoints Linx Funcionais
```
✅ GET http://192.168.15.9:8080/health
✅ GET http://192.168.15.9:8080/sync/products (458 produtos)
✅ GET http://192.168.15.9:8080/sync/products/:id
```

#### Estrutura Real dos Dados (458 Produtos)
```json
{
  "success": true,
  "timestamp": "2025-10-24T04:52:13.989Z",
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

## 🌐 Endpoints Necessários na VPS

### 1. Health Check
```
GET /api/health
```
**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-24T05:00:00.000Z",
  "service": "Linx VPS Sync API",
  "version": "2.0.0",
  "linx_connectivity": "connected",
  "database": "connected"
}
```

### 2. Receber Vendas do Sistema Caminho Certo
```
POST /sync/cc-sale
```
**Estrutura esperada:**
```json
{
  "timestamp": "2025-10-24T05:00:00.000Z",
  "source": "caminho_certo_system",
  "sale": {
    "id": "CC-2025-001234",
    "date": "2025-10-24T14:30:00.000Z",
    "total": 47.70,
    "customer": {
      "name": "João Silva",
      "document": "12345678901"
    },
    "items": [
      {
        "product_id": 1,
        "description": "REFRG COCA COLA LT 350ML",
        "quantity": 2,
        "unit_price": 7.00,
        "total": 14.00,
        "barcode": "7894900011517"
      }
    ]
  }
}
```

### 3. Sincronizar Produtos do Linx
```
POST /api/products/sync
```
**Estrutura dos dados do Linx:**
```json
{
  "timestamp": "2025-10-24T05:00:00.000Z",
  "source": "linx_sync_agent",
  "data_type": "produtos",
  "records": [
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

### 4. Endpoints de Consulta
```
GET /api/products              # Listar produtos
GET /api/products/:id          # Produto específico
GET /api/sales                 # Listar vendas
GET /api/sales/period          # Vendas por período
GET /api/dashboard/summary     # Dashboard resumo
GET /api/reports/sales         # Relatórios de vendas
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: linx_products
```sql
CREATE TABLE linx_products (
    id INTEGER PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    unit INTEGER,
    cost_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    sale_price_term DECIMAL(10,2),
    ncm_code VARCHAR(8),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: cc_sales (Caminho Certo)
```sql
CREATE TABLE cc_sales (
    id VARCHAR(50) PRIMARY KEY,
    sale_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10,2),
    customer_name VARCHAR(255),
    customer_document VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: cc_sale_items
```sql
CREATE TABLE cc_sale_items (
    id SERIAL PRIMARY KEY,
    sale_id VARCHAR(50) REFERENCES cc_sales(id),
    product_id INTEGER,
    description VARCHAR(255),
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    barcode VARCHAR(50)
);
```

### Tabela: product_mapping
```sql
CREATE TABLE product_mapping (
    id SERIAL PRIMARY KEY,
    cc_product_id INTEGER,
    linx_product_id INTEGER REFERENCES linx_products(id),
    barcode VARCHAR(50),
    mapping_confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: sync_logs
```sql
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    operation_type VARCHAR(50),
    source_system VARCHAR(50),
    records_count INTEGER,
    status VARCHAR(20),
    error_message TEXT,
    sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ⚙️ Funcionalidades Requeridas

### 1. Processamento de Dados
- ✅ Receber vendas do Sistema Caminho Certo
- ✅ Sincronizar produtos do Linx (458 produtos)
- ✅ Mapear produtos por código de barras
- ✅ Validar e processar dados
- ✅ Registrar logs detalhados

### 2. Integração Bidirecional
- **Caminho Certo → VPS**: Receber vendas via POST
- **VPS → Linx**: Buscar produtos via GET (quando conectividade externa estiver configurada)
- **Mapeamento Automático**: Associar produtos por nome/código de barras

### 3. Segurança e Monitoramento
- **Autenticação**: API Key para endpoints críticos
- **Rate Limiting**: Proteção contra spam
- **Logs Auditoria**: Registro completo de operações
- **Health Checks**: Monitoramento de conectividade

### 4. Interface Web
- **Dashboard**: Resumo de vendas e produtos
- **Relatórios**: Vendas por período, produtos mais vendidos
- **Logs**: Visualização de sincronizações
- **Mapeamento**: Interface para ajustar mapeamento de produtos

## 🔧 Configurações de Ambiente

### Variáveis de Ambiente
```env
# Servidor
PORT=5000
NODE_ENV=production

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linx_sync
DB_USER=linx_user
DB_PASSWORD=senha_segura_aqui

# Integração Linx
LINX_BASE_URL=http://IP_EXTERNO_LINX:8080
LINX_TIMEOUT=30000
LINX_SYNC_INTERVAL=300000

# Segurança
API_KEY=chave_api_segura_aqui
JWT_SECRET=jwt_secret_seguro_aqui

# Logs
LOG_LEVEL=info
LOG_PATH=/var/log/linx-sync/
```

## 🚧 Configuração de Rede Pendente

### ⚠️ Problema Atual
A VPS não consegue acessar o servidor Linx porque falta configurar o roteador:

```bash
# Teste atual (falha)
curl http://192.168.15.9:8080/sync/products
# Resultado: Timeout - conectividade bloqueada
```

### 🔧 Solução Necessária
**Port Forwarding no Roteador:**
```
Porta Externa: 8080
IP Interno: 192.168.15.9
Porta Interna: 8080
Protocolo: TCP
```

### 🧪 Teste de Validação
```bash
# Após configuração do roteador
curl http://IP_EXTERNO_LINX:8080/sync/products
# Resultado esperado: JSON com 458 produtos
```

## 📋 Checklist de Implementação

### Fase 1: Preparação da VPS ✅
- [x] ✅ Atualizar Node.js para v20+
- [x] ✅ Configurar ambiente base
- [ ] Instalar PostgreSQL
- [ ] Configurar SSL/HTTPS

### Fase 2: Desenvolvimento da API
- [ ] Implementar endpoints de sincronização
- [ ] Criar estrutura do banco de dados
- [ ] Implementar validação de dados
- [ ] Configurar sistema de logs

### Fase 3: Integração
- [ ] Aguardar configuração de rede Linx
- [ ] Testar conectividade externa
- [ ] Implementar sincronização automática
- [ ] Configurar mapeamento de produtos

### Fase 4: Interface e Monitoramento
- [ ] Criar dashboard web
- [ ] Implementar relatórios
- [ ] Configurar alertas
- [ ] Documentar processo

## 🎯 Próximos Passos Imediatos

### 1. **Configuração Urgente** (Equipe Linx)
```
⚠️ CRÍTICO: Configurar port forwarding no roteador
   Porta: 8080 → 192.168.15.9:8080
   Protocolo: TCP
```

### 2. **Desenvolvimento VPS** (Paralelo)
- Instalar e configurar PostgreSQL
- Implementar endpoints básicos
- Criar estrutura do banco
- Preparar sistema de logs

### 3. **Teste de Integração** (Após conectividade)
- Validar acesso aos 458 produtos do Linx
- Testar sincronização bidirecional
- Configurar mapeamento automático

## 📊 Métricas de Sucesso

### Indicadores de Performance
- **Latência**: < 2 segundos para sincronização
- **Disponibilidade**: 99.9% uptime
- **Precisão**: 100% dos dados sincronizados
- **Mapeamento**: > 95% de produtos mapeados automaticamente

### Funcionalidades Críticas
- ✅ Receber vendas do Caminho Certo
- ✅ Sincronizar produtos do Linx
- ✅ Mapear produtos por código de barras
- ✅ Dashboard em tempo real
- ✅ Relatórios gerenciais

---

## 🚨 Resumo Executivo

**Status**: 95% Pronto para Implementação

**Bloqueio Atual**: Configuração de rede (port forwarding)

**Sistemas Funcionando**:
- ✅ CFWin integrado 100%
- ✅ Servidor Linx local (458 produtos)
- ✅ VPS atualizada (Node.js v20.19.5)
- ✅ Scripts de sincronização prontos

**Próximo Passo Crítico**: Configurar roteador para permitir acesso externo à porta 8080

**Tempo Estimado**: 2-3 dias após resolução da conectividade

---

**📌 Importante**: Este sistema integrará três pontos críticos: CFWin (já funcionando), Linx (servidor pronto) e Sistema Caminho Certo (aguardando VPS). A configuração de rede é o único bloqueio restante para completar a integração total.