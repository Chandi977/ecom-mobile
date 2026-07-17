export const parseLabelModel = model => {
  const text = String(model ?? "").trim();
  const match = text.match(/^(.+)_(\d+)$/);
  if (!match) return null;
  const labelQty = Number(match[2]);
  if (!Number.isFinite(labelQty) || labelQty <= 0) return null;
  return { baseModel: match[1], labelQty };
};

const normalizeRefId = value => {
  if (!value) return "";
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const variantGroupKey = item => {
  const parsed = parseLabelModel(item?.model);
  if (!parsed) return null;
  return `${normalizeRefId(item?.sub_category)}::${parsed.baseModel.toLowerCase()}`;
};

const toVariantOption = item => ({
  labelQty: parseLabelModel(item?.model).labelQty,
  slug: item?.slug,
  id: item?._id ? String(item._id) : undefined,
  product: item,
});

export const findLabelVariants = (product, catalog) => {
  if (!product) return [];
  const key = variantGroupKey(product);
  if (!key) return [];
  const seen = new Set();
  const variants = (Array.isArray(catalog) ? catalog : [])
    .filter(item => item?.slug && variantGroupKey(item) === key)
    .map(toVariantOption)
    .filter(variant => {
      if (seen.has(variant.labelQty)) return false;
      seen.add(variant.labelQty);
      return true;
    })
    .sort((a, b) => a.labelQty - b.labelQty);
  return variants.length > 1 ? variants : [];
};
