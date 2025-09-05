// src/types/next.d.ts
import type React from "react";

declare module "next" {
  /**
   * ✅ Corrige LayoutProps pour Next.js App Router
   * params est un objet simple (pas une Promise)
   */
  export interface LayoutProps<T extends Record<string, string> = Record<string, string>> {
    children: React.ReactNode;
    params: T;
  }

  /**
   * ✅ Corrige PageProps pour Next.js App Router
   */
  export interface PageProps<T extends Record<string, string> = Record<string, string>> {
    params: T;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}
