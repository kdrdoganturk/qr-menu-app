
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// --- TYPES ---

type Category = {
  id: string;
  name: string;
  display_order: number;
};

type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  categories: { name: string };
};

// --- LOGOUT BUTTON ---

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-150"
    >
      Çıkış Yap
    </button>
  );
}

// --- CATEGORY MANAGER ---

function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) setError(error.message);
    else setCategories((data as Category[]) || []);

    setLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from('categories')
      .insert({ name: newCategoryName });

    if (error) setError(error.message);
    else {
      setNewCategoryName('');
      fetchCategories();
    }

    setLoading(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    setLoading(true);

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) setError(error.message);
    else fetchCategories();

    setLoading(false);
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-indigo-700">
        Kategoriler (Çorbalar, Tatlılar vb.)
      </h3>

      {error && (
        <p className="text-red-500 mb-4 bg-red-100 p-2 rounded">Hata: {error}</p>
      )}

      <form onSubmit={handleAddCategory} className="flex space-x-3 mb-6">
        <input
          type="text"
          placeholder="Yeni Kategori Adı"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-grow p-3 border rounded-md focus:border-indigo-500"
          required
        />
        <button
          type="submit"
          disabled={loading || !newCategoryName.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </form>

      <ul className="space-y-3">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex justify-between items-center bg-gray-50 p-3 rounded-md border"
          >
            <span className="font-medium text-gray-800">{category.name}</span>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-500 hover:text-red-700 font-semibold text-sm transition"
              disabled={loading}
            >
              Sil
            </button>
          </li>
        ))}
        {categories.length === 0 && !loading && (
          <p className="text-gray-500">Henüz kategori yok.</p>
        )}
      </ul>
    </div>
  );
}

// --- MENU ITEM MANAGER ---

function MenuItemManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    is_available: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const { data: categoryData, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .order('display_order', { ascending: true });

    if (catError) {
      setError(catError.message);
      setLoading(false);
      return;
    }

    setCategories(categoryData || []);

    if (categoryData && categoryData.length > 0 && !newItem.category_id) {
      setNewItem((p) => ({ ...p, category_id: categoryData[0].id }));
    }

    const { data: itemData, error: itemError } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price,
        is_available,
        category_id,
        categories (name)
      `)
      .order('name', { ascending: true });

    if (itemError) setError(itemError.message);
    else setMenuItems(itemData || []);

    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.name || !newItem.category_id || newItem.price <= 0) {
      setError('Lütfen tüm alanları doğru doldurun.');
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase
      .from('menu_items')
      .insert({
        ...newItem,
        price: Number(newItem.price),
        description: newItem.description || null,
      });

    if (insertError) setError(insertError.message);
    else {
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category_id: categories[0]?.id || '',
        is_available: true,
      });
      fetchData();
    }

    setLoading(false);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Bu menü öğesini silmek istediğinize emin misiniz?')) return;

    setLoading(true);

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) setError(error.message);
    else fetchData();

    setLoading(false);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    setLoading(true);

    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);

    if (error) setError(error.message);
    else fetchData();

    setLoading(false);
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-indigo-700">
        Menü Öğeleri
      </h3>

      {error && (
        <p className="text-red-500 mb-4 bg-red-100 p-2 rounded">Hata: {error}</p>
      )}

      {/* Form */}
      <form onSubmit={handleAddItem} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Ürün Adı"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="w-full p-3 border rounded-md"
        />

        <textarea
          placeholder="Açıklama (Opsiyonel)"
          value={newItem.description}
          onChange={(e) =>
            setNewItem({ ...newItem, description: e.target.value })
          }
          className="w-full p-3 border rounded-md"
        />

        <input
          type="number"
          placeholder="Fiyat"
          value={newItem.price}
          onChange={(e) =>
            setNewItem({ ...newItem, price: Number(e.target.value) })
          }
          className="w-full p-3 border rounded-md"
        />

        {/* Category select */}
        <select
          value={newItem.category_id}
          onChange={(e) =>
            setNewItem({ ...newItem, category_id: e.target.value })
          }
          className="w-full p-3 border rounded-md"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-md w-full"
          disabled={loading}
        >
          Ekle
        </button>
      </form>

      {/* Ürün Listesi */}
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center bg-gray-50 p-4 rounded-md border"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">
                {item.categories?.name} — {item.price}₺
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleToggleAvailability(item)}
                className={`px-3 py-1 rounded text-white ${
                  item.is_available ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                {item.is_available ? 'Mevcut' : 'Kapalı'}
              </button>

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- MAIN PAGE ---

export default function AdminDashboardPage() {
  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-lg shadow-xl">
          <h1 className="text-4xl font-extrabold text-gray-800">
            🍽️ Yönetici Paneli
          </h1>
          <LogoutButton />
        </div>

        <CategoryManager />
        <MenuItemManager />
      </div>
    </div>
  );
}