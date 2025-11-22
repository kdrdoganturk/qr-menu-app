// app/admin/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ---------------- TYPES ----------------

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

// ---------------- LOGOUT BUTTON ----------------

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
    >
      Çıkış Yap
    </button>
  );
}

// ---------------- CATEGORY MANAGER ----------------

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
    else setCategories(data || []);

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
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

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
    <div className="mt-8 bg-white p-6 rounded-lg shadow">
      <h3 className="text-2xl font-semibold mb-4">Kategoriler</h3>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Yeni kategori adı..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 border p-3 rounded"
        />
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 rounded"
        >
          Ekle
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="flex justify-between p-3 border rounded">
            {cat.name}
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="text-red-500"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- MENU ITEM MANAGER ----------------

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

    const { data: catData } = await supabase
      .from('categories')
      .select('id, name')
      .order('display_order', { ascending: true });

    setCategories(catData || []);

    if (catData && catData.length > 0 && !newItem.category_id) {
      setNewItem((prev) => ({ ...prev, category_id: catData[0].id }));
    }

    const { data: itemData } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price,
        is_available,
        category_id,
        categories(name)
      `);

    setMenuItems(itemData || []);
    setLoading(false);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.name || newItem.price <= 0)
      return setError('Lütfen tüm alanları doldurun.');

    const { error } = await supabase.from('menu_items').insert({
      ...newItem,
      description: newItem.description || null,
      price: Number(newItem.price),
    });

    if (error) return setError(error.message);

    setNewItem({
      name: '',
      description: '',
      price: 0,
      category_id: categories[0]?.id || '',
      is_available: true,
    });

    fetchData();
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Ürünü silmek istiyor musunuz?")) return;

    await supabase.from('menu_items').delete().eq('id', id);
    fetchData();
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);

    fetchData();
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow">
      <h3 className="text-2xl font-semibold mb-4">Menü Öğeleri</h3>

      {error && <p className="text-red-500">{error}</p>}

      {/* Yeni Ürün Ekle */}
      <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-3 mb-6">
        <input
          type="text"
          placeholder="Ürün adı"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="border p-3 rounded"
        />

        <textarea
          placeholder="Açıklama (opsiyonel)"
          value={newItem.description || ''}
          onChange={(e) =>
            setNewItem({ ...newItem, description: e.target.value })
          }
          className="border p-3 rounded"
        />

        <input
          type="number"
          placeholder="Fiyat"
          value={newItem.price}
          onChange={(e) =>
            setNewItem({ ...newItem, price: Number(e.target.value) })
          }
          className="border p-3 rounded"
        />

        <select
          value={newItem.category_id}
          onChange={(e) =>
            setNewItem({ ...newItem, category_id: e.target.value })
          }
          className="border p-3 rounded"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="bg-indigo-500 text-white py-2 rounded">
          Ekle
        </button>
      </form>

      {/* Ürün Listesi */}
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id} className="p-3 border rounded flex justify-between">
            <div>
              <div className="font-bold">{item.name}</div>
              <div className="text-gray-500">{item.categories?.name}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleToggleAvailability(item)}
                className={
                  item.is_available ? "text-green-600" : "text-gray-400"
                }
              >
                {item.is_available ? "Aktif" : "Pasif"}
              </button>

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="text-red-500"
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

// ---------------- PAGE EXPORT (EN ÖNEMLİ KISIM) ----------------

export default function AdminDashboardPage() {
  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow mb-10">
          <h1 className="text-3xl font-bold">🍽️ Yönetici Paneli</h1>
          <LogoutButton />
        </div>

        <CategoryManager />
        <MenuItemManager />

      </div>
    </div>
  );
}
