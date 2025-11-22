import { supabaseServer } from '@/lib/supabaseServer';

type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
};

type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export default async function CustomerMenuPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const supabase = supabaseServer();

  const { data: categories, error } = await supabase
    .from('categories')
    .select(
      `
      id,
      name,
      menu_items (
        id,
        name,
        description,
        price,
        is_available
      )
    `
    )
    .order('display_order', { ascending: true })
    .order('name', { referencedTable: 'menu_items', ascending: true });

  if (error) {
    console.error('Menü verisi çekilirken hata oluştu:', error);
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600">Hata: Menü Yüklenemedi</h1>
        <p className="text-gray-500">
          Lütfen QR kodunu kontrol edin veya teknik destekle iletişime geçin.
        </p>
      </div>
    );
  }

  const menuData: MenuCategory[] = (categories || [])
    .map((category: any) => ({
      ...category,
      items: (category.menu_items as MenuItem[]).filter(
        (item) => item.is_available
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="text-center mb-10 pt-4">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Lezzetli Menü 🍔
        </h1>
        <p className="mt-2 text-xl text-indigo-600">
          Hoş Geldiniz! ({params.restaurantId})
        </p>
      </header>

      <main className="max-w-3xl mx-auto">
        {menuData.length === 0 ? (
          <p className="text-center text-gray-500 text-xl pt-10">
            Menümüzde şu an mevcut ürün bulunmamaktadır.
          </p>
        ) : (
          <div className="space-y-12">
            {menuData.map((category) => (
              <section
                key={category.id}
                className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500"
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
                  {category.name}
                </h2>

                <div className="space-y-6">
                  {category.items.map((item) => (
                    <article
                      key={item.id}
                      className="flex justify-between items-start border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
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
