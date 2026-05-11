// Helpers for accessing real API data shapes from the backend.
// Product schema: { images:[{image:string}], priceList:[{SP,MRP,number}], name, model, brand:{_id,name,slug}, top_product, deal_product }
// Deal schema: { product:{...Product}, newPrice, discount }

export const getProductImage = (product: any): string | undefined =>
  product?.images?.[0]?.image || undefined;

export const getProductPrice = (product: any): number =>
  product?.priceList?.[0]?.SP ?? product?.price ?? 0;

export const getProductMRP = (product: any): number =>
  product?.priceList?.[0]?.MRP ?? product?.price ?? 0;

export const getProductName = (product: any): string => {
  const brand = typeof product?.brand === 'object' ? (product?.brand?.name || '') : '';
  return [brand, product?.name, product?.model].filter(Boolean).join(' ');
};

// Returns normalised lowercase brand slug/name for filtering
export const getProductBrandKey = (product: any): string => {
  const b = product?.brand;
  if (!b) return '';
  if (typeof b === 'object') return ((b.slug || b.name) || '').toLowerCase().trim();
  return '';
};

// Deal helpers — deal objects from /deal/all have a nested `product` field
export const getDealProduct = (deal: any) => deal?.product;
export const getDealImage = (deal: any): string | undefined =>
  deal?.product?.images?.[0]?.image || undefined;
export const getDealPrice = (deal: any): number =>
  deal?.newPrice ?? deal?.product?.priceList?.[0]?.SP ?? 0;
export const getDealMRP = (deal: any): number =>
  deal?.product?.priceList?.[0]?.MRP ?? 0;
export const getDealName = (deal: any): string => getProductName(deal?.product);

export const formatPrice = (price: number): string =>
  `₹${Math.round(price)}`;

export const getDiscountPercent = (mrp: number, sp: number): number => {
  if (!mrp || mrp <= sp) return 0;
  return Math.round(((mrp - sp) / mrp) * 100);
};
