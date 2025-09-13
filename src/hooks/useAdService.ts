import { useEffect, useRef } from 'react';
import AdService from '../lib/AdService';
import type { AdConfig } from '../types/ads';

export const useAdService = (config: AdConfig) => {
  const adServiceRef = useRef<AdService>();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      adServiceRef.current = AdService.getInstance();
      
      adServiceRef.current.initialize(config).catch(error => {
        console.error('Erro ao inicializar AdService:', error);
      });
      
      isInitializedRef.current = true;
    }
  }, [config]);

  return adServiceRef.current;
};