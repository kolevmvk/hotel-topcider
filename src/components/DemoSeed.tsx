"use client";

import { useEffect } from "react";
import { ensureDemoData } from "@/lib/seedDemo";

export default function DemoSeed() {
  useEffect(() => {
    ensureDemoData();
  }, []);

  return null;
}
