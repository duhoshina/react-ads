'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');

class AdService {
    constructor() {
        this.isInitialized = false;
        this.config = null;
        this.adSlots = new Map();
        this.observers = new Map();
    }
    static getInstance() {
        if (!AdService.instance) {
            AdService.instance = new AdService();
        }
        return AdService.instance;
    }
    async initialize(config) {
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
        }
        catch (error) {
            console.error('Erro ao inicializar AdService:', error);
            throw error;
        }
    }
    loadGoogleTag() {
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
    loadPrebid() {
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
    setupGoogleTag() {
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
    setupPrebid() {
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
    defineAdSlot(slot, bidders = []) {
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
            const adUnit = {
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
    displayAd(slotId, lazyLoad = false) {
        if (!this.isInitialized) {
            throw new Error('AdService não foi inicializado');
        }
        if (lazyLoad && this.config?.enableLazyLoad) {
            this.setupLazyLoading(slotId);
        }
        else {
            this.requestAndDisplayAd(slotId);
        }
    }
    setupLazyLoading(slotId) {
        const element = document.getElementById(slotId);
        if (!element)
            return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.requestAndDisplayAd(slotId);
                    observer.disconnect();
                    this.observers.delete(slotId);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(element);
        this.observers.set(slotId, observer);
    }
    requestAndDisplayAd(slotId) {
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
    refreshAd(slotId) {
        const slot = this.adSlots.get(slotId);
        if (!slot)
            return;
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
    destroyAd(slotId) {
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
    setTargeting(key, value) {
        window.googletag.cmd.push(() => {
            window.googletag.pubads().setTargeting(key, value);
        });
    }
    clearTargeting(key) {
        window.googletag.cmd.push(() => {
            if (key) {
                window.googletag.pubads().clearTargeting(key);
            }
            else {
                window.googletag.pubads().clearTargeting();
            }
        });
    }
    // Método para debugging
    getSlotInfo(slotId) {
        return {
            slot: this.adSlots.get(slotId),
            hasObserver: this.observers.has(slotId),
            isInitialized: this.isInitialized
        };
    }
}

const AdContext = React.createContext({
    adService: null,
    isReady: false
});
const AdProvider = ({ config, children }) => {
    const [isReady, setIsReady] = React.useState(false);
    const [adService] = React.useState(() => AdService.getInstance());
    React.useEffect(() => {
        adService.initialize(config)
            .then(() => {
            setIsReady(true);
            // Disponibilizar globalmente para os componentes
            window.adService = adService;
        })
            .catch(error => {
            console.error('Erro ao inicializar AdService:', error);
        });
    }, [adService, config]);
    return (jsxRuntime.jsx(AdContext.Provider, { value: { adService, isReady }, children: children }));
};
const useAd = () => {
    const context = React.useContext(AdContext);
    if (!context) {
        throw new Error('useAd deve ser usado dentro de um AdProvider');
    }
    return context;
};

const AdSlot = ({ slot, bidders = [], lazyLoad = false, refreshInterval, className, style, onLoad, onError }) => {
    const adServiceRef = React.useRef();
    const refreshIntervalRef = React.useRef();
    React.useEffect(() => {
        // Aguarda a instância do AdService estar disponível
        const checkAdService = () => {
            try {
                const adService = window.adService;
                if (adService) {
                    adServiceRef.current = adService;
                    initializeAd();
                }
                else {
                    setTimeout(checkAdService, 100);
                }
            }
            catch (error) {
                onError?.(error);
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
            }
            catch (error) {
                onError?.(error);
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
    return (jsxRuntime.jsx("div", { id: slot.id, className: className, style: {
            minHeight: slot.sizes[0] ? `${slot.sizes[0][1]}px` : '250px',
            minWidth: slot.sizes[0] ? `${slot.sizes[0][0]}px` : '300px',
            ...style
        } }));
};

const useAdService = (config) => {
    const adServiceRef = React.useRef();
    const isInitializedRef = React.useRef(false);
    React.useEffect(() => {
        if (!isInitializedRef.current) {
            adServiceRef.current = AdService.getInstance();
            adServiceRef.current.initialize(config).catch(error => {
                console.error('Erro ao inicializar AdService:', error);
            });
            isInitializedRef.current = true;
        }
    }, [config]);
    return adServiceRef.current;
};

const BidderPresets = {
    // Amazon A9/TAM
    amazon: (params) => ({
        bidder: 'amazon',
        params
    }),
    // Google Ad Exchange
    rubicon: (params) => ({
        bidder: 'rubicon',
        params
    }),
    // AppNexus
    appnexus: (params) => ({
        bidder: 'appnexus',
        params
    }),
    // Index Exchange
    ix: (params) => ({
        bidder: 'ix',
        params
    }),
    // OpenX
    openx: (params) => ({
        bidder: 'openx',
        params
    }),
    // PubMatic
    pubmatic: (params) => ({
        bidder: 'pubmatic',
        params
    })
};

// Exportar tudo que o usuário vai precisar
// Versão da lib
const VERSION = '1.0.0';

exports.AdProvider = AdProvider;
exports.AdService = AdService;
exports.AdSlot = AdSlot;
exports.BidderPresets = BidderPresets;
exports.VERSION = VERSION;
exports.useAd = useAd;
exports.useAdService = useAdService;
//# sourceMappingURL=index.js.map
