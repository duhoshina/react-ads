import React, { useEffect, useRef } from 'react';
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

const AdSlot: React.FC<AdSlotProps> = ({
  slot,
  bidders = [],
  lazyLoad = false,
  refreshInterval,
  className,
  style,
  onLoad,
  onError
}) => {
  const adServiceRef = useRef<any>();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {

    const checkAdService = () => {
      try {
        const adService = (window as any).adService;
        if (adService) {
          adServiceRef.current = adService;
          initializeAd();
        } else {
          setTimeout(checkAdService, 100);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    };

    const initializeAd = () => {
      try {
        adServiceRef.current.defineAdSlot(slot, bidders);
        adServiceRef.current.displayAd(slot.id, lazyLoad);
        
        if (refreshInterval && refreshInterval > 0) {
          setupAutoRefresh();
        }
        
        onLoad?.();
      } catch (error) {
        onError?.(error as Error);
      }
    };

    const setupAutoRefresh = () => {
      if (refreshInterval && refreshInterval >= 30000) { // Mínimo 30 segundos
        refreshIntervalRef.current = setInterval(() => {
          if (adServiceRef.current) {
            adServiceRef.current.refreshAd(slot.id);
          }
        }, refreshInterval);
      }
    };

    checkAdService();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      if (adServiceRef.current) {
        adServiceRef.current.destroyAd(slot.id);
      }
    };
  }, [slot, bidders, lazyLoad, refreshInterval, onLoad, onError]);

  return (
    <div
      id={slot.id}
      className={className}
      style={{
        minHeight: slot.sizes[0] ? `${slot.sizes[0][1]}px` : '250px',
        minWidth: slot.sizes[0] ? `${slot.sizes[0][0]}px` : '300px',
        ...style
      }}
    />
  );
};

export default AdSlot;