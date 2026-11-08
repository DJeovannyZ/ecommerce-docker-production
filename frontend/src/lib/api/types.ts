/**
 * Contratos de datos de la API REST (Laravel 12 + Swagger).
 * Los nombres de campo replican exactamente el JSON entregado por la API.
 */

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface AuthUserDto {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string | null;
}

export interface AuthTokenDto {
  access_token: string;
  token_type: "bearer" | string;
  expires_in: number;
  user: AuthUserDto;
}

export interface ProductDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderItemDto {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface PaymentDto {
  id: number;
  order_id: number;
  status: PaymentStatus;
  status_label: string;
  currency: string;
  amount: number;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  failure_reason: string | null;
  created_at: string | null;
}

export interface OrderDto {
  id: number;
  order_number: string;
  status: OrderStatus;
  status_label: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  /**
   * `OrderResource` solo incluye `items` cuando la relacion viene cargada.
   * El listado (`GET /orders`) usa `withCount('items')`, por lo que puede faltar.
   */
  items?: OrderItemDto[];
  /** Igual que `items`: presente solo si la relacion `payment` fue cargada. */
  payment?: PaymentDto | null;
  created_at: string | null;
}

export interface CheckoutSessionDto {
  checkout_url: string;
  payment: PaymentDto;
}

/** Bloque `meta` que Laravel agrega a las colecciones paginadas. */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  path: string;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/** Respuesta de `ApiResponse::resource()`: `{ success, message, data }`. */
export interface ResourcePayload<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Respuesta de `ApiResponse::collection()`: agrega `meta` y `links`. */
export interface CollectionPayload<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

/** Respuesta de `ApiResponse::error()`. */
export interface ErrorPayload {
  success: false;
  message: string;
  errors: Record<string, string[]>;
  code: string | null;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
