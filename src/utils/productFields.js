export const getEntityId = value => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value?._id || value?.id;
};

export const getEntityName = value => {
  if (!value || typeof value !== 'object') return undefined;
  return value?.name;
};

export const buildEntityNameById = entities => {
  if (!Array.isArray(entities)) return {};

  return entities.reduce((acc, entity) => {
    const id = getEntityId(entity);
    const name = getEntityName(entity);
    if (id && name) {
      acc[id] = name;
    }
    return acc;
  }, {});
};

const normalizeName = value => (value || '').toString().trim().toLowerCase();

// Resolve an entity id from a (case-insensitive) name, e.g. map the curated
// brand carousel labels to the real brand ids returned by /brand/all.
export const getEntityIdByName = (entities, name) => {
  if (!Array.isArray(entities)) return undefined;
  const target = normalizeName(name);
  const match = entities.find(
    entity => normalizeName(getEntityName(entity)) === target,
  );
  return match ? getEntityId(match) : undefined;
};

export const getProductBrandId = product => getEntityId(product?.brand);

export const getProductBrandName = (product, brandNameById = {}) => {
  const populatedName = getEntityName(product?.brand);
  if (populatedName) return populatedName;

  const brandId = getProductBrandId(product);
  return brandId ? brandNameById[brandId] : undefined;
};

export const getProductCategoryId = product => getEntityId(product?.category);

export const getProductSubCategoryId = product =>
  getEntityId(product?.sub_category);
