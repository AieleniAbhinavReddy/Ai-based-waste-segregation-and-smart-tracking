import { supabase } from "@/lib/supabase";

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  category: string;
  condition: string;
  price: number;
  images: string[];
  is_active?: boolean;
  created_at: string;
};

const LS_LISTINGS = "greenindia_marketplace_listings";
const LS_ORDERS = "greenindia_marketplace_orders";

function readLS<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeLS<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export async function createListing(data: {
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  images: string[];
}) {
  if (!supabase) {
    const item: Listing = {
      id: `local-${Date.now()}`,
      seller_id: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      condition: data.condition,
      price: data.price,
      images: data.images,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    const list = readLS<Listing>(LS_LISTINGS);
    list.unshift(item);
    writeLS(LS_LISTINGS, list);
    return item;
  }

  const { data: res, error } = await supabase
    .from("marketplace_listings")
    .insert([
      {
        seller_id: data.user_id,
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
        price: data.price,
        images: data.images,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return res;
}

export async function listListings() {
  if (!supabase) {
    return readLS<Listing>(LS_LISTINGS).filter((l) => l.is_active !== false);
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getListing(id: string) {
  if (!supabase) {
    return readLS<Listing>(LS_LISTINGS).find((l) => l.id === id) || null;
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createOrder(data: {
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price: number;
}) {
  if (!supabase) {
    const order = { id: `local-${Date.now()}`, ...data, status: "pending", created_at: new Date().toISOString() };
    const list = readLS<any>(LS_ORDERS);
    list.unshift(order);
    writeLS(LS_ORDERS, list);
    return order;
  }

  const { data: res, error } = await supabase
    .from("marketplace_orders")
    .insert([
      {
        listing_id: data.listing_id,
        buyer_id: data.buyer_id,
        seller_id: data.seller_id,
        price: data.price,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return res;
}

export async function createOffer(data: {
  listing_id: string;
  buyer_id: string;
  amount: number;
  message?: string;
}) {
  if (!supabase) {
    const offer = { id: `local-${Date.now()}`, ...data, status: "pending", created_at: new Date().toISOString() };
    return offer;
  }

  const { data: res, error } = await supabase
    .from("marketplace_offers")
    .insert([
      {
        listing_id: data.listing_id,
        buyer_id: data.buyer_id,
        amount: data.amount,
        message: data.message || null,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return res;
}
