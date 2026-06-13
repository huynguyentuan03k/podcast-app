import { useCallback, useEffect, useState } from 'react';

const BRAND_ASSETS_EVENT = 'brand-assets-change';
const BRAND_LOGO_KEY = 'brand.logo';
const BRAND_FAVICON_KEY = 'brand.favicon';

type BrandAssetKey = 'logo' | 'favicon';

const storageKeys: Record<BrandAssetKey, string> = {
    logo: BRAND_LOGO_KEY,
    favicon: BRAND_FAVICON_KEY,
};

function updateDocumentFavicon(value: string | null) {
    if (typeof document === 'undefined' || !value) {
        return;
    }

    document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((link) => {
        link.href = value;
    });
}

function readAsset(key: BrandAssetKey) {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.localStorage.getItem(storageKeys[key]);
}

export function useBrandAssets() {
    const [logo, setLogo] = useState<string | null>(() => readAsset('logo'));
    const [favicon, setFavicon] = useState<string | null>(() => readAsset('favicon'));

    useEffect(() => {
        const syncAssets = () => {
            setLogo(readAsset('logo'));
            const nextFavicon = readAsset('favicon');
            setFavicon(nextFavicon);
            updateDocumentFavicon(nextFavicon);
        };

        updateDocumentFavicon(readAsset('favicon'));

        window.addEventListener('storage', syncAssets);
        window.addEventListener(BRAND_ASSETS_EVENT, syncAssets);

        return () => {
            window.removeEventListener('storage', syncAssets);
            window.removeEventListener(BRAND_ASSETS_EVENT, syncAssets);
        };
    }, []);

    const setAsset = useCallback((key: BrandAssetKey, value: string) => {
        window.localStorage.setItem(storageKeys[key], value);
        if (key === 'favicon') {
            updateDocumentFavicon(value);
        }
        window.dispatchEvent(new Event(BRAND_ASSETS_EVENT));
    }, []);

    return { logo, favicon, setAsset };
}
