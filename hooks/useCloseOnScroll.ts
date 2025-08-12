import { useEffect } from "react";

export function useCloseOnScroll(condition: boolean, close: () => void) {
  useEffect(() => {
    if (!condition) return;

    const handleScroll = () => {
      close();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [condition, close]);
}
