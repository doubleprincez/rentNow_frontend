'use client';
import React, {useCallback, useEffect, useState} from 'react'; // ADD THIS LINE
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Banknote, Clock, MapPin} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {baseURL} from "@/../next.config";
import type {Apartment, ApartmentCardProps, ApiResponse, FindHomesProps} from '@/types/apartment';
import {AVAILABLE_AMENITIES} from "@/types/apartment";
import {AxiosApi} from '@/lib/utils';
import {useDebounce} from 'use-debounce';
import {shouldShowAsNew} from "@/lib/apartment-utils";

const ApartmentCard: React.FC<ApartmentCardProps> = ({apartment, onClick}) => (
    <div
        className="flex flex-col gap-4 p-2 md:p-4 bg-white shadow-md rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onClick(apartment)}
    >
        <div className="flex flex-col gap-2 relative">
            {
                shouldShowAsNew(apartment) ? <span
                    className={"absolute -top-1.5 -right-1.5 text-green-700 font-bold bg-white z-10 rotate-12 p-0.5"}>New</span> : ''
            }
            <div className="flex w-full h-[200px] rounded-lg overflow-hidden ">
                <img
                    src={apartment?.images && Object.values(apartment?.images)[0]?.preview_url || '/placeholder.jpg'}
                    alt={apartment.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-[.9em] mdl:text-[1.2em] font-semibold text-gray-700">{apartment.title}</p>
                <div className="flex items-center gap-2">
                    <MapPin className="text-orange-500" size={16}/>
                    <p className="text-[.7em] mdl:text-[.9em] text-gray-600">{`${apartment.city_code}`}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Banknote className="text-orange-500" size={16}/>
                    <p className="text-[.7em] mdl:text-[.9em] text-gray-600">{apartment.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="text-orange-500" size={16}/>
                    <p className="text-[.7em] mdl:text-[.9em] text-gray-600">{apartment.duration}</p>
                </div>
            </div>
        </div>
    </div>
);

const FindHomes: React.FC<FindHomesProps> = ({initialData}) => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(!initialData);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [page, setPage] = useState<number>(1); // For pagination

    // Filter states
    const [stateCodeFilter, setStateCodeFilter] = useState<string>('');
    const [cityCodeFilter, setCityCodeFilter] = useState<string>('');
    const [amenitiesFilter, setAmenitiesFilter] = useState<string>('');
    const [filterName, setFilterName] = useState<string>('');
    const [filterDir, setFilterDir] = useState<string>('eq');
    const [filterVal, setFilterVal] = useState<string>('');

    // Debounced values
    const [debouncedStateCode] = useDebounce(stateCodeFilter, 500);
    const [debouncedCityCode] = useDebounce(cityCodeFilter, 500);

    const fetchApartments = useCallback(async () => {
        setIsLoading(true);
        let url = `${baseURL}/apartments?page=${page}&`; // Include pagination

        if (debouncedStateCode) url += `state_code=${debouncedStateCode}&`;
        if (debouncedCityCode) url += `city_code=${debouncedCityCode}&`;
        if (amenitiesFilter) url += `amenities=${amenitiesFilter}&`;
        if (filterName && filterDir && filterVal) url += `filter_name=${filterName}&filter_dir=${filterDir}&filter_val=${filterVal}&`;

        url = url.slice(0, -1);

        try {
            const response = await AxiosApi().get<ApiResponse>(url);
            const data = response.data;
            const record: Apartment[] = Object.values(data?.data?.data) as Apartment[];
            if (data.success && record) {
                // console.log('merging ', apartments, record);
                setApartments(prev => page === 1 ? record : [...prev, ...record]); // Handle pagination
                const uniqueCategories = [...new Set(record.map((apt: any) => apt.category))].filter((c): c is string => !!c);
                setCategories(uniqueCategories);
                // Potentially update total count and other pagination info here if needed
            } else {
                setError(data.message || 'Failed to fetch apartments');
            }
        } catch (error) {
            setError('Failed to fetch apartments');
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedStateCode, debouncedCityCode, amenitiesFilter, filterName, filterDir, filterVal]);


    useEffect(() => {
        if (initialData?.data) {
            // setApartments(initialData?.data?.data);
            // const uniqueCategories = [...new Set(initialData?.data.map(apt => apt.category))]
            //     .filter((category): category is string => category !== undefined);
            // setCategories(uniqueCategories);
            return;
        }
        fetchApartments().then(r => r); // Use debounced fetch
    }, [initialData, fetchApartments, debouncedStateCode, debouncedCityCode]);

    const handleApartmentClick = (apartment: Apartment) => {
        router.push(`/find-homes/${apartment.id}`);
    };

    const handleStateCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStateCodeFilter(event.target.value);

        setPage(1); // Reset page on filter change
    };

    const handleCityCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCityCodeFilter(event.target.value);
        setPage(1);
    };

    const handleAmenitiesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setAmenitiesFilter(event.target.value);
        setPage(1);
    };

    const handleFilterNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterName(event.target.value);
        setPage(1);
    };

    const handleFilterDirChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterDir(event.target.value);
        setPage(1);
    };

    const handleFilterValChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterVal(event.target.value);
        setPage(1);
    };

    const loadMore = useCallback(() => {
        setPage(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (page > 1) {
            fetchApartments().then(r => r);
        }
    }, [page, fetchApartments]);


    const headerSection = () => {
        return <><p className="text-gray-700 text-[1.3em] text-center md:text-start md:text-[2em] font-semibold">
            Find Your New Home
        </p>
            <div className="">
                <h3 className="text-lg font-semibold text-gray-700">Filter Options</h3>
                <div className={"flex flex-wrap gap-3"}>
                    <div className="flex flex-wrap sm:flex-row gap-2">
                        <div><input type="text" placeholder="State" value={stateCodeFilter}
                                    onChange={handleStateCodeChange}
                                    className="p-2 border rounded"/></div>
                        <div><input type="text" placeholder="City " value={cityCodeFilter}
                                    onChange={handleCityCodeChange}
                                    className="p-2 border rounded"/></div>
                        <div>
                            {/*<input type="text" placeholder="Amenities (e.g., pool, gym)" value={amenitiesFilter}*/}
                            {/* onChange={handleAmenitiesChange} className="p-2 border rounded"/>*/}
                            <select defaultValue={amenitiesFilter} onChange={handleAmenitiesChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black">
                                <option value={""}>All Amenities</option>
                                {AVAILABLE_AMENITIES.map((amenity: any) => (
                                    <option key={amenity} value={amenity}
                                            className="flex items-center space-x-2 cursor-pointer">
                                        {amenity}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div><select defaultValue={filterName}
                                     onChange={handleFilterNameChange}
                                     className="w-full border border-gray-300 rounded-lg px-4 py-2">
                            <option value={""}>No Filter</option>
                            <option value={"amount"}>Amount</option>
                            <option value={"security_deposit"}>Security Deposit</option>
                            <option value={"number_of_rooms"}>Rooms</option>
                        </select></div>
                        <div><select value={filterDir} onChange={handleFilterDirChange}
                                     className="w-full border border-gray-300 rounded-lg px-4 py-2">
                            <option value="eq">{"="}</option>
                            <option value="gt">{">"}</option>
                            <option value="lt">{"<"}</option>
                            {/*<option value="gte">{">="}</option>*/}
                            {/*<option value="lte">{"<="}</option>*/}
                        </select></div>
                        <div><input type="text" placeholder="Filter Value" value={filterVal}
                                    onChange={handleFilterValChange}
                                    className="p-2 border rounded"/></div>


                    </div>

                </div>
            </div>
        </>

    }


    if (error) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center">
                <p className="text-black">{error}</p>
                <p className={"my-5"}>
                    <button className={"text-red-500 font-bold"} onClick={() => fetchApartments()}>Reload</button>
                </p>
            </div>
        );
    }

    return (
        <div
            className="w-full px-4 py-20 md:py-32 flex flex-col gap-2 md:gap-4 items-center justify-center bg-gray-100 overflow-hidden">

            {
                headerSection()
            }
            {
                isLoading && apartments.length === 0 ?
                    <div className="w-full min-h-screen flex items-center justify-center">
                        <p className="text-gray-600">Loading apartments...</p>
                    </div> :
                    <Tabs defaultValue="all" className="w-full py-3 md:py-5 flex flex-col gap-8">
                        <TabsList className="w-full flex gap-4">
                            <div
                                className="w-[1000px] py-4 mx-auto flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar md:justify-center">
                                <TabsTrigger value="all" className="p-2 flex gap-2 shadow-md">All
                                    Properties</TabsTrigger>
                                {categories.map((category) => (
                                    <TabsTrigger key={category} value={category}
                                                 className="p-2 flex gap-2 shadow-md">{category}</TabsTrigger>
                                ))}
                            </div>
                        </TabsList>

                        <TabsContent value="all">
                            <div
                                className="w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {apartments.map((apt, id) => (
                                    <ApartmentCard key={id} apartment={apt} onClick={handleApartmentClick}/>
                                ))}
                            </div>
                            {apartments.length > 0 && !isLoading && (
                                <button onClick={loadMore}
                                        className="mt-4 bg-orange-400 text-white py-2 px-4 rounded">Load
                                    More</button>
                            )}
                        </TabsContent>

                        {categories.map((category) => (
                            <TabsContent key={category} value={category}>
                                <div
                                    className="w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {apartments
                                        .filter((apt) => apt.category === category)
                                        .map((apt) => (
                                            <ApartmentCard key={apt.id} apartment={apt} onClick={handleApartmentClick}/>
                                        ))}
                                </div>
                                {apartments.filter((apt) => apt.category === category).length > 0 && !isLoading && (
                                    <button onClick={loadMore}
                                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Load
                                        More</button>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
            }
        </div>
    );
};

export default FindHomes;