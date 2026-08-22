import { LiveBannerSettings } from '../types';

const readPayload = (json: any): LiveBannerSettings => {
    const first = json?.data && !Array.isArray(json.data) ? json.data : json;
    const payload = first?.data && !Array.isArray(first.data) ? first.data : first;
    const banners = payload?.banners || payload?.banner_urls || payload?.images || [];
    return {
        youtube_live_url: payload?.youtube_live_url || '',
        facebook_live_url: payload?.facebook_live_url || '',
        banners: (Array.isArray(banners) ? banners : [banners]).filter(Boolean).map((banner: any) => typeof banner === 'string' ? banner : banner.image_url || banner.url || banner.path)
    };
};

export const getPublicLiveBanners = async (gameId: string): Promise<LiveBannerSettings> => {
    const response = await fetch(`http://127.0.0.1:8000/user/games/${gameId}/live-banners`);
    const json = await response.json();
    if (!response.ok || json?.success === false) throw new Error(json?.message || 'Failed to fetch live banners.');
    return readPayload(json);
};