import type { AdConfig, AdSlot, PrebidBidder } from "../types/ads";
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
    defineAdSlot(slot: AdSlot, bidders?: PrebidBidder[]): void;
    displayAd(slotId: string, lazyLoad?: boolean): void;
    private setupLazyLoading;
    private requestAndDisplayAd;
    refreshAd(slotId: string): void;
    destroyAd(slotId: string): void;
    setTargeting(key: string, value: string | string[]): void;
    clearTargeting(key?: string): void;
    getSlotInfo(slotId: string): any;
}
export default AdService;
