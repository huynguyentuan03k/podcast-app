import { useCallback, useEffect, useState } from 'react';

const BRAND_ASSETS_EVENT = 'brand-assets-change';
const BRAND_LOGO_KEY = 'brand.logo';
const BRAND_FAVICON_KEY = 'brand.favicon';
const AUTH_IMAGE_KEY = 'auth.image';
const AUTH_IMAGE_POSITION_KEY = 'auth.imagePosition';

type BrandAssetKey = 'logo' | 'favicon' | 'authImage';
export type AuthImagePosition = 'left' | 'right';

const storageKeys: Record<BrandAssetKey, string> = {
    logo: BRAND_LOGO_KEY,
    favicon: BRAND_FAVICON_KEY,
    authImage: AUTH_IMAGE_KEY,
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
    const [authImage, setAuthImage] = useState<string | null>(() => readAsset('authImage'));
    const [authImagePosition, setAuthImagePositionState] = useState<AuthImagePosition>(() => {
        if (typeof window === 'undefined') {
            return 'left';
        }

        return window.localStorage.getItem(AUTH_IMAGE_POSITION_KEY) === 'right' ? 'right' : 'left';
    });

    useEffect(() => {
        const syncAssets = () => {
            setLogo(readAsset('logo'));
            const nextFavicon = readAsset('favicon');
            setFavicon(nextFavicon);
            setAuthImage(readAsset('authImage'));
            setAuthImagePositionState(window.localStorage.getItem(AUTH_IMAGE_POSITION_KEY) === 'right' ? 'right' : 'left');
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

    const setAuthImagePosition = useCallback((value: AuthImagePosition) => {
        window.localStorage.setItem(AUTH_IMAGE_POSITION_KEY, value);
        setAuthImagePositionState(value);
        window.dispatchEvent(new Event(BRAND_ASSETS_EVENT));
    }, []);

    return { logo, favicon, authImage, authImagePosition, setAsset, setAuthImagePosition };
}
