"use client";

import { useEffect, useState } from "react";
import { content as fallbackContent } from "../app/content/seed";

export type ContentShape = typeof fallbackContent;

export function useContent() {
  const [contentData, setContentData] = useState<ContentShape>(fallbackContent);

  useEffect(() => {
    let isActive = true;
    fetch("/api/content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isActive || !data?.content) {
          return;
        }
        setContentData(data.content as ContentShape);
      })
      .catch(() => {
        // Keep fallback content on errors.
      });

    return () => {
      isActive = false;
    };
  }, []);

  return contentData;
}
