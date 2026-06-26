import { apiFetch, buildQuery, type Paginated } from "./client";
import type {
  Brand,
  Category,
  ProductDetail,
  ProductListItem,
} from "@/lib/types/catalog";

// Live backend endpoints (backend/apps/catalog/urls.py). All read-only / public.

export function getCategories(): Promise<Paginated<Category>> {
  return apiFetch<Paginated<Category>>(`/catalog/categories/${buildQuery({ limit: 200 })}`);
}

/** Top-level categories only (the API has no null-parent filter, so filter here). */
export async function getRootCategories(): Promise<Category[]> {
  const { results } = await getCategories();
  return results.filter((c) => c.parent === null);
}

export function getCategory(slug: string): Promise<Category> {
  return apiFetch<Category>(`/catalog/categories/${encodeURIComponent(slug)}/`);
}

export function getBrands(): Promise<Paginated<Brand>> {
  return apiFetch<Paginated<Brand>>(`/catalog/brands/${buildQuery({ limit: 100 })}`);
}

export interface ProductQuery {
  category?: string;
  brand?: string;
  search?: string;
  ordering?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export function getProducts(query: ProductQuery = {}): Promise<Paginated<ProductListItem>> {
  return apiFetch<Paginated<ProductListItem>>(`/catalog/products/${buildQuery({ ...query })}`);
}

/** Most recently created products, for the home page. */
export function getNewProducts(limit = 8): Promise<Paginated<ProductListItem>> {
  return getProducts({ ordering: "-created_at", limit });
}

export function getProduct(slug: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}/`);
}
