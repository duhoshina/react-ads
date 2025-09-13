import type { AdConfig, AdSlot, AdUnit, PrebidBidder } from "../types/ads";

declare global {
  interface Window {
    googletag: any;
    pbjs: any;
  }
}

class AdService {
  private static instance: AdService;
  private isInitialized = false;
  private config: AdConfig | null = null;
  private adSlots = new Map<string, any>();
  private observers = new Map<string, IntersectionObserver>();

  private constructor() {}

  static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  async initialize(config: AdConfig): Promise<void> {
    if (this.isInitialized) {
      console.warn('AdService já foi inicializado');
      return;
    }

    this.config = config;
    
    try {
      await Promise.all([
        this.loadGoogleTag(),
        this.loadPrebid()
      ]);
      
      this.setupGoogleTag();
      this.setupPrebid();
      this.isInitialized = true;
      
      console.log('AdService inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar AdService:', error);
      throw error;
    }
  }

  private loadGoogleTag(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.googletag) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar Google Tag'));
      document.head.appendChild(script);
    });
  }

  private loadPrebid(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.pbjs) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cdn.jsdelivr.net/npm/prebid.js@latest/dist/not-for-prod/prebid.js';
      script.onload = () => {
        window.pbjs = window.pbjs || {};
        window.pbjs.que = window.pbjs.que || [];
        resolve();
      };
      script.onerror = () => reject(new Error('Falha ao carregar Prebid'));
      document.head.appendChild(script);
    });
  }

  private setupGoogleTag(): void {
    window.googletag = window.googletag || { cmd: [] };
    
    window.googletag.cmd.push(() => {
      if (this.config?.enableLazyLoad) {
        window.googletag.pubads().enableLazyLoad({
          fetchMarginPercent: 500,
          renderMarginPercent: 200,
          mobileScaling: 2.0
        });
      }

      window.googletag.pubads().enableSingleRequest();
      window.googletag.pubads().collapseEmptyDivs();
      window.googletag.enableServices();
    });
  }

  private setupPrebid(): void {
    window.pbjs.que.push(() => {
      window.pbjs.setConfig({
        debug: this.config?.testMode || false,
        bidderTimeout: this.config?.prebidTimeout || 2000,
        enableSendAllBids: true,
        useBidCache: true,
        cache: {
          url: 'https://prebid.adnxs.com/pbc/v1/cache'
        }
      });
    });
  }

  defineAdSlot(slot: AdSlot, bidders: PrebidBidder[] = []): void {
    if (!this.isInitialized) {
      throw new Error('AdService não foi inicializado');
    }

    // Definir slot no Google Tag Manager
    window.googletag.cmd.push(() => {
      const adSlot = window.googletag
        .defineSlot(slot.path, slot.sizes, slot.id)
        ?.addService(window.googletag.pubads());

      if (slot.targeting) {
        Object.entries(slot.targeting).forEach(([key, value]) => {
          adSlot?.setTargeting(key, value);
        });
      }

      this.adSlots.set(slot.id, adSlot);
    });

    // Configurar Prebid se houver bidders
    if (bidders.length > 0) {
      const adUnit: AdUnit = {
        code: slot.id,
        mediaTypes: {
          banner: {
            sizes: slot.sizes
          }
        },
        bids: bidders
      };

      window.pbjs.que.push(() => {
        window.pbjs.addAdUnits([adUnit]);
      });
    }
  }

  displayAd(slotId: string, lazyLoad = false): void {
    if (!this.isInitialized) {
      throw new Error('AdService não foi inicializado');
    }

    if (lazyLoad && this.config?.enableLazyLoad) {
      this.setupLazyLoading(slotId);
    } else {
      this.requestAndDisplayAd(slotId);
    }
  }

  private setupLazyLoading(slotId: string): void {
    const element = document.getElementById(slotId);
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.requestAndDisplayAd(slotId);
            observer.disconnect();
            this.observers.delete(slotId);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    this.observers.set(slotId, observer);
  }

  private requestAndDisplayAd(slotId: string): void {
    window.pbjs.que.push(() => {
      window.pbjs.requestBids({
        adUnitCodes: [slotId],
        timeout: this.config?.prebidTimeout || 2000,
        bidsBackHandler: () => {
          window.googletag.cmd.push(() => {
            window.pbjs.setTargetingForGPTAsync([slotId]);
            window.googletag.display(slotId);
          });
        }
      });
    });
  }

  refreshAd(slotId: string): void {
    const slot = this.adSlots.get(slotId);
    if (!slot) return;

    window.pbjs.que.push(() => {
      window.pbjs.requestBids({
        adUnitCodes: [slotId],
        timeout: this.config?.prebidTimeout || 2000,
        bidsBackHandler: () => {
          window.googletag.cmd.push(() => {
            window.pbjs.setTargetingForGPTAsync([slotId]);
            window.googletag.pubads().refresh([slot]);
          });
        }
      });
    });
  }

  destroyAd(slotId: string): void {
    const observer = this.observers.get(slotId);
    if (observer) {
      observer.disconnect();
      this.observers.delete(slotId);
    }

    const slot = this.adSlots.get(slotId);
    if (slot) {
      window.googletag.cmd.push(() => {
        window.googletag.destroySlots([slot]);
      });
      this.adSlots.delete(slotId);
    }

    window.pbjs.que.push(() => {
      window.pbjs.removeAdUnit(slotId);
    });
  }

  setTargeting(key: string, value: string | string[]): void {
    window.googletag.cmd.push(() => {
      window.googletag.pubads().setTargeting(key, value);
    });
  }

  clearTargeting(key?: string): void {
    window.googletag.cmd.push(() => {
      if (key) {
        window.googletag.pubads().clearTargeting(key);
      } else {
        window.googletag.pubads().clearTargeting();
      }
    });
  }

  // Método para debugging
  getSlotInfo(slotId: string): any {
    return {
      slot: this.adSlots.get(slotId),
      hasObserver: this.observers.has(slotId),
      isInitialized: this.isInitialized
    };
  }
}

export default AdService;