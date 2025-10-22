# 📱 Guia de Instalação PWA - CAMINHO CERTO

## ✅ O que foi implementado

- ✅ Manifest.json configurado com nome, ícones e tema
- ✅ Service Worker com cache inteligente (Workbox)
- ✅ Suporte offline para assets estáticos
- ✅ Cache de API do Supabase com estratégia NetworkFirst
- ✅ Meta tags para iOS e Android
- ✅ Notificação automática de atualizações
- ✅ Ícone personalizado da RodOil em todos os tamanhos

---

## 🖥️ Como testar no PC

### Chrome/Edge
1. Abra o aplicativo no navegador
2. Clique no ícone ➕ na barra de endereço (ou menu → "Instalar CAMINHO CERTO")
3. Confirme a instalação
4. O app abrirá em janela própria

### Testar modo offline
1. Abra DevTools (F12)
2. Vá para a aba "Application" → "Service Workers"
3. Marque "Offline"
4. Recarregue a página - o app deve continuar funcionando

---

## 📱 Como instalar no Android

### Chrome
1. Abra o site no Chrome Android
2. Toque no menu (⋮) → "Adicionar à tela inicial" ou "Instalar app"
3. Confirme "Adicionar"
4. O ícone da RodOil aparecerá na tela inicial
5. Abra o app - ele funcionará como aplicativo nativo

### Samsung Internet
1. Acesse o site
2. Toque no menu → "Adicionar página a"
3. Selecione "Tela inicial"

---

## 🍎 Como instalar no iPhone/iPad

### Safari
1. Abra o site no Safari
2. Toque no botão de **Compartilhar** (quadrado com seta para cima)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Confirme o nome e toque em **"Adicionar"**
5. O ícone da RodOil aparecerá na tela inicial
6. Abra o app - ele funcionará em tela cheia

**⚠️ Importante para iOS:**
- Use **apenas o Safari** (outros navegadores no iOS não suportam PWA completamente)
- O app funcionará em tela cheia sem barra de navegação
- Notificações de atualização podem demorar mais para aparecer

---

## 🧪 Funcionalidades Offline

### ✅ Funcionam Offline:
- Visualização de páginas já visitadas
- Assets (CSS, JS, imagens) em cache
- Navegação entre rotas carregadas

### ⚠️ Requerem Conexão:
- Login/autenticação
- Busca de novos produtos
- Sincronização com Supabase
- Upload de imagens de desperdício
- Finalização de vendas (PDV)

### 🔄 Sincronização Automática:
Quando a conexão retornar, o app:
- Recarrega dados do Supabase
- Sincroniza alterações pendentes
- Atualiza cache automaticamente

---

## 🔄 Atualizações Automáticas

Quando uma nova versão for publicada:
1. O service worker detecta automaticamente
2. Um toast aparece no canto da tela
3. Clique em "Atualizar" para aplicar
4. A página recarrega com a nova versão

---

## 🎨 Personalização

### Ícones usados:
- `public/rodoil-icon.png` - Logo principal (192x192 e 512x512)
- `public/apple-touch-icon.png` - Ícone específico para iOS

### Cores do tema:
- **Theme Color:** `#7C3AED` (Roxo principal)
- **Background:** `#ffffff` (Branco)

Para alterar as cores, edite:
```typescript
// vite.config.ts
manifest: {
  theme_color: '#7C3AED', // Cor da barra superior
  background_color: '#ffffff' // Cor de fundo do splash
}
```

---

## 🐛 Solução de Problemas

### O botão "Instalar" não aparece
- Certifique-se de estar usando HTTPS ou localhost
- Verifique se o service worker foi registrado (DevTools → Application)
- Tente limpar o cache do navegador

### App não funciona offline
- Abra o app pelo menos uma vez online para fazer o cache inicial
- Verifique se o service worker está ativo (DevTools → Application)

### Atualizações não aparecem
- Recarregue a página manualmente (Ctrl+Shift+R)
- Verifique a aba Service Workers no DevTools
- Tente "Unregister" e recarregue

### iOS não instala
- Use **apenas Safari** (Chrome/Firefox no iOS não suportam PWA)
- Certifique-se de estar usando o botão de compartilhar correto
- Verifique se as meta tags Apple estão no HTML

---

## 📊 Monitoramento

Para ver estatísticas do PWA:
1. DevTools → Application → Service Workers
2. Lighthouse (DevTools → Lighthouse) → Execute audit PWA
3. Chrome://serviceworker-internals (Chrome desktop)

---

## 🚀 Deploy e Publicação

Após fazer deploy do app:
1. Acesse pelo domínio final
2. Teste a instalação em todos os dispositivos
3. Verifique o score PWA no Lighthouse (meta: >90)
4. Compartilhe o link para instalação

---

## 📚 Recursos Adicionais

- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Workbox Docs](https://developer.chrome.com/docs/workbox/)
- [iOS PWA Support](https://developer.apple.com/documentation/webkit/adding_web_content_to_your_home_screen)

---

**🎉 Pronto! Seu sistema CAMINHO CERTO agora é um PWA completo e pode ser instalado em qualquer dispositivo moderno!**
