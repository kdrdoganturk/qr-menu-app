'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// TYPES
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

// LOGOUT BUTTON
function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  return (
    <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={handleLogout}>
      Çıkış Yap
    </button>
  );
}

// CATEGORY MANAGER
function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-3">Kategoriler</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Kategori adı"
        />

        <button
          className="bg-indigo-500 text-white px-3 py-2 rounded"
          onClick={async () => {
            if (!newCategoryName) return;

            await supabase.from('categories').insert({ name: newCategoryName });
            setNewCategoryName('');
            fetchCategories();
          }}
        >
          Ekle
        </button>
      </div>

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex justify-between border p-2 rounded">
            {c.name}
            <button
              className="text-red-500"
              onClick={async () => {
                await supabase.from('categories').delete().eq('id', c.id);
                fetchCategories();
              }}
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// MENU ITEM MANAGER
function MenuItemManager() {
  return (
    <div className="mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-3">Menü Öğeleri</h2>
      {/* Buraya yönetim kodun eklenir */}
    </div>
  );
}

// MAIN PAGE
export default function AdminDashboardPage() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center bg-white p-6 rounded shadow">
          <h1 className="text-4xl font-bold">🍽️ Yönetici Paneli</h1>
          <LogoutButton />
        </div>

        <CategoryManager />
        <MenuItemManager />

      </div>
    </div>
  );
}
