export type Product = {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  category: string;
  price: number;
  emoji: string;
  badge?: string;
  features: string[];
  image?: string;
  createdAt: string;
};

export type OrderChannel = "whatsapp" | "discord";
export type OrderStatus = "new" | "done";
export type OrderEventType = "created" | "status" | "note" | "phone";

export type OrderEvent = {
  at: string;
  type: OrderEventType;
  text: string;
};

export type StoreOrder = {
  id: string;
  number: string;
  productId?: string;
  productName: string;
  productImage?: string;
  price?: number;
  channel: OrderChannel;
  status: OrderStatus;
  note?: string;
  customerPhone?: string;
  message?: string;
  events?: OrderEvent[];
  createdAt: string;
};

export type Customer = {
  id: string;
  phone: string;
  name?: string;
  passwordHash?: string;
  createdAt: string;
  lastLoginAt?: string;
};

export type OtpEntry = {
  phone: string;
  codeHash: string;
  expiresAt: string;
  sentAt: string;
  attempts: number;
};

export type StoreSettings = {
  whatsappUrl: string;
  discordUrl: string;
};

export type Db = {
  products: Product[];
  orders: StoreOrder[];
  settings: StoreSettings;
  auth: { passwordHash: string };
  customers: Customer[];
  otps: OtpEntry[];
};
