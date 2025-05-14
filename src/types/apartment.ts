export interface Image {
    name: string;
    file_name: string;
    uuid: string;
    preview_url: string;
    original_url: string;
    order: string;
    custom_properties: any[];
    extension: string;
    size: string;
}

export interface Video {
    name: string;
    file_name: string;
    uuid: string;
    preview_url: string;
    original_url: string;
    order: string;
    custom_properties: any[];
    extension: string;
    size: string;
}

export interface Apartment {
    agent_type?: string;
    agent_id?: number;
    agent_phone?: number | string;
    agent_email?: string;
    id?: number;
    agent?: string;
    my_apartment?: boolean;
    business_name?: string;
    business_address?: string;
    business_email?: string;
    business_logo?: string;
    business_phone?: string | number;
    category_id?: string;
    category?: string;
    title?: string;
    description?: string;
    number_of_rooms?: string;
    amount?: string;
    security_deposit?: string;
    security_deposit_currency_code?: string;
    duration?: string;
    amenities?: any[];
    country_code?: string;
    state_code?: string;
    city_code?: string;
    published?: string;
    can_rate?: string;
    can_advertise?: string;
    images?: { [key: string]: Image };
    videos?: { [key: string]: Video };
    thumbnail?: null | string;
    views_count?: number;
    like_apartment?: boolean;
    like_count?: number;
    user?: any
}


export const AVAILABLE_AMENITIES = [
    // 'WiFi',
    // 'Air Conditioning',
    // 'Swimming Pool',
    // 'Gym',
    'New House',
    'Old House',
    'Prepaid Meter',
    'POP',
    'Upstairs',
    'Downstairs',
    'Tiles',
    'Security',
    'Parking',
    'Furnished',
    'Balcony',
    // 'Garden',
    'Pet Friendly',
    // 'Elevator',
    'CCTV',
    // 'Generator',
    'Water Supply',
    'Kitchen'
];

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data: {
        current_page: number;
        data: Apartment[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: PaginationLink[];
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}


export interface FindHomesProps {
    initialData?: ApiResponse;
}

export interface ApartmentCardProps {
    apartment: Apartment;
    onClick: (apartment: Apartment) => void;
}

export interface CategoryTabProps {
    category: string;
    apartments: Apartment[];
    onApartmentClick: (apartment: Apartment) => void;
}


export const filterAmenities = (amenities: any = []) => {
    let parsedAmenities: string[] = [];

    try {
        if (Array.isArray(amenities)) {
            parsedAmenities = amenities;
        } else {
            parsedAmenities = JSON.parse(amenities);
        }
    } catch (error) {
        parsedAmenities = []; // Handle potential parsing errors
    }
    return parsedAmenities;
}


export const allStates = [
    {"Abia": "Abia"},
    {"Adamawa": "Adamawa"},
    {"Akwa Ibom": "Akwa Ibom"},
    {"Anambra": "Anambra"},
    {"Bauchi": "Bauchi"},
    {"Bayelsa": "Bayelsa"},
    {"Benue": "Benue"},
    {"Borno": "Borno"},
    {"Cross River": "Cross River"},
    {"Delta": "Delta"},
    {"Ebonyi": "Ebonyi"},
    {"Edo": "Edo"},
    {"Ekiti": "Ekiti"},
    {"Enugu": "Enugu"},
    {"Gombe": "Gombe"},
    {"Imo": "Imo"},
    {"Federal Capital Territory": "Federal Capital Territory"},
    {"Jigawa": "Jigawa"},
    {"Kaduna": "Kaduna"},
    {"Kano": "Kano"},
    {"Katsina": "Katsina"},
    {"Kebbi": "Kebbi"},
    {"Kogi": "Kogi"},
    {"Kwara": "Kwara"},
    {"Lagos": "Lagos"},
    {"Nasarawa": "Nasarawa"},
    {"Niger": "Niger"},
    {"Ogun": "Ogun"},
    {"Ondo": "Ondo"},
    {"Osun": "Osun"},
    {"Oyo": "Oyo"},
    {"Plateau": "Plateau"},
    {"Rivers": "Rivers"},
    {"Sokoto": "Sokoto"},
    {"Taraba": "Taraba"},
    {"Yobe": "Yobe"},
    {"Zamfara": "Zamfara"}
];