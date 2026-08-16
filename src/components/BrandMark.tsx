"use client";

import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";

// Shared logo+wordmark, used on both the landing page nav and the
// authenticated app (Scanner) header — always links back to "/" so it
// behaves as a home button wherever it's placed.
export default function BrandMark({
  logoSize = 34,
  style,
  textStyle,
  className,
  textClassName,
}: {
  logoSize?: number;
  style?: CSSProperties;
  textStyle?: CSSProperties;
  className?: string;
  textClassName?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="VueVocale — retour à l'accueil / back to home"
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        ...style,
      }}
    >
      <Image src="/vuevocale.svg" alt="" width={logoSize} height={logoSize} priority />
      <span className={textClassName} style={textStyle}>
        VueVocale
      </span>
    </Link>
  );
}
