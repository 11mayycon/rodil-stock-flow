# Configuração do App Mobile com Scanner de Código de Barras

Este projeto agora suporta funcionalidades nativas de dispositivos móveis, incluindo scanner de código de barras usando a câmera.

## 🚀 Como testar no seu dispositivo

### 1. Exportar para GitHub
1. Clique no botão "Export to Github" no Lovable
2. Faça `git pull` do seu repositório

### 2. Instalar Dependências
```bash
npm install
```

### 3. Adicionar Plataformas
Para Android:
```bash
npx cap add android
```

Para iOS (requer Mac com Xcode):
```bash
npx cap add ios
```

### 4. Atualizar Dependências Nativas
```bash
npx cap update android
# ou
npx cap update ios
```

### 5. Build do Projeto
```bash
npm run build
```

### 6. Sincronizar com Plataformas Nativas
```bash
npx cap sync
```

### 7. Executar no Dispositivo/Emulador

Para Android:
```bash
npx cap run android
```

Para iOS (requer Mac com Xcode):
```bash
npx cap run ios
```

## 📱 Funcionalidades Mobile

### Scanner de Código de Barras
- Na tela de **Produtos**, ao criar ou editar um produto
- Clique no ícone de câmera ao lado do campo "Código de Barras"
- A câmera traseira será aberta automaticamente
- Aponte para o código de barras
- O código será preenchido automaticamente após o scan

### Permissões Necessárias

#### Android
O app solicitará automaticamente permissão para usar a câmera.

#### iOS
O app solicitará automaticamente permissão para usar a câmera. Certifique-se de que as seguintes permissões estão no `Info.plist`:
- `NSCameraUsageDescription`: "Usamos a câmera para escanear códigos de barras dos produtos"

## 🔧 Desenvolvimento

Após fazer alterações no código:
1. `git pull` do repositório
2. `npm install` (se houver novas dependências)
3. `npm run build`
4. `npx cap sync`
5. Execute o app novamente

## 📖 Mais Informações

Para mais detalhes sobre desenvolvimento mobile com Capacitor, leia nosso guia completo:
https://lovable.dev/blogs/capacitor-mobile-development

## ⚠️ Importante

- A funcionalidade de scanner só funciona em dispositivos reais ou emuladores com câmera
- No navegador web, o botão de câmera estará visível mas não funcionará
- Certifique-se de ter o Android Studio (para Android) ou Xcode (para iOS) instalados
