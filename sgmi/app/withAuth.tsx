"use client";

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import React, { ComponentType, useEffect } from 'react';

export const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  const WithAuthComponent = (props: P) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.replace('/login');
      }
    }, [isAuthenticated, loading, router]);

    // Mientras carga, no renderizar nada o mostrar un spinner
    if (loading || !isAuthenticated) {
      return null; // O un spinner de carga global
    }

    return <WrappedComponent {...props} />;
  };

  // Asignar un nombre para facilitar el debugging
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
};
