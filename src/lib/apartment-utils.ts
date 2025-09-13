// Utility functions for apartment-related operations

/**
 * Checks if an apartment was uploaded recently (within last 48 hours)
 * @param createdAt - The creation timestamp of the apartment
 * @returns boolean indicating if the apartment is recently uploaded
 */
export const isRecentlyUploaded = (createdAt: string | undefined): boolean => {
    if (!createdAt) return false;
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 48;
};

/**
 * Checks if an apartment should show as "New" based on either the new flag or recent upload
 * @param apartment - The apartment object
 * @returns boolean indicating if the apartment should show as new
 */
export const shouldShowAsNew = (apartment: { new?: boolean; created_at?: string }): boolean => {
    return apartment?.new === true || isRecentlyUploaded(apartment?.created_at);
};
