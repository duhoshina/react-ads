import React, { ReactNode } from 'react';

interface AdUnit {
    code: string;
    mediaTypes: {
        banner?: {
            sizes: number[][];
        };
        video?: {
            context: 'instream' | 'outstream';
            playerSize: number[][];
        };
    };
    bids: Array<{
        bidder: string;
        params: Record<string, any>;
    }>;
}
interface AdSlot$1 {
    id: string;
    path: string;
    sizes: number[][];
    targeting?: Record<string, string | string[]>;
}
interface AdConfig {
    publisherId: string;
    prebidTimeout: number;
    enableLazyLoad: boolean;
    refreshInterval?: number;
    testMode?: boolean;
}
interface PrebidBidder {
    bidder: string;
    params: Record<string, any>;
}

declare global {
    interface Window {
        googletag: any;
        pbjs: any;
    }
}
declare class AdService {
    private static instance;
    private isInitialized;
    private config;
    private adSlots;
    private observers;
    private constructor();
    static getInstance(): AdService;
    initialize(config: AdConfig): Promise<void>;
    private loadGoogleTag;
    private loadPrebid;
    private setupGoogleTag;
    private setupPrebid;
    defineAdSlot(slot: AdSlot$1, bidders?: PrebidBidder[]): void;
    displayAd(slotId: string, lazyLoad?: boolean): void;
    private setupLazyLoading;
    private requestAndDisplayAd;
    refreshAd(slotId: string): void;
    destroyAd(slotId: string): void;
    setTargeting(key: string, value: string | string[]): void;
    clearTargeting(key?: string): void;
    getSlotInfo(slotId: string): any;
}

interface AdContextType {
    adService: AdService | null;
    isReady: boolean;
}
interface AdProviderProps {
    config: AdConfig;
    children: ReactNode;
}
declare const AdProvider: React.FC<AdProviderProps>;
declare const useAd: () => AdContextType;

interface AdSlotProps {
    slot: AdSlot$1;
    bidders?: PrebidBidder[];
    lazyLoad?: boolean;
    refreshInterval?: number;
    className?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}
declare const AdSlot: React.FC<AdSlotProps>;

declare const useAdService: (config: AdConfig) => AdService | undefined;

declare const BidderPresets: {
    amazon: (params: {
        slotID: string;
        placementId?: string;
    }) => {
        bidder: string;
        params: {
            slotID: string;
            placementId?: string;
        };
    };
    rubicon: (params: {
        accountId: string;
        siteId: string;
        zoneId: string;
    }) => {
        bidder: string;
        params: {
            accountId: string;
            siteId: string;
            zoneId: string;
        };
    };
    appnexus: (params: {
        placementId: string;
        member?: string;
    }) => {
        bidder: string;
        params: {
            placementId: string;
            member?: string;
        };
    };
    ix: (params: {
        siteId: string;
        size: number[];
    }) => {
        bidder: string;
        params: {
            siteId: string;
            size: number[];
        };
    };
    openx: (params: {
        unit: string;
        delDomain: string;
    }) => {
        bidder: string;
        params: {
            unit: string;
            delDomain: string;
        };
    };
    pubmatic: (params: {
        publisherId: string;
        adSlot: string;
    }) => {
        bidder: string;
        params: {
            publisherId: string;
            adSlot: string;
        };
    };
};

declare const VERSION = "1.0.0";

export { AdConfig, AdProvider, AdService, AdSlot, AdSlot$1 as AdSlotType, AdUnit, BidderPresets, PrebidBidder, VERSION, useAd, useAdService };
