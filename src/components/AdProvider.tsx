import React, { createContext, useContext, useEffect } from 'react';
import AdService from '../lib/AdService';
import type { AdConfig } from '../types/ads';
import type { ReactNode } from 'react';

interface AdContextType {
  adService: AdService | null;
  isReady: boolean;
}

const AdContext = createContext<AdContextType>({
  adService: null,
  isReady: false
});

interface AdProviderProps {
  config: AdConfig;
  children: ReactNode;
}

export const AdProvider: React.FC<AdProviderProps> = ({ config, children }) => {
  const [isReady, setIsReady] = React.useState(false);
  const [adService] = React.useState(() => AdService.getInstance());

  useEffect(() => {
    adService.initialize(config)
      .then(() => {
        setIsReady(true);
        // Disponibilizar globalmente para os componentes
        (window as any).adService = adService;
      })
      .catch(error => {
        console.error('Erro ao inicializar AdService:', error);
      });
  }, [adService, config]);

  return (
    <AdContext.Provider value={{ adService, isReady }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAd deve ser usado dentro de um AdProvider');
  }
  return context;
};