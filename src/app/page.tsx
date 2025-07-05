"use client";

import dynamic from "next/dynamic";

const ConfigPage = dynamic(() => import("./config/ConfigPage"), { ssr: false });

export default function Page() {
  return <ConfigPage />;
}