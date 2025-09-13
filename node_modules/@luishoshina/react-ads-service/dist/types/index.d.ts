export { default as AdService } from './lib/AdService';
export { AdProvider, useAd } from './components/AdProvider';
export { default as AdSlot } from './components/AdSlot';
export { useAdService } from './hooks/useAdService';
export { BidderPresets } from './utils/bidders';
export type { AdConfig, AdSlot as AdSlotType, AdUnit, PrebidBidder } from './types/ads';
export declare const VERSION = "1.0.0";
