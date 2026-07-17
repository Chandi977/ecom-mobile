// Mobile counterpart of ecom-frontend-optimised/utils/overviewFields.ts
// Per-category metric fields, GST resolution, admin overview config, label brand
// fallback — all matching the web's live logic.

const PACKPRO_TAPE_CATEGORY_ID = "6557df64301ec4f2f4266141";
const CARRY_BAG_CATEGORY_IDS = new Set([
  "6557df71301ec4f2f4266145",
  "689d73214687bb4e437542e0",
]);
const FOOD_WRAPPING_CATEGORY_IDS = new Set([
  "69dcb22e733b8ba056529a9f",
  "679ca70f2833ca433fa0aa9c",
]);
const LABEL_CATEGORY_ID = "6557deb6301ec4f2f4266135";
const POLY_BAG_CATEGORY_ID = "6557df4f301ec4f2f426613d";
const PAPER_BAG_CATEGORY_ID = "6557df46301ec4f2f4266139";
const CORRUGATED_BOX_CATEGORY_ID = "6557deab301ec4f2f4266131";

const normalizeId = value => {
  if (!value) return "";
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const hasValue = value =>
  value !== undefined && value !== null && String(value).trim() !== "";

const getProductBrandName = product => {
  const brand = product?.brand;
  if (brand && typeof brand === "object") {
    const name = brand.name;
    if (hasValue(name)) return String(name);
  }
  return "";
};

const formatBoolean = value => {
  if (value === true || value === "true" || value === "Yes") return "Yes";
  return "No";
};

const formatGst = (value, fallback = "Not Available") => {
  if (!hasValue(value)) return fallback;
  if (typeof value === "number") {
    const percent = value <= 1 ? value * 100 : value;
    return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
  }
  const text = String(value).trim();
  if (text.includes("%")) return text;
  const numericValue = Number(text);
  if (Number.isFinite(numericValue)) {
    const percent = numericValue <= 1 ? numericValue * 100 : numericValue;
    return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
  }
  return text;
};

const parseGstValue = value => {
  if (value === undefined || value === null || value === "") return undefined;
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate < 0) return undefined;
  return rate;
};

const resolveGstRate = product => {
  if (!product) return 18;
  const sub = product.sub_category;
  const cat = product.category;
  return (
    parseGstValue(product.gst) ??
    (sub && typeof sub === "object" ? parseGstValue(sub.gst) : undefined) ??
    (cat && typeof cat === "object" ? parseGstValue(cat.gst) : undefined) ??
    18
  );
};

const getFirstValue = (product, keys) => {
  if (!product) return undefined;
  for (const key of keys) {
    const value = product[key];
    if (hasValue(value)) return value;
  }
  return undefined;
};

const getDimensionInches = product => {
  if (hasValue(product?.size_inch)) {
    return String(product.size_inch).replace(/x/g, " x ").replace(/X/g, " X ");
  }
  const parts = [
    product?.length_inch,
    product?.breadth_inch,
    product?.height_inch,
  ].filter(hasValue);
  if (parts.length > 0) return parts.join(" X ");
  return "Not Available";
};

const getDimensionMm = product => {
  if (hasValue(product?.size_mm)) {
    return String(product.size_mm).replace(/x/g, " x ").replace(/X/g, " X ");
  }
  const parts = [
    product?.length_mm,
    product?.breadth_mm ?? product?.width,
    product?.height_mm,
  ].filter(hasValue);
  if (parts.length > 0) return parts.join(" X ");
  return "Not Available";
};

const buildFieldsFromConfig = (product, config = [], weight) =>
  config
    .map(field => {
      const rawValue = field.getValue
        ? field.getValue(product, weight)
        : getFirstValue(product, field.keys || []);
      if (!hasValue(rawValue)) return null;
      const formattedValue = field.format ? field.format(rawValue, product) : rawValue;
      if (!hasValue(formattedValue)) return null;
      return {
        label: typeof field.label === "function" ? field.label(product) : field.label,
        value: String(formattedValue),
      };
    })
    .filter(f => f !== null);

export const getProductKind = product => {
  const categoryId = normalizeId(product?.category);
  const categoryName =
    typeof product?.category === "object" ? product?.category?.name || "" : "";
  const categorySlug =
    typeof product?.category === "object" ? product?.category?.slug || "" : "";
  const searchText = [product?.name, product?.slug, product?.model, categoryName, categorySlug]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (categoryId === PACKPRO_TAPE_CATEGORY_ID || /tape/i.test(searchText)) return "tape";
  if (CARRY_BAG_CATEGORY_IDS.has(categoryId) || /carry.*bag/i.test(searchText)) return "carry-bag";
  if (FOOD_WRAPPING_CATEGORY_IDS.has(categoryId) || /food.*wrapping|foil/.test(searchText)) return "foil-paper";
  if (categoryId === LABEL_CATEGORY_ID || /label/i.test(searchText)) return "label";
  if (categoryId === POLY_BAG_CATEGORY_ID || /poly.*bag/i.test(searchText)) return "polybag";
  if (categoryId === PAPER_BAG_CATEGORY_ID || /paper.*bag/i.test(searchText)) return "paperbag";
  if (categoryId === CORRUGATED_BOX_CATEGORY_ID || categoryId === "6926d7c0d53f3a772c6f08af" || /corrugated/i.test(searchText)) return "corrugated";
  return "generic";
};

const getCategoryMetricFields = product => {
  const productKind = getProductKind(product);
  switch (productKind) {
    case "tape":
      return [
        { label: "Width (mm)", keys: ["breadth_mm", "width"] },
        { label: "Length (mtr)", keys: ["length"] },
        {
          label: currentProduct =>
            /paper/i.test([currentProduct?.name, currentProduct?.slug].filter(Boolean).join(" "))
              ? "Thickness (gsm)"
              : "Thickness (micron)",
          keys: ["thickness_micron", "thickness"],
        },
      ];
    case "carry-bag":
      return [
        { label: "Breadth (inch)", keys: ["breadth_inch", "width"] },
        { label: "Height (inch)", keys: ["height_inch"] },
        { label: "Gusset (inch)", keys: ["gusset"] },
        { label: "Thickness (gsm)", keys: ["thickness"] },
      ];
    case "foil-paper":
      return [
        { label: "Length (inch)", keys: ["length_inch"] },
        { label: "Height (inch)", keys: ["height_inch"] },
        { label: "Thickness (gsm)", keys: ["thickness"] },
      ];
    case "label":
      return [
        { label: "Length (inch)", keys: ["length_inch"] },
        { label: "Length (mm)", keys: ["length_mm"] },
        { label: "Height (inch)", keys: ["height_inch", "breadth_inch"] },
        { label: "Height (mm)", keys: ["height_mm", "breadth_mm"] },
        { label: "Core Size (inch)", keys: ["core_size"] },
      ];
    case "polybag":
      return [
        { label: "Length (inch)", keys: ["length_inch"] },
        { label: "Length (mm)", keys: ["length_mm"] },
        { label: "Breadth (inch)", keys: ["breadth_inch"] },
        { label: "Breadth (mm)", keys: ["breadth_mm", "width"] },
        { label: "Flap (mm)", keys: ["flap_mm"] },
      ];
    case "paperbag":
      return [
        { label: "Length (inch)", keys: ["length_inch"] },
        { label: "Length (mm)", keys: ["length_mm"] },
        { label: "Breadth (inch)", keys: ["breadth_inch"] },
        { label: "Breadth (mm)", keys: ["breadth_mm", "width"] },
        { label: "Flap (mm)", keys: ["flap_mm"] },
        { label: "Gusset (mm)", keys: ["gusset"] },
      ];
    case "corrugated":
      return [
        { label: "Length (inch)", keys: ["length_inch"] },
        { label: "Length (mm)", keys: ["length_mm"] },
        { label: "Breadth (inch)", keys: ["breadth_inch"] },
        { label: "Breadth (mm)", keys: ["breadth_mm"] },
        { label: "Height (inch)", keys: ["height_inch"] },
        { label: "Height (mm)", keys: ["height_mm"] },
      ];
    default:
      return [
        { label: "Length (mm)", keys: ["length_mm"] },
        { label: "Width (mm)", keys: ["breadth_mm", "width"] },
        { label: "Height (mm)", keys: ["height_mm"] },
        { label: "Flap (mm)", keys: ["flap_mm"] },
        { label: "Gusset (mm)", keys: ["gusset"] },
        { label: "Length", keys: ["length"] },
        { label: "Width", keys: ["breadth", "width"] },
        { label: "Height", keys: ["height"] },
      ];
  }
};

const mergeUniqueFields = (baseFields, extraFields) => {
  const seenLabels = new Set(baseFields.map(f => f.label.toLowerCase().trim()));
  const merged = [...baseFields];
  for (const field of extraFields) {
    const labelLower = field.label.toLowerCase().trim();
    if (!seenLabels.has(labelLower)) {
      merged.push(field);
      seenLabels.add(labelLower);
    }
  }
  return merged;
};

const slugifyOverviewFieldKey = value =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const TAX_AND_SUSTAINABILITY_CONFIG = [
  { label: "HSN Code", keys: ["hsn_code"] },
  { label: "SAC Code", keys: ["sac_code"] },
  {
    label: "GST",
    getValue: product => resolveGstRate(product),
    format: value => formatGst(value),
  },
  { label: "Recyclable", keys: ["recyclable"], format: formatBoolean },
  { label: "Biodegradable", keys: ["biodegradable"], format: formatBoolean },
  { label: "FSC Certified", keys: ["fsc_certified"], format: formatBoolean },
  { label: "Certifications", keys: ["certifications"] },
];

const COMMON_FIELDS = [
  { label: "Brand", getValue: product => getProductBrandName(product) || "Not Available" },
  { label: "Model", keys: ["model"] },
  { label: "Material", keys: ["material"] },
  { label: "Colour", keys: ["color"] },
  { label: "HSN Code", keys: ["hsn_code"] },
  { label: "SAC Code", keys: ["sac_code"] },
  { label: "GST", getValue: product => resolveGstRate(product), format: value => formatGst(value) },
  { label: "Type", keys: ["name"] },
  { label: "Labels per Roll", keys: ["label_in_roll"] },
  { label: "Form", keys: ["form"] },
  { label: "Recyclable", keys: ["recyclable"], format: formatBoolean },
  { label: "Biodegradable", keys: ["biodegradable"], format: formatBoolean },
  { label: "FSC Certified", keys: ["fsc_certified"], format: formatBoolean },
  { label: "Certifications", keys: ["certifications"] },
];

const buildAutoOverviewFields = (product, packSize, weightValue) => {
  if (!product) return [];

  const productKind = getProductKind(product);
  const taxAndSustainability = buildFieldsFromConfig(product, TAX_AND_SUSTAINABILITY_CONFIG, weightValue);

  let fields = [];

  if (productKind === "corrugated") {
    fields = [
      { label: "Dimension (inch)", value: getDimensionInches(product) },
      { label: "Dimension (mm)", value: getDimensionMm(product) },
      { label: "Brand", value: getProductBrandName(product) || "Not Available" },
    ].filter(f => f.value !== "Not Available");
  } else if (productKind === "label") {
    const brandName = getProductBrandName(product) || "Rollabel™";
    const labelsPerRoll = getFirstValue(product, ["label_in_roll", "label_in_role"]);
    fields = [
      { label: "Dimension (inch)", value: getDimensionInches(product) },
      { label: "Dimension (mm)", value: getDimensionMm(product) },
      { label: "Labels per Roll", value: hasValue(labelsPerRoll) ? String(labelsPerRoll) : "Not Available" },
      { label: "Brand", value: brandName },
    ].filter(f => f.value !== "Not Available");
  } else if (productKind === "paperbag") {
    const brandName = getProductBrandName(product) || "Not Available";
    fields = [
      { label: "Dimension (inch)", value: getDimensionInches(product) },
      { label: "Dimension (mm)", value: getDimensionMm(product) },
      { label: "Brand", value: brandName },
    ].filter(f => f.value !== "Not Available");
  } else if (productKind === "foil-paper") {
    const categoryName = typeof product?.category === "object" ? product?.category?.name || "" : "";
    const subCategoryName = typeof product?.sub_category === "object" ? product?.sub_category?.name || "" : "";
    fields = [
      { label: "Name", value: String(product?.name || "Not Available") },
      { label: "Brand", value: getProductBrandName(product) || "Not Available" },
      { label: "Length (inches)", value: formatWithUnit(getFirstValue(product, ["length_inch"]), "inches") },
      { label: "Breadth (inches)", value: formatWithUnit(getFirstValue(product, ["breadth_inch", "height_inch", "width"]), "inches") },
      { label: "Thickness (gsm)", value: formatWithUnit(product?.thickness, "gsm") },
      { label: "Type", value: String(product?.model || subCategoryName || categoryName || "Not Available") },
      { label: "Print", value: String(product?.print || "Not Available") },
      { label: "HSN Code", value: String(product?.hsn_code || "Not Available") },
      { label: "Pack of", value: hasValue(packSize) ? `${packSize} pcs` : "Not Available" },
    ];
  } else if (productKind === "tape") {
    const brandName = getProductBrandName(product) || "PackPro™";
    fields = [
      { label: "Brand", value: brandName },
      { label: "Print", value: hasValue(product?.print) ? String(product.print) : "Not Available" },
    ].filter(f => f.value !== "Not Available");
  } else if (productKind === "polybag") {
    const brandName = getProductBrandName(product) || "Not Available";
    fields = [
      { label: "Dimension (inch)", value: getDimensionInches(product) },
      { label: "Dimension (mm)", value: getDimensionMm(product) },
      { label: "Brand", value: brandName },
    ].filter(f => f.value !== "Not Available");
  } else {
    const commonFields = buildFieldsFromConfig(product, COMMON_FIELDS, weightValue);
    const metricFields = buildFieldsFromConfig(product, getCategoryMetricFields(product), weightValue);
    const weightFields = hasValue(weightValue)
      ? [{ label: "Pack Weight (kg)", value: String(weightValue) }]
      : [];
    fields = [...commonFields, ...metricFields, ...weightFields];
  }

  return mergeUniqueFields(fields, taxAndSustainability);
};

const formatWithUnit = (value, unit) => {
  if (!hasValue(value)) return "Not Available";
  const text = String(value).trim();
  const unitPattern = unit.endsWith("s") ? `${unit.slice(0, -1)}s?` : unit;
  return new RegExp(`\\b${unitPattern}\\b`, "i").test(text) ? text : `${text} ${unit}`;
};

const applyOverviewConfig = (autoFields, config) => {
  const autoByKey = new Map(autoFields.map(field => [slugifyOverviewFieldKey(field.label), field]));
  const usedKeys = new Set();
  const result = [];

  for (const row of config) {
    const visible = row.visible !== false;
    const rowKey = row.key && String(row.key).trim() ? String(row.key).trim() : slugifyOverviewFieldKey(row.label);
    const autoField = autoByKey.get(rowKey);

    if (autoField) {
      usedKeys.add(rowKey);
      if (visible) result.push({ label: autoField.label, value: autoField.value });
    } else if (visible && row.label && hasValue(row.value)) {
      result.push({ label: String(row.label), value: String(row.value) });
    }
  }

  for (const field of autoFields) {
    if (!usedKeys.has(slugifyOverviewFieldKey(field.label))) result.push(field);
  }

  return result;
};

export const getOverviewFields = (product, packSize, weightValue) => {
  if (!product) return [];

  const autoFields = buildAutoOverviewFields(product, packSize, weightValue);

  const config = Array.isArray(product.overview_fields) ? product.overview_fields : [];

  if (config.length === 0) return autoFields;

  const isNewStyleConfig = config.some(row => row && row.key != null && String(row.key).trim() !== "");

  if (!isNewStyleConfig) {
    return config
      .filter(row => row && row.label && hasValue(row.value))
      .map(row => ({ label: String(row.label), value: String(row.value) }));
  }

  return applyOverviewConfig(autoFields, config);
};
