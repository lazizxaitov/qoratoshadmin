"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/content");
  }, [router]);

  return null;
}
