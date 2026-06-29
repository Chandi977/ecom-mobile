export const getEntityId = value => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value?._id || value?.id;
};

export const getProductBrandId = product => getEntityId(product?.brand);

export const getProductCategoryId = product => getEntityId(product?.category);

export const getProductSubCategoryId = product =>
  getEntityId(product?.sub_category);
