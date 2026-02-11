export interface Base {
    id: string | number;
    createdAt?: string;
    updatedAt?: string
}

export interface Pagination {
    currentPage?: number;
    hasMorePages?: boolean;
    lastPage?: number;
    perPage?: number;
    total?: number;
}

export interface PageDataFilter {
    limit?: number;
    page?: number;
    order?: string;
    search?: string;
}