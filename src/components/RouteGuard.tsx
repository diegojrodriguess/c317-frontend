"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (isAuthorized === null) {
    return null;
  }

  if (!isAuthorized) {
    return null; 
  }

  return <>{children}</>;
}
