// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Ortam değişkenleri (env.local'dan geliyor)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL veya Anon Key bulunamadı. Lütfen .env.local dosyasını kontrol edin.");
}

// supabase bağlantı nesnesini oluştur ve DIŞARIYA AKTAR (EXPORT)
// Bu satır, önceki derlemede eksikti.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);