// app/admin/dashboard/layout.tsx
'use client'; // BU SATIR ZORUNLUDUR VE EN ÜSTTE OLMALIDIR

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Oturum Kontrolü
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin');
      } else {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // 2. Oturum Dinleyicisi
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            router.push('/admin');
        } else if (event === 'SIGNED_IN') {
            setLoading(false);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-indigo-600">Yönetici Paneli Yükleniyor...</p>
      </div>
    );
  }

  return <>{children}</>;
}