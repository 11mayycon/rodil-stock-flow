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
- **React 18.3** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.8** - Superset JavaScript com tipagem estática
- **Vite 5.4** - Build tool e dev server ultrarrápido
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI acessíveis e customizáveis baseados em Radix UI
- **React Router DOM 6.30** - Roteamento client-side
- **TanStack Query 5.83** - Gerenciamento de estado e cache de dados
- **Lucide React 0.462** - Biblioteca de ícones moderna

### Backend & Infraestrutura
- **Supabase 2.76** - Backend-as-a-Service (BaaS)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Storage para arquivos
  - Real-time subscriptions
  - Edge Functions
- **Supabase Auth** - Sistema de autenticação

### PWA & Mobile
- **Vite PWA Plugin** - Progressive Web App com Service Worker
- **Capacitor 7.4** - Framework para aplicativos móveis nativos
- **Capacitor MLKit** - Scanner de código de barras nativo
- **Workbox** - Cache inteligente e estratégias offline

### Bibliotecas Auxiliares
- **date-fns 3.6** - Manipulação de datas
- **sonner 1.7** - Sistema de notificações toast
- **zod 3.25** - Validação de schemas TypeScript-first
- **react-hook-form 7.61** - Gerenciamento de formulários performático
- **bcryptjs 3.0** - Hash de senhas seguro
- **html5-qrcode 2.3** - Scanner QR/código de barras web
- **recharts 2.15** - Gráficos e visualizações de dados

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

- **Node.js 18+** e npm
- **Conta no Supabase** (configurada)
- **Git** para controle de versão

### Instalação

1. **Clone o repositório**
```bash
git clone <YOUR_GIT_URL>
cd caminho-certo-sistema
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
http://localhost:8080
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (porta 8080)

# Build
npm run build        # Build de produção otimizado
npm run build:dev    # Build de desenvolvimento

# Qualidade de código
npm run lint         # Executa ESLint para verificar código

# Preview
npm run preview      # Preview do build de produção
```

### Credenciais Padrão

O sistema usa autenticação customizada. Para criar o primeiro usuário administrador, use os scripts auxiliares:

```bash
# Criar administrador via API
node create_admin_api.mjs

# Criar administrador diretamente no Supabase
node create_admin_supabase.mjs

# Criar funcionário
node create_employee_supabase.mjs
```

## 📦 Deploy

### Deploy na Lovable (Recomendado)

1. Acesse [Lovable](https://lovable.dev/projects/b204c131-2037-43e2-82f3-fdc04eed2ba6)
2. Clique em **Share → Publish**
3. Seu app estará disponível em: `yoursite.lovable.app`
4. **Atualizações automáticas** - Mudanças no código são deployadas automaticamente

### Deploy em Outras Plataformas

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload da pasta dist/ no Netlify
```

#### Servidor Próprio
```bash
npm run build
# Servir arquivos da pasta dist/ com nginx/apache
```

### Domínio Customizado

#### Lovable (Plano Pago)
1. Navegue até Project > Settings > Domains
2. Clique em Connect Domain
3. Siga as instruções para conectar seu domínio

#### Outras Plataformas
- Configure DNS para apontar para o servidor
- Configure SSL/TLS (Let's Encrypt recomendado)

### Build para Produção

```bash
# Build otimizado para produção
npm run build

# Build de desenvolvimento (para debug)
npm run build:dev
```

Os arquivos otimizados estarão na pasta `dist/`

### Variáveis de Ambiente

Para deploy em produção, configure:
- **VITE_SUPABASE_URL** - URL do projeto Supabase
- **VITE_SUPABASE_ANON_KEY** - Chave pública do Supabase

## 🚀 Deploy em Produção (VPS/Servidor)

### Pré-requisitos do Servidor

- **Ubuntu 20.04+** ou similar
- **Node.js 18+** e npm
- **Acesso root** ou sudo
- **Domínio configurado** apontando para o servidor

### 1. Preparação do Ambiente

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2. Deploy da Aplicação

```bash
# Clone do projeto
git clone <YOUR_GIT_URL>
cd caminho-certo-sistema

# Instalar dependências
npm install

# Build de produção
npm run build
```

### 3. Configuração do PM2

O **PM2** é usado para gerenciar o processo da aplicação em produção.

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar serve para servir arquivos estáticos
sudo npm install -g serve
```

**Arquivo de configuração** (`ecosystem.config.cjs`):
```javascript
module.exports = {
  apps: [{
    name: 'caminho-certo',
    script: 'serve',
    args: 'dist -s -l 3000',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

```bash
# Iniciar aplicação com PM2
pm2 start ecosystem.config.cjs

# Verificar status
pm2 status

# Configurar PM2 para iniciar automaticamente
pm2 startup
pm2 save
```

### 4. Configuração do Nginx

O **Nginx** atua como proxy reverso e servidor web.

```bash
# Instalar Nginx
sudo apt update
sudo apt install -y nginx

# Criar configuração do site
sudo nano /etc/nginx/sites-available/caminho-certo
```

**Configuração do Nginx** (`/etc/nginx/sites-available/caminho-certo`):
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy para aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache específico para PWA
    location ~* \.(webmanifest|json)$ {
        proxy_pass http://localhost:3000;
        expires 1d;
        add_header Cache-Control "public, must-revalidate";
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/caminho-certo /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Configuração HTTPS com Certbot

O **Certbot** configura automaticamente certificados SSL gratuitos do Let's Encrypt.

```bash
# Instalar Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Verificar renovação automática
sudo systemctl status certbot.timer
```

O Certbot irá:
- ✅ Obter certificado SSL válido
- ✅ Configurar redirecionamento HTTP → HTTPS
- ✅ Configurar renovação automática
- ✅ Atualizar configuração do Nginx automaticamente

### 6. Verificação Final

```bash
# Verificar PM2
pm2 status

# Verificar Nginx
sudo systemctl status nginx

# Verificar certificado
sudo certbot certificates

# Testar aplicação
curl -I https://seu-dominio.com
```

### 7. Comandos Úteis de Manutenção

```bash
# PM2
pm2 restart caminho-certo    # Reiniciar aplicação
pm2 logs caminho-certo       # Ver logs
pm2 monit                    # Monitor em tempo real

# Nginx
sudo nginx -t                # Testar configuração
sudo systemctl reload nginx  # Recarregar configuração
sudo tail -f /var/log/nginx/error.log  # Ver logs de erro

# Certbot
sudo certbot renew --dry-run # Testar renovação
sudo certbot certificates    # Listar certificados
```

### 8. Estrutura Final

Após o deploy completo, você terá:

- ✅ **Aplicação PWA** rodando em produção
- ✅ **PM2** gerenciando processos em cluster
- ✅ **Nginx** como proxy reverso otimizado
- ✅ **HTTPS** com certificado SSL válido
- ✅ **Renovação automática** de certificados
- ✅ **Cache inteligente** para performance
- ✅ **Compressão gzip** habilitada
- ✅ **Headers de segurança** configurados

**URL Final:** `https://seu-dominio.com`

## 📱 Interface Responsiva

O sistema é totalmente responsivo e funciona perfeitamente em:
- 💻 Desktop
- 📱 Tablet
- 📲 Smartphone

## 📱 Progressive Web App (PWA)

O CAMINHO CERTO é um **Progressive Web App** completo que pode ser instalado em qualquer dispositivo como um aplicativo nativo.

### ✨ Recursos PWA
- 🚀 **Instalação nativa** - Funciona como app instalado
- 📱 **Ícone na tela inicial** - Acesso direto sem navegador
- ⚡ **Cache inteligente** - Funciona offline para recursos estáticos
- 🔄 **Atualizações automáticas** - Notificação quando há nova versão
- 🎨 **Interface nativa** - Sem barras do navegador
- 📊 **Cache de API** - Dados do Supabase em cache para melhor performance

### 📲 Como Instalar

#### 🖥️ Desktop (Chrome/Edge)
1. Abra o aplicativo no navegador
2. Clique no ícone ➕ na barra de endereço
3. Selecione "Instalar CAMINHO CERTO"
4. O app abrirá em janela própria

#### 📱 Android (Chrome)
1. Acesse o site no Chrome
2. Toque no menu (⋮) → "Adicionar à tela inicial"
3. Confirme "Adicionar"
4. O ícone aparecerá na tela inicial

#### 🍎 iPhone/iPad (Safari)
1. Abra o site no Safari
2. Toque no botão de compartilhar 📤
3. Selecione "Adicionar à Tela de Início"
4. Confirme "Adicionar"

### 🔧 Configuração PWA
- **Service Worker** com Workbox para cache inteligente
- **Manifest.json** configurado com ícones e tema
- **Cache de API** com estratégia NetworkFirst para Supabase
- **Suporte offline** para assets estáticos
- **Meta tags** otimizadas para iOS e Android

## 📱 Aplicativo Mobile Nativo

Além do PWA, o projeto suporta compilação para **aplicativos móveis nativos** usando Capacitor.

### 🚀 Recursos Mobile
- 📷 **Scanner de código de barras** nativo usando MLKit
- 📱 **Interface otimizada** para dispositivos móveis
- ⚡ **Performance nativa** com acesso às APIs do dispositivo
- 🔄 **Sincronização automática** com o backend Supabase
- 📊 **Funcionalidades offline** para operações críticas

### 🛠️ Desenvolvimento Mobile

#### Pré-requisitos
- **Android Studio** (para Android)
- **Xcode** (para iOS - apenas no Mac)
- **Node.js 18+** e npm

#### Configuração Inicial
```bash
# 1. Instalar dependências
npm install

# 2. Adicionar plataformas
npx cap add android    # Para Android
npx cap add ios        # Para iOS (requer Mac)

# 3. Atualizar dependências nativas
npx cap update android
npx cap update ios
```

#### Build e Deploy
```bash
# 1. Build do projeto web
npm run build

# 2. Sincronizar com plataformas nativas
npx cap sync

# 3. Executar no dispositivo/emulador
npx cap run android    # Android
npx cap run ios        # iOS
```

### 📷 Scanner de Código de Barras
O aplicativo mobile inclui scanner nativo de código de barras:
- **MLKit** do Google para reconhecimento preciso
- **Suporte a múltiplos formatos** (EAN, UPC, Code128, etc.)
- **Interface intuitiva** com preview da câmera
- **Integração direta** com o sistema de produtos
- **Feedback visual** e sonoro para leituras bem-sucedidas

### 📦 Distribuição
- **Google Play Store** (Android)
- **Apple App Store** (iOS)
- **Instalação direta** via APK (Android)
- **TestFlight** para testes beta (iOS)

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

- ⚡ **Vite 5.4** para builds ultrarrápidos
- ⚡ **Code splitting automático** com lazy loading
- ⚡ **Lazy loading de componentes** para carregamento otimizado
- ⚡ **Cache inteligente** com TanStack Query
- ⚡ **Service Worker** com cache de assets e API
- ⚡ **Otimização de bundle** com tree-shaking
- ⚡ **Assets otimizados** (imagens, ícones, fontes)
- ⚡ **PWA** com cache offline para melhor UX
- ⚡ **Compressão gzip/brotli** em produção

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
- 💡 INOVAPRO TECHNOLOGY

---

**🏪 CAMINHO CERTO - Sistema de Gestão Completo**  
*Sistema moderno e completo para postos de combustível e lojas de conveniência*

**Tecnologias:** React 18.3 • TypeScript 5.8 • Vite 5.4 • Supabase 2.76 • Tailwind CSS 3.4  
**Recursos:** PWA • Mobile App • Scanner Nativo • Cache Offline • Interface Responsiva

Desenvolvido com ❤️ em 2025 | Powered by INOVAPRO TECHNOLOGY
