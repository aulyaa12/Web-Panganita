"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NitaChatScreen from "@/components/chat/NitaChatScreen";

export default function BuNitaPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!mounted) return;

        if (!session) {
          router.replace("/masuk");
          return;
        }

        setIsLoggedIn(true);
      } catch (error) {
        console.error("Gagal memeriksa sesi:", error);

        if (mounted) {
          router.replace("/masuk");
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session) {
        setIsLoggedIn(false);
        router.replace("/masuk");
      } else {
        setIsLoggedIn(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checkingAuth || !isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5faf6]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-panganita-100 border-t-panganita-700" />
          <p className="text-sm text-gray-600">Menyiapkan Bu Nita...</p>
        </div>
      </main>
    );
  }

  return <NitaChatScreen />;
}
