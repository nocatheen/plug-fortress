import { useEffect } from "react";

export function useScrollToBottom(element: HTMLDivElement | null, data: any) {
  const scrollToBottom = () => {
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [data]);
}