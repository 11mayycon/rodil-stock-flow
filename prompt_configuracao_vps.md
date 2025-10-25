# Prompt para Configuração da VPS - Sistema de Sincronização Linx

## Contexto
Preciso configurar uma VPS para receber dados de sincronização de um sistema Linx (PDV). O sistema local já está desenvolvido e envia dados de vendas, estoque e produtos via HTTP POST para endpoints específicos na VPS.

## Objetivo
Criar uma API REST na VPS que receba, processe e armazene os dados de sincronização do sistema Linx, permitindo consultas e relatórios através de uma interface web.

## Especificações Técnicas da VPS

### Informações do Servidor
- **IP da VPS**: 148.230.76.60
- **Porta**: 5000
- **Sistema Operacional**: Linux (preferencialmente Ubuntu/Debian)
- **Tecnologia Sugerida**: Node.js + Express ou Python + Flask/FastAPI
- **Banco de Dados**: PostgreSQL ou MySQL

### Endpoints Necessários

#### 1. Endpoint de Health Check
```
GET /api/health
```
**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-10-24T05:00:00.000Z",
  "service": "Linx VPS Sync API",
  "version": "1.0.0"
}
```

#### 2. Sincronização de Produtos
```
POST /api/products/sync
```
**Estrutura dos dados recebidos:**
```json
{
  "timestamp": "2024-10-24T05:00:00.000Z",
  "source": "linx_sync_agent",
  "data_type": "produtos",
  "records": [
    {
      "id": 1,
      "descricao": "Produto Exemplo",
      "descricao_abreviada": "Prod Ex",
      "preco_custo": 10.50,
      "preco_venda": 15.90,
      "preco_prazo": 17.50,
      "ncm": "12345678",
      "ativo": true,
      "estoque_minimo": 5,
      "estoque_atual": 25
    }
  ]
}
```

#### 3. Sincronização de Estoque
```
POST /api/stock/sync
```
**Estrutura dos dados recebidos:**
```json
{
  "timestamp": "2024-10-24T05:00:00.000Z",
  "source": "linx_sync_agent",
  "data_type": "estoque",
  "records": [
    {
      "produto_id": 1,
      "produto_descricao": "Produto Exemplo",
      "quantidade_disponivel": 25,
      "quantidade_reservada": 2,
      "estoque_minimo": 5,
      "preco_custo": 10.50,
      "preco_venda": 15.90,
      "ultima_alteracao": "2024-10-24T04:30:00.000Z"
    }
  ]
}
```

#### 4. Sincronização de Vendas
```
POST /api/sales/sync
```
**Estrutura dos dados recebidos:**
```json
{
  "timestamp": "2024-10-24T05:00:00.000Z",
  "source": "linx_sync_agent",
  "data_type": "vendas",
  "records": [
    {
      "venda_id": 12345,
      "data_venda": "2024-10-24T14:30:00.000Z",
      "valor_total": 47.70,
      "numero_cupom": "000123",
      "cliente": {
        "id": 1001,
        "nome": "João Silva",
        "documento": "12345678901"
      },
      "situacao": 1,
      "itens": [
        {
          "item_venda_id": 1,
          "produto_id": 1,
          "produto_descricao": "Produto A",
          "quantidade": 2,
          "preco_unitario": 15.90,
          "valor_total": 31.80
        },
        {
          "item_venda_id": 2,
          "produto_id": 2,
          "produto_descricao": "Produto B",
          "quantidade": 1,
          "preco_unitario": 15.90,
          "valor_total": 15.90
        }
      ]
    }
  ]
}
```

### Endpoints de Consulta (Opcionais mas Recomendados)

#### 5. Consultar Produtos
```
GET /api/products
GET /api/products/:id
```

#### 6. Consultar Estoque
```
GET /api/stock
GET /api/stock/product/:productId
```

#### 7. Consultar Vendas
```
GET /api/sales
GET /api/sales/:id
GET /api/sales/period?start=YYYY-MM-DD&end=YYYY-MM-DD
```

#### 8. Dashboard/Relatórios
```
GET /api/dashboard/summary
GET /api/reports/sales-by-period
GET /api/reports/stock-levels
```

## Estrutura do Banco de Dados

### Tabela: products
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    descricao_abreviada VARCHAR(100),
    preco_custo DECIMAL(10,2),
    preco_venda DECIMAL(10,2),
    preco_prazo DECIMAL(10,2),
    ncm VARCHAR(8),
    ativo BOOLEAN DEFAULT true,
    estoque_minimo INTEGER DEFAULT 0,
    estoque_atual INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: stock_movements
```sql
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER REFERENCES products(id),
    quantidade_disponivel INTEGER,
    quantidade_reservada INTEGER,
    ultima_alteracao TIMESTAMP,
    sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: sales
```sql
CREATE TABLE sales (
    venda_id INTEGER PRIMARY KEY,
    data_venda TIMESTAMP,
    valor_total DECIMAL(10,2),
    numero_cupom VARCHAR(50),
    cliente_id INTEGER,
    cliente_nome VARCHAR(255),
    cliente_documento VARCHAR(20),
    situacao INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: sale_items
```sql
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES sales(venda_id),
    item_venda_id INTEGER,
    produto_id INTEGER REFERENCES products(id),
    produto_descricao VARCHAR(255),
    quantidade INTEGER,
    preco_unitario DECIMAL(10,2),
    valor_total DECIMAL(10,2)
);
```

### Tabela: sync_logs
```sql
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50),
    records_count INTEGER,
    sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(100),
    status VARCHAR(20) DEFAULT 'success'
);
```

## Funcionalidades Requeridas

### 1. Processamento de Dados
- Receber dados via POST nos endpoints especificados
- Validar estrutura dos dados recebidos
- Inserir/atualizar dados no banco de dados
- Registrar logs de sincronização
- Tratamento de erros e duplicatas

### 2. Segurança
- Autenticação básica ou por token (opcional)
- Validação de origem dos dados
- Rate limiting para evitar spam
- Logs de acesso e auditoria

### 3. Monitoramento
- Endpoint de health check
- Logs detalhados de operações
- Métricas de performance
- Alertas em caso de falhas

### 4. Interface Web (Opcional)
- Dashboard com resumo dos dados
- Visualização de vendas por período
- Relatórios de estoque
- Logs de sincronização

## Configurações de Ambiente

### Variáveis de Ambiente Necessárias
```env
# Servidor
PORT=5000
NODE_ENV=production

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linx_sync
DB_USER=linx_user
DB_PASSWORD=senha_segura

# Configurações da API
API_VERSION=v1
LOG_LEVEL=info
MAX_RECORDS_PER_SYNC=1000

# Segurança (opcional)
API_KEY=sua_chave_api_aqui
JWT_SECRET=seu_jwt_secret_aqui
```

## Informações do Sistema Origem (Linx)

### Dados da Máquina Local
- **Nome da Máquina**: DESKTOP-368C62L
- **IP Local**: 192.168.15.9
- **Sistema**: Windows
- **Banco Firebird**: C:\CFWin\Data\CFWIN.FDB

### Configuração do Agente de Sincronização
- **User-Agent**: Linx-Sales-Sync-Agent/1.0
- **Timeout**: 30 segundos
- **Frequência**: A cada 5 minutos
- **Formato**: JSON via HTTP POST

## Tarefas de Implementação

1. **Configurar servidor web** (Express.js/Flask)
2. **Configurar banco de dados** (PostgreSQL/MySQL)
3. **Implementar endpoints de sincronização**
4. **Criar estrutura de banco de dados**
5. **Implementar validação de dados**
6. **Configurar logging e monitoramento**
7. **Implementar endpoints de consulta**
8. **Criar interface web básica** (opcional)
9. **Configurar SSL/HTTPS** (recomendado)
10. **Implementar backup automático**

## Exemplo de Resposta dos Endpoints

### Sucesso (200)
```json
{
  "status": "success",
  "message": "Dados sincronizados com sucesso",
  "records_processed": 15,
  "timestamp": "2024-10-24T05:00:00.000Z"
}
```

### Erro (400/500)
```json
{
  "status": "error",
  "message": "Erro na validação dos dados",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-10-24T05:00:00.000Z"
}
```

## Próximos Passos

1. Confirmar as especificações técnicas
2. Escolher a stack tecnológica (Node.js/Python)
3. Configurar o ambiente de desenvolvimento
4. Implementar os endpoints básicos
5. Testar a conectividade com o sistema Linx
6. Implementar funcionalidades avançadas
7. Deploy em produção

---

**Nota**: Este sistema deve ser robusto e confiável, pois lidará com dados críticos de vendas e estoque em tempo real.