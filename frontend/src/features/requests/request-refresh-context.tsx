'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface RequestRefreshContextValue {
  refreshVersion: number;
  refreshRequests: () => void;
}

const RequestRefreshContext = createContext<RequestRefreshContextValue | null>(null);

export function RequestRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refreshRequests = useCallback(() => setRefreshVersion((version) => version + 1), []);
  const value = useMemo(() => ({ refreshVersion, refreshRequests }), [refreshVersion, refreshRequests]);

  return <RequestRefreshContext.Provider value={value}>{children}</RequestRefreshContext.Provider>;
}

export function useRequestRefresh(): RequestRefreshContextValue {
  const context = useContext(RequestRefreshContext);
  if (!context) throw new Error('useRequestRefresh must be used inside <RequestRefreshProvider>');
  return context;
}
