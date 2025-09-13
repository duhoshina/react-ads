export const BidderPresets = {
  // Amazon A9/TAM
  amazon: (params: { slotID: string; placementId?: string }) => ({
    bidder: 'amazon',
    params
  }),

  // Google Ad Exchange
  rubicon: (params: { accountId: string; siteId: string; zoneId: string }) => ({
    bidder: 'rubicon',
    params
  }),

  // AppNexus
  appnexus: (params: { placementId: string; member?: string }) => ({
    bidder: 'appnexus',
    params
  }),

  // Index Exchange
  ix: (params: { siteId: string; size: number[] }) => ({
    bidder: 'ix',
    params
  }),

  // OpenX
  openx: (params: { unit: string; delDomain: string }) => ({
    bidder: 'openx',
    params
  }),

  // PubMatic
  pubmatic: (params: { publisherId: string; adSlot: string }) => ({
    bidder: 'pubmatic',
    params
  })
};