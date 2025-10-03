import { useCallback, useRef } from 'react';

// Custom hook for stable callback references
export const useStableCallback = <T extends (...args: any[]) => any>(callback: T): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
};

// Custom hook for preventing unnecessary re-renders
export const useShallowMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
  const prevDeps = useRef<React.DependencyList>();
  const memoizedValue = useRef<T>();

  const depsChanged = !prevDeps.current || 
    deps.length !== prevDeps.current.length ||
    deps.some((dep, index) => dep !== prevDeps.current![index]);

  if (depsChanged) {
    memoizedValue.current = factory();
    prevDeps.current = deps;
  }

  return memoizedValue.current!;
};