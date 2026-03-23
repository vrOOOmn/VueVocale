"use client";

import React, { useEffect, useState } from "react";
import ClassAccessGate from "./ClassAccessGate";

type Props = {
  onAuthorized: () => void;
};

export default function ClassAccessGateClient({ onAuthorized }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return <ClassAccessGate onAuthorized={onAuthorized} />;
}
