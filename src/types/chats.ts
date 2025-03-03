
export interface ChatDialogProps {
    agentId: number;
    agentName: string;
}

export interface Message {
    id: number;
    from_id: string;
    to_id: string;
    message: string;
    created_at: string;
    updated_at: string;
}

export interface UserState {
    isLoggedIn: boolean;
    userId?: number;
    token?: string;
}

export interface RootState {
    user: UserState;
}
