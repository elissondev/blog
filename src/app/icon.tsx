import { ImageResponse } from "next/og";
import { Leaf } from "lucide-react";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#26774d",
        borderRadius: 14,
      }}
    >
      <Leaf color="#ffffff" size={42} strokeWidth={2.25} />
    </div>,
    size,
  );
}
