'use client';

import { useSessionCheck } from '@/hooks/useSessionCheck';

export default function SessionChecker() {
    useSessionCheck();
    return null;
}
