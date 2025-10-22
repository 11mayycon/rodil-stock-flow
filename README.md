# 🏪 CAMINHO CERTO - Sistema de Gestão

Sistema completo de gestão de estoque, vendas e controle para postos de combustível e conveniências, desenvolvido com React, TypeScript e Supabase.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Estrutura de Usuários](#estrutura-de-usuários)
- [Módulos do Sistema](#módulos-do-sistema)
- [Integrações](#integrações)
- [Banco de Dados](#banco-de-dados)
- [Como Executar](#como-executar)
- [Deploy](#deploy)

## 🎯 Sobre o Projeto

O CAMINHO CERTO é um sistema web completo de gestão empresarial desenvolvido especificamente para postos de combustível e lojas de conveniência. O sistema oferece controle total sobre estoque, vendas, movimentações, desperdícios e gestão de equipe, com interface intuitiva e responsiva.

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultrarrápido
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **React Router DOM** - Roteamento client-side
- **React Query** - Gerenciamento de estado e cache de dados
- **Lucide React** - Biblioteca de ícones

### Backend & Infraestrutura
- **Supabase** - Backend-as-a-Service (BaaS)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Storage para arquivos
  - Real-time subscriptions
- **Supabase Auth** - Sistema de autenticação

### Bibliotecas Auxiliares
- **date-fns** - Manipulação de datas
- **sonner** - Sistema de notificações toast
- **zod** - Validação de schemas
- **react-hook-form** - Gerenciamento de formulários

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- Login com email (administradores)
- Login com CPF (funcionários)
- Senhas hasheadas com bcrypt
- Row Level Security (RLS) no banco de dados
- Sessões persistentes
- Controle de acesso por função (admin/employee)
- Sistema de bloqueio de usuários

### 📊 Dashboard Inteligente
- Visualização personalizada por tipo de usuário
- Cards de acesso rápido a funcionalidades
- Design responsivo e intuitivo
- Código de cores para identificação visual

## 👥 Estrutura de Usuários

### Administrador
Acesso completo ao sistema com permissões para:
- Gerenciar produtos e estoque
- Visualizar e analisar vendas
- Gerenciar equipe de funcionários
- Configurar sistema
- Aprovar desperdícios
- Monitorar produtos em risco

### Funcionário
Acesso operacional para:
- Realizar vendas (PDV)
- Consultar produtos
- Registrar desperdícios
- Visualizar histórico de vendas
- Ver movimentações de estoque

## 🎛️ Módulos do Sistema

### 1. 🛒 PDV - Ponto de Venda
**Acesso:** Todos os usuários  
**Função:** Realizar vendas rápidas

**Funcionalidades:**
- Busca de produtos por código de barras ou nome
- Adição/remoção de itens no carrinho
- Cálculo automático de total
- Múltiplas formas de pagamento:
  - Dinheiro
  - Débito
  - Crédito
  - PIX
- Registro automático de movimentação de estoque
- Atualização instantânea de quantidades
- Interface otimizada para uso rápido

### 2. 📦 Produtos
**Acesso:** Administrador  
**Função:** Gerenciar catálogo de produtos

**Funcionalidades:**
- Cadastro de novos produtos
- Edição de informações:
  - Nome
  - Código de barras
  - Descrição
  - Unidade de medida
  - Preço
  - Quantidade em estoque
- Exclusão de produtos
- Busca e filtros
- Visualização em lista

### 3. 📥 Importar Produtos
**Acesso:** Administrador  
**Função:** Importação em massa de produtos via CSV

**Funcionalidades:**
- Upload de arquivo CSV
- Mapeamento automático de colunas:
  - ID
  - Nome
  - Código de Barras
  - Categoria
  - Data de Criação
  - Unidade de Medida
  - Quantidade
  - Preço de Custo
  - Preço de Venda
  - Endereço no Estoque
  - Data de Fabricação
  - Data de Validade
- Importação em lotes de 100 produtos
- Barra de progresso
- Notificações de sucesso/erro
- Preview antes da importação

### 4. 📈 Recebimento
**Acesso:** Administrador  
**Função:** Registrar entrada de mercadorias

**Funcionalidades:**
- Registro de notas fiscais
- Adição de produtos recebidos
- Informações da nota:
  - Número da nota
  - Fornecedor
  - Data de recebimento
- Atualização automática de estoque
- Registro de movimentação tipo "recebimento"
- Histórico de recebimentos

### 5. 🔍 Consultar Produtos
**Acesso:** Todos os usuários  
**Função:** Visualizar estoque disponível

**Funcionalidades:**
- Lista completa de produtos
- Código de cores por quantidade:
  - 🟢 **Verde:** Estoque > 20 unidades
  - 🟡 **Amarelo:** Estoque entre 10-20 unidades
  - 🔴 **Vermelho:** Estoque < 5 unidades
- Informações exibidas:
  - Código de barras
  - Nome do produto
  - Quantidade em estoque
  - Data da última venda
- Busca em tempo real
- Interface responsiva

### 6. 📋 Histórico de Vendas
**Acesso:** Todos os usuários  
**Função:** Visualizar todas as vendas realizadas

**Funcionalidades:**
- Lista de vendas com:
  - Data e hora
  - Valor total
  - Forma de pagamento
  - Vendedor responsável
- Detalhamento de itens vendidos
- Filtros por período
- Busca por vendedor
- Exportação de relatórios

### 7. 📊 Movimentações
**Acesso:** Todos os usuários  
**Função:** Histórico de movimentações de estoque

**Funcionalidades:**
- Registro de todas as movimentações:
  - Vendas
  - Recebimentos
  - Desperdícios
  - Ajustes
- Informações detalhadas:
  - Produto
  - Tipo de movimentação
  - Quantidade
  - Data/hora
  - Usuário responsável
  - Motivo (quando aplicável)
- Filtros por tipo e período
- Rastreabilidade completa

### 8. 🗑️ Desperdício
**Acesso:** Todos os usuários  
**Função:** Registrar perdas e avarias

**Funcionalidades:**
- Registro de desperdícios com:
  - Seleção de produto
  - Quantidade perdida
  - Motivo do desperdício
  - Upload de fotos (até 3 imagens)
- Armazenamento de imagens no Supabase Storage
- Sistema de confirmação por administrador
- Estados:
  - Pendente (amarelo)
  - Confirmado (verde)
- Histórico completo de desperdícios
- Atualização de estoque após confirmação

### 9. ⚠️ Produtos em Risco
**Acesso:** Administrador  
**Função:** Monitorar produtos críticos

**Funcionalidades:**
- Alertas automáticos para:
  - 🔴 Estoque < 5 unidades
  - 🟡 Estoque entre 10-20 unidades
  - ⏰ Produtos sem venda há mais de 10 dias
- Visualização em cards categorizados
- Detalhes expandidos:
  - Código de barras
  - Quantidade atual
  - Data última movimentação
  - Data última venda
- Botão de acesso rápido para ajuste de estoque
- Cálculo em tempo real

### 10. 💰 Venda Total
**Acesso:** Administrador  
**Função:** Resumo de vendas por usuário

**Funcionalidades:**
- Totalização por vendedor
- Período configurável
- Análise de performance
- Ranking de vendedores
- Métricas de vendas:
  - Total de vendas
  - Ticket médio
  - Quantidade de transações
- Filtros por data e vendedor

### 11. 👤 Usuários
**Acesso:** Administrador  
**Função:** Gerenciar equipe

**Funcionalidades:**
- Cadastro de funcionários com:
  - Nome completo
  - Email
  - CPF
  - Cargo
  - Senha
  - Função (admin/employee)
- Edição de informações
- Bloqueio/desbloqueio de usuários
- Exclusão de contas
- Listagem completa da equipe
- Controle de permissões

## 🔗 Integrações

### Supabase Database
- **PostgreSQL** como banco de dados principal
- **Row Level Security (RLS)** para segurança em nível de linha
- **Triggers** para atualização automática de timestamps
- **Policies** customizadas por tabela e operação

### Supabase Storage
- Bucket `desperdicios` (público) para imagens de desperdício
- Upload com validação de tipo e tamanho
- URLs públicas para acesso às imagens
- Organização por ID de registro

### Supabase Auth (Preparado)
- Estrutura preparada para autenticação via Supabase Auth
- Atualmente usando autenticação customizada com tabela `users`
- Possibilidade de migração futura para Auth nativo

## 🗄️ Banco de Dados

### Tabelas Principais

#### users
Gerenciamento de usuários do sistema
```sql
- id (uuid, PK)
- name (text)
- email (text, unique)
- cpf (text, unique)
- password_hash (text)
- role (enum: admin, employee)
- cargo (text)
- blocked (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### products
Catálogo de produtos
```sql
- id (uuid, PK)
- nome (text)
- codigo_barras (text)
- descricao (text)
- unidade (text)
- preco (numeric)
- quantidade_estoque (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

#### sales
Registro de vendas
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- total (numeric)
- forma_pagamento (enum: dinheiro, debito, credito, pix)
- created_at (timestamp)
```

#### sale_items
Itens de cada venda
```sql
- id (uuid, PK)
- sale_id (uuid, FK)
- product_id (uuid, FK)
- codigo_produto (text)
- nome_produto (text)
- quantidade (integer)
- preco_unitario (numeric)
```

#### receipts
Recebimentos de mercadorias
```sql
- id (uuid, PK)
- numero_nota (text)
- fornecedor (text)
- data_recebimento (timestamp)
- created_by (uuid, FK)
- created_at (timestamp)
```

#### receipt_items
Itens de cada recebimento
```sql
- id (uuid, PK)
- receipt_id (uuid, FK)
- product_id (uuid, FK)
- codigo_produto (text)
- nome_produto (text)
- quantidade (integer)
- valor_unitario (numeric)
- created_at (timestamp)
```

#### stock_movements
Movimentações de estoque
```sql
- id (uuid, PK)
- product_id (uuid, FK)
- user_id (uuid, FK)
- tipo (enum: venda, recebimento, desperdicio, ajuste)
- quantidade (integer)
- motivo (text)
- ref_id (uuid) -- Referência para venda/recebimento/desperdício
- created_at (timestamp)
```

#### waste_records
Registros de desperdício
```sql
- id (uuid, PK)
- product_id (uuid, FK)
- user_id (uuid, FK)
- quantidade (integer)
- motivo (text)
- image_paths (text[])
- confirmed (boolean)
- confirmed_by (uuid, FK)
- confirmed_at (timestamp)
- created_at (timestamp)
```

#### audit_logs
Logs de auditoria
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- action (text)
- details (jsonb)
- created_at (timestamp)
```

### Enums

```sql
- user_role: 'admin', 'employee'
- payment_method: 'dinheiro', 'debito', 'credito', 'pix'
- movement_type: 'venda', 'recebimento', 'desperdicio', 'ajuste'
```

### Segurança (RLS Policies)

Todas as tabelas possuem Row Level Security habilitado com policies específicas:

- **Usuários autenticados** podem visualizar dados relevantes
- **Administradores** têm acesso completo
- **Funcionários** têm acesso limitado apenas à visualização
- Operações de escrita restritas por função
- Dados sensíveis protegidos

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase
- Git

### Instalação

1. **Clone o repositório**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

O projeto já está configurado com as credenciais do Supabase em `src/integrations/supabase/client.ts`

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
```
http://localhost:5173
```

### Credenciais Padrão

O sistema usa autenticação customizada. Crie o primeiro usuário administrador diretamente no banco de dados Supabase.

## 📦 Deploy

### Deploy na Lovable

1. Acesse [Lovable](https://lovable.dev/projects/b204c131-2037-43e2-82f3-fdc04eed2ba6)
2. Clique em **Share → Publish**
3. Seu app estará disponível em: `yoursite.lovable.app`

### Domínio Customizado

1. Navegue até Project > Settings > Domains
2. Clique em Connect Domain
3. Siga as instruções para conectar seu domínio
4. Requer plano pago do Lovable

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

## 📱 Interface Responsiva

O sistema é totalmente responsivo e funciona perfeitamente em:
- 💻 Desktop
- 📱 Tablet
- 📲 Smartphone

## 🎨 Design System

O projeto utiliza um design system consistente com:
- **Tokens semânticos** definidos em `src/index.css`
- **Configuração Tailwind** em `tailwind.config.ts`
- **Componentes shadcn/ui** customizados
- **Modo claro/escuro** (preparado para implementação)
- **Paleta de cores** temática
- **Tipografia** hierárquica

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Row Level Security (RLS) no Supabase
- ✅ Autenticação por sessão
- ✅ Validação de inputs
- ✅ Controle de acesso por função
- ✅ Proteção contra SQL injection
- ✅ HTTPS em produção
- ✅ Auditoria de ações

## 📈 Performance

- ⚡ Vite para builds ultrarrápidos
- ⚡ Code splitting automático
- ⚡ Lazy loading de componentes
- ⚡ Cache inteligente com React Query
- ⚡ Otimização de bundle
- ⚡ Assets otimizados

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir:

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Push para a branch
4. Abra um Pull Request

## 📄 Licença

Projeto proprietário - Todos os direitos reservados

## 👨‍💻 Desenvolvido com

- ❤️ Paixão por código limpo
- ☕ Muito café
- 🎵 Boa música
- 💡 Lovable.dev

---

**POSTO RODOIL** - Sistema de Gestão Completo  
Desenvolvido em 2025
