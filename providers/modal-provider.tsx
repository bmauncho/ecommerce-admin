"use client";

import { StoreModal } from "@/components/modals/store-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Wrap in a timeout to avoid synchronous setState in effect
    const timeout = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  if (!isMounted) return null;
  // Prevent hydration mismatch
  return (
    <>
      <StoreModal />
    </>
  );
};
