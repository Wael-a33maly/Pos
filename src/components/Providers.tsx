'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { useAppStore } from '@/store';
import { fetchDefaultCurrency, clearCurrencyCache } from '@/lib/currency';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const setCurrency = useAppStore((state) => state.setCurrency);
  const setDecimalPlaces = useAppStore((state) => state.setDecimalPlaces);

  // Initialize currency from settings on app load
  useEffect(() => {
    const initCurrency = async () => {
      try {
        const currency = await fetchDefaultCurrency();
        setCurrency(currency);
        setDecimalPlaces(currency.decimalPlaces);
      } catch (error) {
        console.error('Failed to initialize currency:', error);
      }
    };
    
    initCurrency();
  }, [setCurrency, setDecimalPlaces]);

  // Listen for storage changes (when settings are updated in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pos-storage') {
        // Clear currency cache and re-fetch
        clearCurrencyCache();
        const initCurrency = async () => {
          try {
            const currency = await fetchDefaultCurrency();
            setCurrency(currency);
            setDecimalPlaces(currency.decimalPlaces);
          } catch (error) {
            console.error('Failed to re-initialize currency:', error);
          }
        };
        initCurrency();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setCurrency, setDecimalPlaces]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
