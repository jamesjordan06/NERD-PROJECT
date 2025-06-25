"use client";

import Image from "next/image";
import { HERO_URL } from "../lib/assets";

export default function Hero() {
  return (
    <section className="w-full relative">
      <Image
        src={HERO_URL}
        alt="Galaxy hero"
        width={1920}
        height={800}
        className="h-96 w-full object-cover"
        priority
      />
    </section>
  );
}
