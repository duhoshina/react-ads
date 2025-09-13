# react-ads-sdk

[![NPM Version](https://img.shields.io/npm/v/@luishoshina/react-ads-service)](https://www.npmjs.com/package/@luishoshina/react-ads-service)
[![License](https://img.shields.io/npm/l/@luishoshina/react-ads-service)](https://github.com/luishoshina/react-ads-service/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@luishoshina/react-ads-service)](https://bundlephobia.com/package/@luishoshina/react-ads-service)

## Funcionalidades

- 🎯 **Plug-and-play** - Configure em menos de 5 minutos
- ⚡ **Lazy Loading** automático com Intersection Observer
- 🔄 **Auto-refresh** de anúncios configurável
- 🎨 **TypeScript** com tipagem completa
- 📱 **Mobile-first** e responsivo
- 🛡️ **Memory management** automático
- 🔧 **Bidders pré-configurados** (Amazon, Rubicon, AppNexus, etc.)

## 📦 Instalação

```bash
npm install react-ads-sdk
# ou
yarn add react-ads-sdk
```

## 🚀 Setup (2 passos)

### 1. Configure o Provider

**Next.js (`pages/_app.tsx`):**
```tsx
import { AdProvider } from 'react-ads-sdk';

export default function MyApp({ Component, pageProps }) {
  return (
    <AdProvider config={{
      publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // Seu Google Ad Manager ID
      prebidTimeout: 2000,
      enableLazyLoad: true,
      testMode: process.env.NODE_ENV === 'development'
    }}>
      <Component {...pageProps} />
    </AdProvider>
  );
}
```

**React (`src/App.tsx`):**
```tsx
import { AdProvider } from 'react-ads-sdk';

function App() {
  return (
    <AdProvider config={{
      publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
      prebidTimeout: 2000,
      enableLazyLoad: true
    }}>
      <div className="App">
        {/* Sua aplicação */}
      </div>
    </AdProvider>
  );
}
```

### 2. Adicione anúncios nos componentes

```tsx
import { AdSlot } from 'react-ads-sdk';

export default function HomePage() {
  const bannerSlot = {
    id: 'banner-top',
    path: '/1234567/homepage/banner', // Seu ad unit path
    sizes: [[728, 90], [970, 250]]    // Tamanhos do anúncio
  };

  return (
    <div>
      <h1>Minha Página</h1>
      <AdSlot slot={bannerSlot} lazyLoad />
    </div>
  );
}
```

## 💰 Com Prebid (máxima receita)

```tsx
import { AdSlot, BidderPresets } from 'react-ads-sdk';

export default function HomePage() {
  const bannerSlot = {
    id: 'banner-prebid',
    path: '/1234567/homepage/banner',
    sizes: [[728, 90], [970, 250]],
    targeting: { section: 'homepage' }
  };

  const bidders = [
    BidderPresets.rubicon({
      accountId: '12345',
      siteId: '67890',
      zoneId: '54321'
    }),
    BidderPresets.appnexus({
      placementId: '13144370'
    }),
    BidderPresets.amazon({
      slotID: 'homepage-banner'
    })
  ];

  return (
    <AdSlot
      slot={bannerSlot}
      bidders={bidders}
      lazyLoad
      refreshInterval={60000} // Auto-refresh a cada 60s
    />
  );
}
```

## 📐 Tamanhos de Anúncios Populares

```tsx
// Desktop
const desktopBanner = {
  sizes: [
    [728, 90],   // Leaderboard
    [970, 250],  // Billboard  
    [300, 250],  // Medium Rectangle
    [336, 280]   // Large Rectangle
  ]
};

// Mobile
const mobileBanner = {
  sizes: [
    [320, 50],   // Mobile Banner
    [320, 100],  // Large Mobile Banner
    [300, 250]   // Mobile Rectangle
  ]
};
```

## 🎯 Bidders Suportados

```tsx
import { BidderPresets } from 'react-ads-sdk';

// Amazon A9
BidderPresets.amazon({ slotID: 'banner-1' })

// Rubicon Project  
BidderPresets.rubicon({ accountId: '123', siteId: '456', zoneId: '789' })

// AppNexus
BidderPresets.appnexus({ placementId: '12345' })

// Index Exchange
BidderPresets.ix({ siteId: 'site-123', size: [728, 90] })

// OpenX
BidderPresets.openx({ unit: 'unit-123', delDomain: 'domain.openx.net' })

// PubMatic
BidderPresets.pubmatic({ publisherId: 'pub-123', adSlot: 'slot-name' })
```

## ⚙️ Configuração Avançada

```tsx
const advancedConfig = {
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // OBRIGATÓRIO
  prebidTimeout: 2000,                    // Timeout do leilão Prebid
  enableLazyLoad: true,                   // Lazy loading automático
  refreshInterval: 60000,                 // Auto-refresh global (mín. 30s)
  testMode: false                         // Debug mode (só dev!)
};
```

## 🔧 API Completa

### AdSlot Props

```tsx
interface AdSlotProps {
  slot: AdSlotType;              // Configuração do slot (obrigatório)
  bidders?: PrebidBidder[];      // Array de bidders Prebid
  lazyLoad?: boolean;            // Lazy loading (padrão: false)
  refreshInterval?: number;      // Auto-refresh em ms (mín. 30000)
  className?: string;            // CSS class
  style?: React.CSSProperties;   // Inline styles
  onLoad?: () => void;           // Callback quando carrega
  onError?: (error: Error) => void; // Callback de erro
}
```

### Controle Manual

```tsx
import { useAd } from 'react-ads-sdk';

function CustomComponent() {
  const { adService } = useAd();

  const refreshAd = () => {
    adService?.refreshAd('banner-id');
  };

  const setTargeting = () => {
    adService?.setTargeting('category', 'tech');
  };

  return (
    <div>
      <button onClick={refreshAd}>Refresh Anúncio</button>
      <button onClick={setTargeting}>Set Targeting</button>
    </div>
  );
}
```

## 🚨 Configurações Importantes

### ✅ Faça
- **Sempre use** o `AdProvider` no ponto de entrada (`_app.tsx`)
- **Configure Publisher ID** válido no Google Ad Manager
- **Use tamanhos padrão IAB** para melhor compatibilidade
- **Ative lazy loading** para anúncios abaixo da dobra
- **Defina refresh mínimo** de 30 segundos

### ❌ Evite
- **Não deixe** `testMode: true` em produção
- **Não use refresh** menor que 30 segundos
- **Não inicialize** o serviço em múltiplos lugares
- **Não ignore** tratamento de erros

## 🔍 Troubleshooting

### Anúncios não aparecem?

1. **Verifique o Publisher ID** - Deve estar no formato `ca-pub-XXXXXXXXXXXXXXXX`
2. **Confirme o ad unit path** - Formato: `/network-id/ad-unit-name`
3. **Teste sem lazy loading** primeiro
4. **Abra o console** para verificar erros

### CSP Issues?

Adicione ao `next.config.js`:
```javascript
async headers() {
  return [{
    source: '/(.*)',
    headers: [{
      key: 'Content-Security-Policy',
      value: "script-src 'self' 'unsafe-inline' *.doubleclick.net *.googlesyndication.com *.amazon-adsystem.com"
    }]
  }]
}
```

## 📊 Exemplo Completo

```tsx
// pages/_app.tsx
import { AdProvider } from 'react-ads';

export default function MyApp({ Component, pageProps }) {
  return (
    <AdProvider config={{
      publisherId: 'ca-pub-1234567890123456',
      prebidTimeout: 2000,
      enableLazyLoad: true,
      testMode: false
    }}>
      <Component {...pageProps} />
    </AdProvider>
  );
}

// components/HomePage.tsx
import { AdSlot, BidderPresets } from 'react-ads';

export default function HomePage() {
  const headerBanner = {
    id: 'header-banner',
    path: '/1234567/homepage/header',
    sizes: [[728, 90], [970, 250]],
    targeting: { section: 'home', category: 'tech' }
  };

  const sidebarBanner = {
    id: 'sidebar-banner', 
    path: '/1234567/homepage/sidebar',
    sizes: [[300, 250], [336, 280]]
  };

  const bidders = [
    BidderPresets.rubicon({
      accountId: '12345',
      siteId: '67890',
      zoneId: '54321'
    }),
    BidderPresets.amazon({
      slotID: 'homepage'
    })
  ];

  return (
    <div>
      <header>
        <AdSlot 
          slot={headerBanner} 
          bidders={bidders}
          onLoad={() => console.log('Header banner loaded')}
        />
      </header>
      
      <main>
        <h1>Conteúdo Principal</h1>
      </main>
      
      <aside>
        <AdSlot 
          slot={sidebarBanner} 
          bidders={bidders}
          lazyLoad
          refreshInterval={90000}
        />
      </aside>
    </div>
  );
}
```

## 📝 TypeScript

Totalmente tipado com TypeScript:

```tsx
import type { AdConfig, AdSlotType, PrebidBidder } from 'react-ads';

const config: AdConfig = {
  publisherId: 'ca-pub-1234567890123456',
  prebidTimeout: 2000,
  enableLazyLoad: true
};

const slot: AdSlotType = {
  id: 'my-banner',
  path: '/1234567/homepage/banner', 
  sizes: [[728, 90]]
};
```

## 🔗 Links Úteis

- 📚 [Google Ad Manager](https://admanager.google.com/)
- 🎯 [Prebid.js Docs](https://docs.prebid.org/)
- 📐 [IAB Ad Sizes](https://www.iab.com/guidelines/iab-display-advertising-guidelines/)
- 🐛 [Issues](https://github.com/luishoshina/react-ads-service/issues)

## 📄 Licença

MIT © [Luis Hoshina](https://github.com/luishoshina)

---

**⚡ Comece a monetizar sua aplicação React/Next.js em minutos!**

*Se este pacote te ajudou, considere dar uma ⭐ no [repositório](https://github.com/luishoshina/react-ads-service)!*