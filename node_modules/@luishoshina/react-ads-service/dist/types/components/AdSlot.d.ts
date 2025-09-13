import React from 'react';
import { AdSlotType, PrebidBidder } from '..';
interface AdSlotProps {
    slot: AdSlotType;
    bidders?: PrebidBidder[];
    lazyLoad?: boolean;
    refreshInterval?: number;
    className?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}
declare const AdSlot: React.FC<AdSlotProps>;
export default AdSlot;
