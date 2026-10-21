"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AdminLoginRouteStyle() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.toggle(
      "admin-login-active",
      pathname === "/admin/login",
    );
  }, [pathname]);

  return null;
}
