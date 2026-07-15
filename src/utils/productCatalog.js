// Shared product normalization for the mobile app — the counterpart to the web
// app's utils/productCatalog.ts + components/listing/productDisplay.tsx.
//
// The backend (flattenProductCatalog) already backfills legacy `images` and
// `priceList` from the newer `media`/`pricing` sidecars, but those arrays can
// still be missing or empty, and list/search payloads leave brand/category as
// bare ObjectIds. Reading `product.images[0].image` or `product.priceList[0].SP`
// directly therefore blanks or crashes the UI. Every list/detail/cart/wishlist
// surface should read product data through these helpers instead.

const CLOUDFRONT_BASE = 'https://d3dcdu6oc5g6yg.cloudfront.net/';
const LOCAL_IMAGE_HOST = '10.0.2.2';

const hasValue = value =>
  value !== undefined && value !== null && String(value).trim() !== '';

const isRecord = value =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const numberOrUndefined = value => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const stringOrEmpty = value => (hasValue(value) ? String(value) : '');

const safeDecode = value => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const encodeKeyPath = value =>
  String(value || '')
    .replace(/^\/+/, '')
    .split('/')
    .map(segment => encodeURIComponent(safeDecode(segment)))
    .join('/');

const cdnUrlForKey = key => `${CLOUDFRONT_BASE}${encodeKeyPath(key)}`;

const extractGetImageKey = value => {
  const match = String(value || '').match(/[?&]image=([^&#]+)/i);
  return match ? safeDecode(match[1]) : '';
};

export const getObjectId = value => {
  if (!value) return '';
  if (isRecord(value)) return stringOrEmpty(value._id || value.id);
  return String(value);
};

// ─── Images ──────────────────────────────────────────────────────────
const resolveImageUrl = url => {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  const proxyKey = trimmed.includes('/getImage')
    ? extractGetImageKey(trimmed)
    : '';
  if (proxyKey) return resolveImageUrl(proxyKey);
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(trimmed)) {
    return trimmed.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
      `http://${LOCAL_IMAGE_HOST}$2`,
    );
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Bare S3/CloudFront keys that were not signed by the backend.
  return cdnUrlForKey(trimmed);
};

const normalizeImage = image => {
  if (typeof image === 'string' && image.trim()) {
    return { image: resolveImageUrl(image) };
  }
  if (isRecord(image)) {
    const src = stringOrEmpty(image.image || image.url || image.src);
    if (src) {
      return { image: resolveImageUrl(src), alt: stringOrEmpty(image.alt) };
    }
  }
  return null;
};

// Returns a de-blanked gallery ([] when the product has no usable image),
// tolerating legacy `images`, the newer `media.images` / `media.gallery`, and a
// standalone `media.thumbnail`.
export const getProductImages = product => {
  const source = product || {};
  const media = isRecord(source.media) ? source.media : {};
  const rawImages = Array.isArray(source.images) && source.images.length
    ? source.images
    : Array.isArray(media.images) && media.images.length
    ? media.images
    : Array.isArray(media.gallery)
    ? media.gallery
    : [];
  const images = rawImages.map(normalizeImage).filter(Boolean);
  if (images.length) return images;
  const thumbnail = normalizeImage(media.thumbnail);
  return thumbnail ? [thumbnail] : [];
};

// Single display URI (the thumbnail). Empty string when the product has no
// image — callers render the bundled placeholder via <ProductImage/>.
export const getProductImageUri = product =>
  getProductImages(product)[0]?.image || '';

// ─── Pricing ─────────────────────────────────────────────────────────
export const getAvailableStock = product => {
  const source = product || {};
  const inventory = isRecord(source.inventory) ? source.inventory : {};
  const inventoryStock = numberOrUndefined(inventory.availableStock);
  if (inventoryStock !== undefined) return inventoryStock;

  const pricing = isRecord(source.pricing) ? source.pricing : {};
  const pricingStock = numberOrUndefined(pricing.stockQuantity);
  if (pricingStock !== undefined) return pricingStock;

  const tierStock = getPriceTiers(product).reduce(
    (sum, tier) => sum + (tier.stockQuantity ?? 0),
    0,
  );
  if (tierStock > 0) return tierStock;

  return numberOrUndefined(source.stock_quantity) ?? 0;
};

// Normalized price tiers. Each tier carries BOTH legacy keys
// (SP/MRP/number/stock_quantity/pack_weight) and normalized ones, so existing
// UI reads and the pack-size modal keep working unchanged. Empty-priced tiers
// are dropped.
export const getPriceTiers = product => {
  const source = product || {};
  const pricing = isRecord(source.pricing) ? source.pricing : {};
  const rawTiers =
    Array.isArray(pricing.priceList) && pricing.priceList.length
      ? pricing.priceList
      : Array.isArray(source.priceList)
      ? source.priceList
      : [];

  return rawTiers
    .map(tier => {
      const row = isRecord(tier) ? tier : {};
      const sellingPrice =
        numberOrUndefined(row.SP) ??
        numberOrUndefined(row.price) ??
        numberOrUndefined(pricing.basePrice) ??
        numberOrUndefined(source.price) ??
        0;
      const mrp =
        numberOrUndefined(row.MRP) ??
        numberOrUndefined(row.original_price) ??
        sellingPrice;
      const number = numberOrUndefined(row.number) ?? 1;
      const stockQuantity = numberOrUndefined(row.stock_quantity);
      const packWeight = numberOrUndefined(row.pack_weight);
      const discount = numberOrUndefined(row.discount);
      return {
        number,
        sellingPrice,
        mrp,
        stockQuantity,
        discount,
        packWeight,
        // legacy-compatible keys (consumed by cart/wishlist payloads + modal)
        SP: sellingPrice,
        MRP: mrp,
        stock_quantity: stockQuantity,
        pack_weight: packWeight,
      };
    })
    .filter(tier => tier.sellingPrice > 0 || tier.mrp > 0);
};

// Always returns a usable tier (never undefined), so reads like tier.SP /
// tier.number can't crash on a product with an empty/absent price list.
export const getPrimaryPriceTier = product => {
  const tiers = getPriceTiers(product);
  if (tiers[0]) return tiers[0];

  const source = product || {};
  const pricing = isRecord(source.pricing) ? source.pricing : {};
  const basePrice =
    numberOrUndefined(pricing.basePrice) ??
    numberOrUndefined(source.price) ??
    0;
  const stock = getAvailableStock(product);
  const stockQuantity = stock > 0 ? stock : undefined;
  return {
    number: 1,
    sellingPrice: basePrice,
    mrp: basePrice,
    stockQuantity,
    discount: undefined,
    packWeight: undefined,
    SP: basePrice,
    MRP: basePrice,
    stock_quantity: stockQuantity,
    pack_weight: undefined,
  };
};

export const isInStock = product => getAvailableStock(product) > 0;

export const getDiscountPercent = (sellingPrice, mrp) => {
  const sp = Number(sellingPrice);
  const m = Number(mrp);
  if (!m || m <= sp) return 0;
  return Math.round(((m - sp) / m) * 100);
};

// Hermes-safe Indian-grouped rupee formatting (does not depend on Intl).
export const formatCardPrice = value => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '₹0';
  const rounded = Math.round(n);
  const digits = String(Math.abs(rounded));
  let grouped;
  if (digits.length <= 3) {
    grouped = digits;
  } else {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    grouped = `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`;
  }
  return `₹${rounded < 0 ? '-' : ''}${grouped}`;
};

// ─── Display (mirrors web productDisplay.tsx) ────────────────────────
// Cosmetic trademark styling keyed by normalized brand name/slug (NOT id).
const BRAND_DISPLAY_OVERRIDES = {
  rollabel: 'Rollabel™',
  packpro: 'PackPro™',
};

const applyBrandDisplay = name => {
  const key = name.trim().toLowerCase().replace(/\s+/g, '-');
  return BRAND_DISPLAY_OVERRIDES[key] || name;
};

export const stripObjectId = value => {
  if (!value || typeof value !== 'string') return value || '';
  return value
    .replace(/\b[a-f0-9]{24}\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// `brandNameById` is a dynamic id->name map (from /brand/all). Only needed when
// `brand` is a bare ObjectId (list/search payloads are not populated).
export const getBrandLabel = (brand, brandNameById = {}) => {
  if (!brand) return '';
  const name =
    typeof brand === 'object'
      ? brand?.name || brandNameById[brand?._id] || ''
      : brandNameById[brand] || '';
  const cleaned = stripObjectId(name);
  return cleaned ? applyBrandDisplay(cleaned) : '';
};

export const getProductDisplayName = (
  item,
  { includeBrand = true, includePack = false, brandNameById = {} } = {},
) => {
  if (!item) return '';
  const title = [
    includeBrand ? getBrandLabel(item?.brand, brandNameById) : '',
    stripObjectId(item?.name),
    stripObjectId(item?.model),
  ]
    .filter(Boolean)
    .join(' ');
  const packCount = getPrimaryPriceTier(item)?.number;
  if (includePack && packCount) return `${title} (Pack of ${packCount})`;
  return title;
};

const getSpecificationAttributes = product => {
  const source = product || {};
  const normalized = isRecord(source.specification) ? source.specification : {};
  const attributes = isRecord(normalized.attributes)
    ? normalized.attributes
    : {};
  return { ...attributes, ...normalized };
};

const normalizeDimensionText = value =>
  String(value || '')
    .trim()
    .replace(/\s*[xX]\s*/g, ' x ');

// The card sub-title: prefers explicit size fields, then dimensions, then
// material/color, then category / sub-category names.
export const getProductCardSummary = item => {
  if (!item) return '';
  const source = { ...item, ...getSpecificationAttributes(item) };
  const firstOf = keys => {
    for (const key of keys) {
      if (hasValue(source[key])) return source[key];
    }
    return undefined;
  };

  const sizeInch = firstOf(['size_inch']);
  if (hasValue(sizeInch))
    return `Size: ${normalizeDimensionText(sizeInch)} inches`;

  const sizeMm = firstOf(['size_mm']);
  if (hasValue(sizeMm)) return `Internal: ${normalizeDimensionText(sizeMm)} mm`;

  const mmParts = [
    source.length_mm,
    source.breadth_mm ?? source.width_mm ?? source.width,
    source.height_mm,
  ].filter(hasValue);
  if (mmParts.length >= 2) return `Internal: ${mmParts.join(' x ')} mm`;

  const inchParts = [
    source.length_inch,
    source.breadth_inch ?? source.width_inch,
    source.height_inch,
  ].filter(hasValue);
  if (inchParts.length >= 2) return `Size: ${inchParts.join(' x ')} inches`;

  const material = firstOf(['material']);
  const gsm = firstOf(['gsm']);
  if (hasValue(gsm) && hasValue(material)) return `${gsm} GSM ${material}`;

  const color = firstOf(['color', 'colour']);
  if (hasValue(material) && hasValue(color)) return `${material} / ${color}`;
  if (hasValue(material)) return `Material: ${material}`;

  const category =
    typeof item?.category === 'object' ? item?.category?.name : undefined;
  const subCategory =
    typeof item?.subCategory === 'object'
      ? item?.subCategory?.name
      : typeof item?.sub_category === 'object'
      ? item?.sub_category?.name
      : undefined;
  return [category, subCategory].filter(Boolean).join(' / ');
};

// "SALE" for discounted/deal products, "POPULAR" for featured/top products.
export const getProductCardBadge = item => {
  if (!item) return '';
  const tier = getPrimaryPriceTier(item);
  const discountPercent =
    tier.discount ?? getDiscountPercent(tier.sellingPrice, tier.mrp);
  if (item?.deal_product || discountPercent > 0) return 'SALE';
  if (item?.featured || item?.top_product) return 'POPULAR';
  return '';
};
