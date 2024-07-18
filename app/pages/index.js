import React from "react";
import dynamic from "next/dynamic";

const ModelViewer = dynamic(
  () => import("@/src/components/Viewer/ModelViewer"),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
        <ModelViewer />
      </div>
    </>
  );
}