import { apiGet, apiPost, ApiResult } from './api';

const CACHE_TTL_MS = 5 * 60 * 1000;
export const HOME_PRODUCT_LIMIT = 100;
export const PRODUCT_PAGE_SIZE = 30;

type CacheEntry<T> = {
  expiresAt: number;
  data?: T;
  promise?: Promise<T>;
};

type ProductPage = {
  items: any[];
  meta?: any;
};

type HomeCatalog = {
  brands: any[];
  products: any[];
};

const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string, loader: () => Promise<T>, force = false): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key);

  if (!force && existing) {
    if (existing.data && existing.expiresAt > now) {
      return Promise.resolve(existing.data as T);
    }
    if (existing.promise) {
      return existing.promise as Promise<T>;
    }
  }

  const promise = loader()
    .then((data) => {
      cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      return data;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, { promise, expiresAt: now + CACHE_TTL_MS });
  return promise;
}

function ensureOk<T>(result: ApiResult<T>): T {
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.data;
}

const endpointWithQuery = (endpoint: string, params: Record<string, string | number | boolean>) => {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${endpoint}?${query}`;
};

export function fetchBrands(force = false): Promise<any[]> {
  return getCached(
    'brands:all',
    async () => {
      const result = await apiGet<any[]>(endpointWithQuery('brand/all', { skip: 0, limit: 50 }));
      const data = ensureOk(result);
      return Array.isArray(data) ? data : [];
    },
    force,
  );
}

export function fetchHomeProducts(force = false): Promise<any[]> {
  return getCached(
    'products:home',
    async () => {
      const result = await apiGet<any[]>(
        endpointWithQuery('product/all', {
          skip: 0,
          limit: HOME_PRODUCT_LIMIT,
          includeMeta: true,
        }),
      );
      const data = ensureOk(result);
      return Array.isArray(data) ? data : [];
    },
    force,
  );
}

export function fetchHomeCatalog(force = false): Promise<HomeCatalog> {
  return getCached(
    'catalog:home',
    async () => {
      const [brands, products] = await Promise.all([
        fetchBrands(force),
        fetchHomeProducts(force),
      ]);

      return {
        brands,
        products,
      };
    },
    force,
  );
}

export function fetchBrandProductsPage(
  brandId: string,
  skip = 0,
  limit = PRODUCT_PAGE_SIZE,
  force = false,
): Promise<ProductPage> {
  return getCached(
    `products:brand:${brandId}:${skip}:${limit}`,
    async () => {
      const result = await apiPost<any[]>('product/filter', {
        brand: brandId,
        skip,
        limit,
        includeMeta: true,
      });
      if (!result.ok && result.status !== 404) {
        throw new Error(result.message);
      }
      return {
        items: result.ok && Array.isArray(result.data) ? result.data : [],
        meta: result.ok ? result.meta : undefined,
      };
    },
    force,
  );
}

export function fetchFilteredProductsPage(
  filter: any,
  skip = 0,
  limit = PRODUCT_PAGE_SIZE,
): Promise<ProductPage> {
  return apiPost<any[]>('product/filter', {
    ...filter,
    skip,
    limit,
    includeMeta: true,
  }).then((result) => {
    if (!result.ok && result.status !== 404) {
      throw new Error(result.message);
    }
    return {
      items: result.ok && Array.isArray(result.data) ? result.data : [],
      meta: result.ok ? result.meta : undefined,
    };
  });
}
