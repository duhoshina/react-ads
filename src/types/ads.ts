export interface AdUnit {
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

export interface AdSlot {
  id: string;
  path: string;
  sizes: number[][];
  targeting?: Record<string, string | string[]>;
}

export interface AdConfig {
  publisherId: string;
  prebidTimeout: number;
  enableLazyLoad: boolean;
  refreshInterval?: number;
  testMode?: boolean;
}

export interface PrebidBidder {
  bidder: string;
  params: Record<string, any>;
}
