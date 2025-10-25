# 🔗 Integração Sistema Caminho Certo ↔ Linx

## 📋 Informações da Integração

### 🏢 **Sistema Caminho Certo (VPS)**
- **IP:** `148.230.76.60`
- **Porta:** `5000`
- **Status:** ✅ Online e funcionando

---

## 🌐 **Nossos Endpoints Disponíveis**

### 1. **Receber Vendas do Linx**
```
POST http://148.230.76.60:5000/sync/linx-sale
```
**Descrição:** Endpoint para receber dados de vendas do Linx e atualizar estoque no Supabase

**Formato JSON esperado:**
```json
{
  "source": "linx",
  "venda_id": "12345",
  "timestamp": "2024-01-20T10:30:00Z",
  "items": [
    {
      "codigo_barras": "7891234567890",
      "nome_produto": "PRODUTO EXEMPLO",
      "quantidade": 2,
      "preco_unitario": 10.50
    }
  ]
}
```

### 2. **Buscar Produtos do Linx**
```
GET http://148.230.76.60:5000/sync/linx-products
```
**Descrição:** Endpoint que busca produtos do Linx para sincronização

### 3. **Receber Vendas do Sistema Local**
```
POST http://148.230.76.60:5000/sync/queue-sale
```
**Descrição:** Endpoint para enviar vendas do nosso sistema para o Linx

### 4. **Status do Servidor**
```
GET http://148.230.76.60:5000/sync/status
GET http://148.230.76.60:5000/health
```

---

## 🎯 **Endpoints que Precisamos do Linx**

### 1. **Fornecer Lista de Produtos**
```
GET http://[IP_DO_LINX]:5050/sync/products
```
**Formato JSON esperado:**
```json
[
  {
    "codigo_barras": "7891234567890",
    "descricao": "PRODUTO EXEMPLO",
    "preco": 10.50,
    "estoque": 100,
    "categoria": "ALIMENTICIOS",
    "ativo": true
  }
]
```

### 2. **Receber Vendas do Caminho Certo**
```
POST http://[IP_DO_LINX]:5050/sync/cc-sale
```
**Formato JSON que enviaremos:**
```json
{
  "source": "caminhocerto",
  "venda_id": "CC-12345",
  "timestamp": "2024-01-20T10:30:00Z",
  "total": 21.00,
  "forma_pagamento": "dinheiro",
  "items": [
    {
      "codigo_barras": "7891234567890",
      "nome_produto": "PRODUTO EXEMPLO",
      "quantidade": 2,
      "preco_unitario": 10.50,
      "subtotal": 21.00
    }
  ]
}
```

---

## 📊 **Informações Necessárias do Linx**

### 🔧 **Configuração de Rede:**
- **IP do servidor Linx:** `_____________`
- **Porta do servidor Linx:** `_____________` (padrão: 5050)
- **Protocolo:** HTTP/HTTPS

### 🔐 **Autenticação (se necessária):**
- **Tipo de autenticação:** `_____________`
- **Token/API Key:** `_____________`
- **Usuário/Senha:** `_____________`

### 📋 **Estrutura de Dados:**
- **Formato de código de barras:** `_____________`
- **Campos obrigatórios para produtos:** `_____________`
- **Campos obrigatórios para vendas:** `_____________`
- **Formato de data/hora preferido:** `_____________`

### ⚙️ **Configurações Específicas:**
- **Frequência de sincronização:** `_____________`
- **Timeout para requisições:** `_____________`
- **Retry em caso de falha:** `_____________`
- **Log de transações:** `_____________`

---

## 🚀 **Próximos Passos**

### ✅ **Já Implementado:**
- [x] Servidor de sincronização rodando
- [x] Endpoint para receber vendas do Linx
- [x] Endpoint para buscar produtos do Linx
- [x] Sistema de fila para vendas offline
- [x] Logs de sincronização

### 📝 **Pendente:**
- [ ] Configurar IP e porta do Linx
- [ ] Implementar endpoints no Linx
- [ ] Testar sincronização de produtos
- [ ] Testar sincronização de vendas
- [ ] Configurar autenticação (se necessária)
- [ ] Testes de conectividade
- [ ] Documentação final

---

## 📞 **Contato para Suporte**

Para dúvidas ou suporte técnico durante a integração, entre em contato:

**Sistema Caminho Certo**
- **Desenvolvedor:** [Seu Nome]
- **Email:** [seu.email@exemplo.com]
- **Telefone:** [seu telefone]

---

## 🔍 **Testes de Conectividade**

Para testar se nosso servidor está acessível:
```bash
curl -X GET http://148.230.76.60:5000/health
```

Resposta esperada:
```json
{"status": "healthy"}
```

---

**Data de criação:** $(date)
**Versão:** 1.0