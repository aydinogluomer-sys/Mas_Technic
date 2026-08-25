import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const CustomerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setState(session ? "authenticated" : "unauthenticated");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "authenticated" : "unauthenticated");
    });

    check();
    return () => subscription.unsubscribe();
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "unauthenticated") {
    return <Navigate to="/giris" replace />;
  }

  return <>{children}</>;
};
