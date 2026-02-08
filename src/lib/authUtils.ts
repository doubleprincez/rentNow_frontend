export const ACCOUNT_TYPES = {
    USER: 1,
    AGENT: 2,
    PARTNER: 3,
    ADMIN: 4,
    APP_ADMIN: 5,
} as const;

export const getDashboardRoute = (account_id: number | null): string => {
    switch (account_id) {
        case ACCOUNT_TYPES.USER:
            return '/dashboard';
        case ACCOUNT_TYPES.AGENT:
            return '/agents/dashboard';
        case ACCOUNT_TYPES.PARTNER:
            return '/partners/dashboard';
        case ACCOUNT_TYPES.ADMIN:
        case ACCOUNT_TYPES.APP_ADMIN:
            return '/admin/dashboard';
        default:
            return '/';
    }
};

export const getLoginRoute = (account_id: number): string => {
    switch (account_id) {
        case ACCOUNT_TYPES.USER:
            return '/auth/login';
        case ACCOUNT_TYPES.AGENT:
            return '/agents/auth/login';
        case ACCOUNT_TYPES.PARTNER:
            return '/partners/auth/login';
        case ACCOUNT_TYPES.ADMIN:
        case ACCOUNT_TYPES.APP_ADMIN:
            return '/admin/auth/login';
        default:
            return '/auth/login';
    }
};

export const canAccessRoute = (userAccountId: number | null, requiredAccountId: number): boolean => {
    return userAccountId === requiredAccountId;
};
