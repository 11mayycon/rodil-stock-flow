#!/bin/bash

# Script para configurar Git e enviar arquivos para GitHub
# Projeto: CAMINHO CERTO - Sistema de Gestão

echo "=== CONFIGURANDO GIT E ENVIANDO PARA GITHUB ==="

# Navegar para o diretório do projeto
cd /root/posto/posto

# Inicializar repositório Git se não existir
if [ ! -d ".git" ]; then
    echo "Inicializando repositório Git..."
    git init
    echo "Repositório Git inicializado!"
fi

# Configurar usuário Git (se necessário)
git config user.name "VPS Deploy" 2>/dev/null || git config user.name "VPS Deploy"
git config user.email "deploy@vps.local" 2>/dev/null || git config user.email "deploy@vps.local"

# Adicionar remote origin se não existir
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "Adicionando remote origin..."
    git remote add origin https://github.com/11mayycon/rodil-stock-flow.git
    echo "Remote origin adicionado!"
fi

# Fazer pull das mudanças remotas primeiro
echo "Fazendo pull das mudanças remotas..."
git pull origin main --allow-unrelated-histories || echo "Pull falhou, continuando..."

# Adicionar todos os arquivos
echo "Adicionando arquivos ao Git..."
git add .

# Verificar status
echo "Status do Git:"
git status

# Fazer commit
echo "Fazendo commit das mudanças..."
git commit -m "feat: Atualização completa do sistema - VPS Deploy

- Configurações de ambiente (.env) atualizadas
- Documentação de rede e integração Linx
- Scripts de teste e sincronização
- Configurações do Supabase
- Arquivos de migração e schema do banco
- Documentação técnica completa
- Scripts de debug e verificação
- Configurações do projeto (package.json, tsconfig, etc.)

Deploy realizado via VPS com todas as funcionalidades:
✅ Sistema de gestão completo
✅ Integração com Supabase
✅ Autenticação e segurança
✅ PDV e controle de estoque
✅ Relatórios e dashboards
✅ Sistema responsivo e PWA"

# Fazer push para o GitHub
echo "Enviando para o GitHub..."
git push -u origin main

echo "=== PROCESSO CONCLUÍDO ==="
echo "Arquivos enviados para: https://github.com/11mayycon/rodil-stock-flow"