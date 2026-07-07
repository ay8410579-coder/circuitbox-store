import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wowhdfoajshaozilvbpk.supabase.co";
const supabaseKey = "sb_publishable_m9imIWtbAOv0xuQrqwFifg_477QK1hx";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadProductImage(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function addProduct(product) {
  const { data, error } = await supabase.from("products").insert(product).select();
  if (error) throw error;
  return data[0];
}

export async function createOrder(order) {
  const { data, error } = await supabase.from("orders").insert(order).select();
  if (error) throw error;
  return data[0];
}
