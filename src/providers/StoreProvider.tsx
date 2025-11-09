"use client";

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from '../redux/store'
import { useRouter, usePathname } from 'next/navigation'
import { getRouteByRole } from '@/constants/roles'
import { AuthUser } from '@/types/user.type'

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBeforeLift = () => {
    try {
      const state = store.getState()
      const auth = state.auth

      if (auth?.accessToken && (auth?.user as AuthUser)?.role) {
        const redirectUrl = getRouteByRole((auth?.user as AuthUser)?.role || undefined)

        if (pathname !== redirectUrl) {
          router.push(redirectUrl)
        }
      }
    } catch (err) {
      console.error('Redirect after persist failed:', err)
    }
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} onBeforeLift={handleBeforeLift}>
        {children}
      </PersistGate>
    </Provider>
  );
};
