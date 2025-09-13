import React from 'react';
import AdService from '../lib/AdService';
import type { AdConfig } from '../types/ads';
import type { ReactNode } from 'react';
interface AdContextType {
    adService: AdService | null;
    isReady: boolean;
}
interface AdProviderProps {
    config: AdConfig;
    children: ReactNode;
}
export declare const AdProvider: React.FC<AdProviderProps>;
export declare const useAd: () => AdContextType;
export {};
