// Utility functions for apartment-related operations

/**
 * Badge types for apartment listings
 */
export type BadgeType = 'new' | 'recent' | 'urgent' | 'none';

/**
 * Badge information including styling and display properties
 */
export interface ApartmentBadgeInfo {
  type: BadgeType;
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}

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

/**
 * Gets the appropriate badge information for an apartment based on creation time and publish status
 * @param createdAt - The creation timestamp of the apartment
 * @param published - Whether the apartment is published
 * @returns ApartmentBadgeInfo object with badge details
 */
export const getApartmentBadge = (
  createdAt: string | undefined,
  published: boolean
): ApartmentBadgeInfo => {
  if (!createdAt) {
    return { type: 'none', label: '', variant: 'outline', className: '' };
  }

  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

  // URGENT: Unpublished for more than 48 hours
  if (!published && diffInHours > 48) {
    return {
      type: 'urgent',
      label: 'URGENT',
      variant: 'destructive',
      className: 'bg-red-100 text-red-800 border-red-300',
    };
  }

  // NEW: Less than 24 hours old
  if (diffInHours <= 24) {
    return {
      type: 'new',
      label: 'NEW',
      variant: 'default',
      className: 'bg-green-100 text-green-800 border-green-300',
    };
  }

  // RECENT: Between 24-48 hours old
  if (diffInHours <= 48) {
    return {
      type: 'recent',
      label: 'RECENT',
      variant: 'secondary',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
    };
  }

  return { type: 'none', label: '', variant: 'outline', className: '' };
};

/**
 * Formats a timestamp to relative time (e.g., "2 hours ago", "1 day ago")
 * @param timestamp - The timestamp to format
 * @returns Human-readable relative time string
 */
export const formatRelativeTime = (timestamp: string | undefined): string => {
  if (!timestamp) return 'Unknown';

  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  return date.toLocaleDateString();
};

/**
 * Gets the full formatted date and time for display
 * @param timestamp - The timestamp to format
 * @returns Formatted date and time string
 */
export const formatFullDateTime = (timestamp: string | undefined): string => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
