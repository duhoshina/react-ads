export declare const BidderPresets: {
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
