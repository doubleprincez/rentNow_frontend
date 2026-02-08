'use client'
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ACCOUNT_TYPES } from '@/lib/authUtils';

export function AuthDebugger() {
    const auth = useSelector((state: RootState) => state.auth);

    if (process.env.NODE_ENV !== 'development') return null;

    const getAccountTypeName = (id: number | null) => {
        switch (id) {
            case ACCOUNT_TYPES.USER: return 'User';
            case ACCOUNT_TYPES.AGENT: return 'Agent';
            case ACCOUNT_TYPES.PARTNER: return 'Partner';
            case ACCOUNT_TYPES.ADMIN: return 'Admin';
            case ACCOUNT_TYPES.APP_ADMIN: return 'App Admin';
            default: return 'None';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
            <div className="font-bold mb-2 text-yellow-400">🔐 Auth Debug</div>
            <div className="space-y-1">
                <div>
                    <span className="text-gray-400">Status:</span>{' '}
                    <span className={auth.isLoggedIn ? 'text-green-400' : 'text-red-400'}>
                        {auth.isLoggedIn ? '✓ Logged In' : '✗ Logged Out'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400">Type:</span>{' '}
                    <span className="text-blue-400">{getAccountTypeName(auth.account_id)}</span>
                </div>
                <div>
                    <span className="text-gray-400">ID:</span>{' '}
                    <span className="text-purple-400">{auth.account_id || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-gray-400">User:</span>{' '}
                    <span className="text-cyan-400">
                        {auth.firstName || auth.email || 'N/A'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400">Token:</span>{' '}
                    <span className="text-orange-400">
                        {auth.token ? `${auth.token.substring(0, 10)}...` : 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    );
}
