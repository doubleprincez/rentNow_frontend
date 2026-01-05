'use client'
import React from 'react';
import { useSelector } from 'react-redux';
import ProductMediaViewer from './ProductMediaViewer';
import type { Apartment } from '@/types/apartment';

interface ProductMediaViewerWrapperProps {
  apartment: Apartment;
}

/**
 * Client-side wrapper for ProductMediaViewer that connects to Redux store
 * This allows the server component page to pass apartment data while
 * the wrapper handles client-side user state from Redux
 */
export default function ProductMediaViewerWrapper({ apartment }: ProductMediaViewerWrapperProps) {
  const { isLoggedIn, token, isSubscribed } = useSelector((state: any) => state.user);

  return (
    <ProductMediaViewer
      apartment={apartment}
      isLoggedIn={isLoggedIn}
      isSubscribed={isSubscribed}
      token={token}
    />
  );
}
