# 🔧 Troubleshooting - POSTO RODOIL

Este documento contém informações sobre problemas conhecidos e suas soluções, além de scripts de debug úteis para manutenção do sistema.

## 🚨 Problemas Conhecidos e Soluções

### 1. Erro "new row violates row-level security policy"

**Problema:** Erro ao tentar inserir registros de desperdício ou movimentações de estoque.

**Causa:** Políticas RLS (Row Level Security) muito restritivas no Supabase.

**Solução:** Execute o script `fix_remote_rls_simple.mjs` para diagnosticar e corrigir as políticas RLS.

```bash
node fix_remote_rls_simple.mjs
```

### 2. Discrepância entre Ambiente Local e Remoto

**Problema:** Funcionalidades funcionam localmente mas falham em produção.

**Causa:** Diferenças nas configurações de RLS entre Supabase local e remoto.

**Solução:** 
1. Teste primeiro no ambiente local com `debug_user_auth_complete.mjs`
2. Teste no ambiente remoto com `test_remote_supabase.mjs`
3. Aplique correções com `fix_remote_rls_simple.mjs`

## 🛠️ Scripts de Debug Disponíveis

### Autenticação e Usuários

#### `debug_login.mjs`
Testa o processo de login com diferentes tipos de usuários.
```bash
node debug_login.mjs
```

#### `debug_user_auth.mjs`
Verifica autenticação específica de um usuário por CPF.
```bash
node debug_user_auth.mjs
```

#### `debug_user_auth_complete.mjs`
Teste completo de autenticação, criação de produtos e inserção de registros.
```bash
node debug_user_auth_complete.mjs
```

#### `debug_frontend_auth.mjs`
Simula o processo de autenticação do frontend.
```bash
node debug_frontend_auth.mjs
```

### Testes de Conectividade

#### `test_remote_supabase.mjs`
Testa conectividade e operações no Supabase remoto.
```bash
node test_remote_supabase.mjs
```

#### `test_user_cpf.mjs`
Verifica usuários específicos por CPF.
```bash
node test_user_cpf.mjs
```

### Correção de Problemas

#### `fix_remote_rls_simple.mjs`
Diagnostica e corrige políticas RLS no Supabase remoto.
```bash
node fix_remote_rls_simple.mjs
```

### Criação de Usuários

#### `create_admin_supabase.mjs`
Cria usuários administradores no Supabase.
```bash
node create_admin_supabase.mjs
```

#### `create_employee_supabase.mjs`
Cria usuários funcionários no Supabase.
```bash
node create_employee_supabase.mjs
```

### Importação de Dados

#### `import_produtos.mjs`
Importa produtos em massa para o sistema.
```bash
node import_produtos.mjs
```

#### `verify_import.mjs`
Verifica a integridade dos dados importados.
```bash
node verify_import.mjs
```

## 🔍 Diagnóstico Passo a Passo

### Para Problemas de Autenticação:

1. **Verificar usuário existe:**
   ```bash
   node test_user_cpf.mjs
   ```

2. **Testar login:**
   ```bash
   node debug_login.mjs
   ```

3. **Testar autenticação completa:**
   ```bash
   node debug_user_auth_complete.mjs
   ```

### Para Problemas de RLS:

1. **Testar ambiente local:**
   ```bash
   node debug_user_auth_complete.mjs
   ```

2. **Testar ambiente remoto:**
   ```bash
   node test_remote_supabase.mjs
   ```

3. **Corrigir políticas RLS:**
   ```bash
   node fix_remote_rls_simple.mjs
   ```

## 📋 Checklist de Verificação

### Antes de Reportar um Bug:

- [ ] Verificar se o problema ocorre em ambiente local
- [ ] Verificar se o problema ocorre em ambiente remoto
- [ ] Executar scripts de debug relevantes
- [ ] Verificar logs do console do navegador
- [ ] Verificar logs do Supabase

### Informações Necessárias para Debug:

- Tipo de usuário (admin/funcionário)
- CPF do usuário (se funcionário)
- Ação que estava sendo executada
- Mensagem de erro completa
- Ambiente (local/remoto)
- Navegador utilizado

## 🚀 Ambiente de Desenvolvimento

### Configuração Local:
```bash
# Instalar dependências
npm install

# Iniciar Supabase local
npx supabase start

# Iniciar servidor de desenvolvimento
npm run dev
```

### Configuração Remota:
- Verificar variáveis de ambiente no `.env`
- Confirmar URLs do Supabase
- Verificar chaves de API

## 📞 Suporte

Para problemas não cobertos neste guia:

1. Execute os scripts de debug relevantes
2. Colete logs e mensagens de erro
3. Documente os passos para reproduzir o problema
4. Verifique se o problema persiste após reiniciar o servidor

---

*Última atualização: Janeiro 2025*