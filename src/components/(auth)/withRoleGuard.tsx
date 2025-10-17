'use client'

import { ComponentType } from 'react'
import { ProtectedRoute } from './ProtectedRoute'

export function withRoleGuard<P extends object>(
  Component: ComponentType<P>,
  allowedRoles?: string[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}