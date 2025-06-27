"use client";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function InvalidTokenNotice() {
  useEffect(() => {
    toast.error("Invalid or expired link");
  }, []);

  return <p className="text-red-600">Invalid or expired link.</p>;
}
