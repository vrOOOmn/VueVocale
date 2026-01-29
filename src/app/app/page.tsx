"use client";

import App from "../../App";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AppPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (!data.session) {
        window.location.href = "/signin";
        return;
      }
      setReady(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="auth">
        <div className="auth-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return <App />;
}
