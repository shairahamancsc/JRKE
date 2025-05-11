
"use client";

import type { Dispatch, SetStateAction} from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';

function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  delay: number = 500
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isMountedRef = useRef(false); 

  useEffect(() => {
    isMountedRef.current = true; 
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        setStoredValue(initialValue); 
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      try {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      } catch (setError) {
         console.error(`Error setting initial localStorage key "${key}":`, setError);
      }
      setStoredValue(initialValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); 

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const persistValue = useCallback((valueToPersist: T) => {
    if (typeof window !== 'undefined' && isMountedRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToPersist));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }, delay);
    }
  }, [key, delay]);

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore); 
    persistValue(valueToStore);
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [storedValue, setValue];
}

export default useDebouncedLocalStorage;
