// app/menu/[restaurantId]/page.tsx
// Bu dosya Server Component'tir (Sunucu Bileşeni).

import { supabase } from '@/lib/supabase'; 

// TypeScript Tür Tanımlamaları
type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null; 
  price: number;
  is_available: boolean;
};

// Supabase'den gelen ham veri yapısı (içinde 'menu_items' var)
type RawMenuCategory = {
    id: string;
    name: string;
    menu_items: MenuItem[]; 
};

// Sayfada döngüye soktuğumuz nihai veri yapısı (içinde 'items' var)
type DisplayMenuCategory = {
    id: string;
    name: string;
    items: MenuItem[]; 
};


export default async function CustomerMenuPage({ params }: { params: { restaurantId: string } }) {
  
  // Menü verilerini Supabase'den çekme (Anon Key ile okunur)
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      menu_items (
        id,
        name,
        description,
        price,
        is_available
      )
    `)
    .order('display_order', { ascending: true }) 
    .order('name', { referencedTable: 'menu_items', ascending: true }); 

  if (error) {
    console.error('Menü verisi çekilirken hata oluştu:', error);
    return (
      <div className="text-center p-8 min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600">Hata: Menü Yüklenemedi</h1>
        <p className="text-gray-500">Lütfen QR kodu kontrol edin veya teknik destekle iletişime geçin.</p>
      </div>
    );
  }

  // Ham veriyi (RawMenuCategory) alıp, DisplayMenuCategory tipine dönüştürüp filtreliyoruz
  const rawData: RawMenuCategory[] = (categories as RawMenuCategory[] || []);

  const menuData: DisplayMenuCategory[] = rawData
    .map(category => ({
      id: category.id,
      name: category.name,
      // DÜZELTME: menu_items'ı alıp 'items' adıyla atıyoruz.
      items: category.menu_items.filter(item => item.is_available),
    }))
    // İçinde hiç mevcut öğe kalmayan kategorileri gizle
    .filter(category => category.items.length > 0);


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      
      <header className="text-center mb-10 pt-4">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Lezzetli Menü 🍔</h1>
        <p className="mt-2 text-xl text-indigo-600">Hoş Geldiniz! ({params.restaurantId})</p>
      </header>

      <main className="max-w-3xl mx-auto">
        
        {menuData.length === 0 ? (
          <p className="text-center text-gray-500 text-xl pt-10">Menümüzde şu an mevcut ürün bulunmamaktadır.</p>
        ) : (
          <div className="space-y-12">
            {menuData.map((category) => (
              <section key={category.id} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
                  {category.name}
                </h2>
                
                <div className="space-y-6">
                  {/* HATA ÇÖZÜLDÜ: category.items kullanılıyor */}
                  {category.items.map((item) => (
                    <article key={item.id} className="flex justify-between items-start border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="text-xl font-bold text-green-600 flex-shrink-0">
                        {item.price.toFixed(2)} TL
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-10 text-center text-gray-400 text-sm">
        <p>Powered by Next.js & Supabase</p>
      </footer>
    </div>
  );
}