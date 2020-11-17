import { useEffect, useRef } from "react";

export function useInterval(cb: Function, delay: number) {
  const savedCB = useRef<Function>();
  useEffect(() => {
    savedCB.current = cb;
  });
  useEffect(() => {
    let id = setInterval(() => {
      if (savedCB.current) {
        savedCB.current();
      }
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}
