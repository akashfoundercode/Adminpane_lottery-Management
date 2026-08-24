import { StaticBanner } from '../types';
import { apiUrl } from '../config/api';

const resolveImageUrl = (value: unknown) => {
    if (!value) return '';
    const image = String(value);
    if (/^https?:\/\//i.test(image) || image.startsWith('data:')) return image;
    return apiUrl(image.startsWith('/') ? image : `/${image}`);
};

const toList = (json: any): StaticBanner[] => {
    const payload = json?.data && !Array.isArray(json.data) ? json.data : json;
    const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return items.map((item: any) => ({
        id: item.id ?? item.banner_id,
        image: resolveImageUrl(item.image_url || item.image || item.banner_url || item.url || item.path),
        title: item.title || item.name || '',
        link: item.link || item.redirect_url || '',
        status: item.status || 'active'
    })).filter((item: StaticBanner) => Boolean(item.image));
};

export const getPublicStaticBanners = async (): Promise<StaticBanner[]> => {
    const paths = ['/user/static-banners', '/api/v1/static-banners'];
    let response = await fetch(apiUrl(paths[0]));
    if (response.status === 404 || response.status === 405) response = await fetch(apiUrl(paths[1]));
    const json = await response.json();
    if (!response.ok || json?.success === false) throw new Error(json?.message || 'Failed to fetch static banners.');
    return toList(json);
};