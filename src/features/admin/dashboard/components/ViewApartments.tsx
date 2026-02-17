'use client'
import React, {useEffect, useState, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog, DialogContent, DialogHeader, DialogTrigger,} from '@/components/ui/dialog';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {type Apartment, deleteApartment, getAllApartments, publishApartment} from '../api/get-all-apartments';
import {ChevronLeft, ChevronRight, Pencil, Search, Clock, Sparkles, AlertCircle, Calendar} from 'lucide-react';
import Link from "next/link";
import {DialogDescription} from '@radix-ui/react-dialog';
import {RootState} from "@/redux/store";
import {Badge} from "@/components/ui/badge";
import {getApartmentBadge, formatRelativeTime, formatFullDateTime} from "@/lib/apartment-utils";
import {useDebounce} from 'use-debounce';

interface DateFilterOption {
    value: 'all' | '24h' | '7d' | '30d';
    label: string;
    description: string;
}

const dateFilterOptions: DateFilterOption[] = [
    { value: 'all', label: 'All Time', description: 'Show all apartments' },
    { value: '24h', label: 'Last 24 Hours', description: 'Show new uploads' },
    { value: '7d', label: 'Last 7 Days', description: 'Show recent uploads' },
    { value: '30d', label: 'Last 30 Days', description: 'Show this month' },
];

const ViewApartmentEnhanced = () => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
    const [sortByRecent, setSortByRecent] = useState(true);
    const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
    const [filteredCount, setFilteredCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [publishedFilter, setPublishedFilter] = useState<string>('all');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [roomsFilter, setRoomsFilter] = useState<string>('');
    
    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
    const token = useSelector((state: RootState) => state.auth.token);

    const fetchApartments = async () => {
        try {
            setLoading(() => true);
            const response = await getAllApartments(currentPage, debouncedSearchTerm, token, sortByRecent, dateFilter, categoryFilter, minPrice, maxPrice, roomsFilter, publishedFilter);

            if (response.success && response.data) {
                let apartmentData = Object.values(response.data.data) as Apartment[];
                
                setApartments(apartmentData);
                setTotalPages(response.data.last_page);
                setFilteredCount(response.data.filtered_count || response.data.total);
                setTotalCount(response.data.total_count || response.data.total);
            } else {
                throw new Error('Invalid response format');
            }

            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch apartments');
            setApartments([]);
        } finally {
            setLoading(() => false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchApartments().then(r => r);
        }
    }, [currentPage, debouncedSearchTerm, isLoggedIn, sortByRecent, dateFilter, categoryFilter, minPrice, maxPrice, roomsFilter, publishedFilter]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this apartment?')) {
            try {
                await deleteApartment(id);
                await fetchApartments();
            } catch (err: any) {
                setError(err.message || 'Failed to delete apartment');
            }
        }
    };

    const handlePublish = async (id: number, dir: boolean) => {
        if (window.confirm('Please Confirm Action')) {
            try {
                await publishApartment(id, dir);
                await fetchApartments();
            } catch (err: any) {
                setError(err.message || 'Failed to update apartment');
            }
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleDateFilterChange = (value: string) => {
        setDateFilter(value as 'all' | '24h' | '7d' | '30d');
        setCurrentPage(1);
    };

    // Get row styling based on badge type
    const getRowClassName = (apartment: Apartment) => {
        const badgeInfo = getApartmentBadge(apartment.created_at, apartment.published);
        
        switch (badgeInfo.type) {
            case 'new':
                return 'bg-green-50/50 hover:bg-green-100/50';
            case 'urgent':
                return 'bg-red-50/50 hover:bg-red-100/50';
            default:
                return 'hover:bg-gray-50';
        }
    };

    // Get title styling based on badge type
    const getTitleClassName = (apartment: Apartment) => {
        const badgeInfo = getApartmentBadge(apartment.created_at, apartment.published);
        return badgeInfo.type === 'new' || badgeInfo.type === 'urgent' ? 'font-bold' : 'font-normal';
    };

    if (!isLoggedIn) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Please log in to view apartments
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 space-y-4">
                <div className="flex gap-4 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Search Apartments..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    
                    <Input
                        type="text"
                        placeholder="Category ID"
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                        className="w-32"
                    />
                    
                    <Input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                        className="w-32"
                    />
                    
                    <Input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                        className="w-32"
                    />
                    
                    <Input
                        type="number"
                        placeholder="Rooms"
                        value={roomsFilter}
                        onChange={(e) => { setRoomsFilter(e.target.value); setCurrentPage(1); }}
                        className="w-24"
                    />
                    
                    <Select value={publishedFilter} onValueChange={(v) => { setPublishedFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="unpublished">Unpublished</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                            {dateFilterOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex flex-col">
                                        <span>{option.label}</span>
                                        <span className="text-xs text-muted-foreground">{option.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Button
                        variant={sortByRecent ? "default" : "outline"}
                        onClick={() => setSortByRecent(!sortByRecent)}
                        className="flex items-center gap-2"
                    >
                        <Clock className="h-4 w-4" />
                        {sortByRecent ? "Newest First" : "Sort by Date"}
                    </Button>
                </div>
                
                {!loading && (
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-semibold">{filteredCount}</span> of <span className="font-semibold">{totalCount}</span> apartments
                    </div>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : !Array.isArray(apartments) || apartments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No apartments found
                                </TableCell>
                            </TableRow>
                        ) : (apartments.map((apartment:Apartment) => {
                            const badgeInfo = getApartmentBadge(apartment.created_at, apartment.published);
                            const relativeTime = formatRelativeTime(apartment.created_at);
                            const fullDateTime = formatFullDateTime(apartment.created_at);
                            
                            return (
                                <TableRow key={apartment.id} className={getRowClassName(apartment)}>
                                    <TableCell>
                                        <div className='w-14 h-14 rounded-md overflow-hidden'>
                                            <img
                                                src={Object.values(apartment.images)[0]?.original_url || '/api/placeholder/400/300'}
                                                alt={apartment.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="link"
                                                    onClick={() => setSelectedApartment(apartment)}
                                                    className={`flex items-center gap-2 p-0 h-auto ${getTitleClassName(apartment)}`}
                                                >
                                                    {apartment.title}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogDescription className="flex items-center gap-2">
                                                        {apartment.title}
                                                        {badgeInfo.type !== 'none' && (
                                                            <Badge variant={badgeInfo.variant} className={`${badgeInfo.className} text-xs`}>
                                                                {badgeInfo.type === 'new' && <Sparkles className="h-3 w-3 mr-1" />}
                                                                {badgeInfo.type === 'urgent' && <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />}
                                                                {badgeInfo.type === 'recent' && <Clock className="h-3 w-3 mr-1" />}
                                                                {badgeInfo.label}
                                                            </Badge>
                                                        )}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <img
                                                            src={Object.values(apartment.images)[0]?.original_url || '/api/placeholder/400/300'}
                                                            alt={apartment.title}
                                                            className="w-full rounded-lg"
                                                        />
                                                        <div>
                                                            <h3 className="font-semibold mb-2">Details</h3>
                                                            <p><strong>Category:</strong> {apartment.category}</p>
                                                            <p><strong>Rooms:</strong> {apartment.number_of_rooms}</p>
                                                            <p><strong>Price:</strong> {apartment.amount}</p>
                                                            <p><strong>Duration:</strong> {apartment.duration}</p>
                                                            <p>
                                                                <strong>Location:</strong> {apartment.city_code}, {apartment.state_code}
                                                            </p>
                                                            <p><strong>Agent:</strong> {apartment.agent}</p>
                                                            <p><strong>Agent Email:</strong> {apartment.agent_email}</p>
                                                            {apartment.created_at && (
                                                                <p title={fullDateTime}>
                                                                    <strong>Uploaded:</strong> {relativeTime}
                                                                </p>
                                                            )}
                                                            <p>
                                                                <strong>Status:</strong> 
                                                                <Badge variant={apartment.published ? "default" : "secondary"} className="ml-2 text-xs">
                                                                    {apartment.published ? "Published" : "Pending Review"}
                                                                </Badge>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Description</h3>
                                                        <p>{apartment.description}</p>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                    <TableCell>{apartment.category}</TableCell>
                                    <TableCell>{`${apartment.city_code}, ${apartment.state_code}`}</TableCell>
                                    <TableCell>{apartment.amount}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={apartment.published ? "default" : "secondary"} className="text-xs">
                                                {apartment.published ? "Published" : "Pending"}
                                            </Badge>
                                            {badgeInfo.type !== 'none' && (
                                                <Badge variant={badgeInfo.variant} className={`${badgeInfo.className} text-xs flex items-center gap-1`}>
                                                    {badgeInfo.type === 'new' && <Sparkles className="h-3 w-3" />}
                                                    {badgeInfo.type === 'urgent' && <AlertCircle className="h-3 w-3 animate-pulse" />}
                                                    {badgeInfo.type === 'recent' && <Clock className="h-3 w-3" />}
                                                    {badgeInfo.label}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm" title={fullDateTime}>
                                            {relativeTime}
                                        </div>
                                    </TableCell>
                                    <TableCell className={'flex gap-2'}>
                                        <Link className={"mt-1 px-3 py-1 text-center border-1 border-gray-200"}
                                              href={"/admin/dashboard/edit-apartment/" + apartment.id}>
                                            <Pencil className="h-4 w-4"/>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className='bg-red-500 text-white px-4 py-1 rounded-md'
                                            onClick={() => handleDelete(apartment.id)}
                                        >
                                            Delete
                                        </Button>
                                        {
                                            !apartment.published ? <Button
                                                variant="outline"
                                                size="sm"
                                                className='bg-green-500 text-white px-4 py-1 rounded-md'
                                                onClick={() => handlePublish(apartment.id, true)}
                                            >
                                                Publish
                                            </Button> : <Button
                                                variant="outline"
                                                size="sm"
                                                className='bg-red-500 text-white px-4 py-1 rounded-md'
                                                onClick={() => handlePublish(apartment.id, false)}
                                            >
                                                UnPublish
                                            </Button>
                                        }
                                    </TableCell>
                                </TableRow>
                            );
                        })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-center space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4"/>
                </Button>
                <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
};

export default ViewApartmentEnhanced;
