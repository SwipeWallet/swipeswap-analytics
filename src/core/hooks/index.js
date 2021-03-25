import { useEffect, useRef, useState } from "react";

export function useInterval(callback, delay) {
  const ref = useRef();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      ref.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const DEFAULT_REFRESH = 60 * 1000
export function useProps(init, fetch, interval) {
  const [props, setProps] = useState(init);
  const refresh = () => fetch(props => setProps(props));
  useInterval(() => refresh(), interval || DEFAULT_REFRESH);
  return [props, refresh];
}