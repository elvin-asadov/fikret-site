// Types mirror the DRF serializers in backend/apps/catalog/serializers.py.
// NOTE: the list and detail product endpoints return different shapes.
// TODO: once the backend `/api/schema/` endpoint is reachable, generate these
// from OpenAPI (openapi-typescript) instead of hand-maintaining them.

export interface Category {
  id: number;
  parent: number | null;
  name_az: string;
  name_ru: string;
  slug: string;
  image: string | null;
  order: number;
  is_active: boolean;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt: string;
  order: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: string;
  old_price: string | null;
  attributes: Record<string, string>;
  barcode: string;
  weight: string | null;
  is_default: boolean;
  stock_quantity: number;
}

export interface ProductAttributeValue {
  id: number;
  attribute: number;
  attribute_name: string;
  value: string;
}

/** Shape returned by the product *list* endpoint. */
export interface ProductListItem {
  id: number;
  category: Category;
  brand: Brand | null;
  name_az: string;
  name_ru: string;
  slug: string;
  sku: string;
  is_active: boolean;
  default_variant: ProductVariant | null;
  primary_image: ProductImage | null;
}

/** Shape returned by the product *detail* endpoint. */
export interface ProductDetail {
  id: number;
  category: Category;
  brand: Brand | null;
  name_az: string;
  name_ru: string;
  slug: string;
  description: string;
  sku: string;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  created_at: string;
  variants: ProductVariant[];
  images: ProductImage[];
  attribute_values: ProductAttributeValue[];
}
