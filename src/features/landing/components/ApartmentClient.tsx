'use client'
import React, {useEffect, useState} from 'react';
import {
    Banknote,
    Boxes,
    BuildingIcon,
    Clock,
    GlobeIcon,
    HeartIcon,
    Home,
    List,
    LucideEye,
    MailIcon,
    MapPin,
    PhoneCallIcon,
    Shield,
    User
} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import type {Apartment} from '@/types/apartment';
import {filterAmenities} from "@/types/apartment";
import {useRouter} from 'next/navigation';
import {useSelector} from 'react-redux';
import ChatDialog from '@/features/landing/components/ChatDialog';
import {baseURL, frontendURL} from "@/../next.config";
import {AxiosApi, formatAmountNumber, saveFormData} from '@/lib/utils';
import {EmailIcon, FacebookIcon, FacebookShareButton, WhatsappIcon, WhatsappShareButton} from 'react-share';
import {useAlert} from '@/contexts/AlertContext';

interface ClientProps {
    prevApartment: Apartment;
}


export default function ApartmentClient({prevApartment}: ClientProps) {

    const router = useRouter();
    const {isLoggedIn, token, isSubscribed} = useSelector((state: any) => state.user);
    const {showAlert} = useAlert();

    const [isLoading, setIsLoading] = useState(false);
    // const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [likedApartment, setLikedApartment] = useState(false);

    const [apartment, setApartment] = useState<Apartment>();


    const fetchApartment = async () => {
        if (isLoading) return;
        setIsLoading(true);
        await AxiosApi().get(baseURL + '/apartment/' + apartment?.id)
            .then((response: { data: any }) => {
                const fetched = response?.data.data;
                setApartment(fetched);
                setLikedApartment(fetched?.like_apartment ?? false);
            }).finally(() => setIsLoading(false));
    }

    const toggleLike = async () => {
        const newState = !likedApartment;
        setLikedApartment(() => newState);

        if (newState && apartment) {
            const res = apartment?.like_count ?? 0 + 1;
            setApartment(apartment => ({...apartment, like_count: res}));
            await AxiosApi().post(baseURL + '/apartment/' + apartment.id + '/like')
                .then(res => {
                    const fetched = res.data?.data;
                    if (fetched) {
                        setApartment(fetched);
                        setLikedApartment(fetched.like_apartment);
                    }
                })
                .catch((error: any) => showAlert(
                    error?.response?.data?.message || error.message || "Unable to Process, Please try again.",
                    "error"
                ))
        } else {
            const res = apartment?.like_count ?? 1 - 1;

            setApartment(apartment => ({...apartment, like_count: res}));
            await AxiosApi().post(baseURL + '/apartment/' + apartment?.id + '/unlike')
                .then(res => {
                    const fetched = res.data?.data;
                    if (fetched) {
                        setApartment(fetched);
                        setLikedApartment(fetched.like_apartment);
                    }
                })
                .catch((error: any) => showAlert(
                    error?.response?.data?.message || error.message || "Unable to Process, Please try again.",
                    "error"
                ))
        }
    }


    const [bookingData, setBookingData] = useState({
        start: '',
        end: '',
    });
    const [visitDate, setVisitDate] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [isVisiting, setIsVisiting] = useState(false);

    const [minDate, setMinDate] = useState('');


    useEffect(() => {
        setApartment(prevApartment);
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setMinDate(`${year}-${month}-${day}T${hours}:${minutes}`);
        return () => {
        }
    }, []);


    const rentApartmentNow = () => {
        return <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                    Rent Now
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rent Apartment</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <label htmlFor="start-date" className="text-sm font-medium">
                            Start Date
                        </label>
                        <Input
                            id="start-date"
                            type="date"
                            value={bookingData.start}
                            onChange={(e) => setBookingData(prev => ({
                                ...prev,
                                start: e.target.value
                            }))}
                            className="col-span-3"
                        />
                    </div>

                    <div className="bg-orange-50 p-3 rounded-md mt-2">
                        <p className="text-sm text-orange-800">
                            The rent duration will be {apartment?.duration} from the
                            selected start date.
                        </p>
                    </div>

                    <Button
                        onClick={handleBooking}
                        disabled={isBooking || !bookingData.start}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-2"
                    >
                        {isBooking ? 'Registering...' : 'Confirm Rent'}
                    </Button>

                </div>

            </DialogContent>
        </Dialog>
    }

    const bookVisitation = () => {
        return <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                    Book Visitation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book Visitation</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="bg-orange-50 p-3 rounded-md mt-2">
                        <p className="text-sm text-orange-800">
                            Select the day you will like to go for inspection.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="start-date" className="text-sm font-medium">
                            Visit Date
                        </label>

                        <div>
                            <Input
                                id="start-date"
                                type="datetime-local" min={minDate}
                                value={visitDate}
                                onChange={(e: any) => setVisitDate(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleVisiting}
                        disabled={visitDate == '' || isVisiting}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-2"
                    >
                        {isBooking ? 'Registration...' : 'Confirm Visitation'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    }


    const calculateEndDate = (startDate: string, duration?: string): string => {
        const start = new Date(startDate);
        const durationMatch = duration?.match(/(\d+)\s*(Year|Month|Week|Day)s?/i);

        if (!durationMatch) return startDate;

        const [_, amount, unit] = durationMatch;
        const numAmount = parseInt(amount);

        switch (unit.toLowerCase()) {
            case 'year':
                start.setFullYear(start.getFullYear() + numAmount);
                break;
            case 'month':
                start.setMonth(start.getMonth() + numAmount);
                break;
            case 'week':
                start.setDate(start.getDate() + (numAmount * 7));
                break;
            case 'day':
                start.setDate(start.getDate() + numAmount);
                break;
        }

        return start.toISOString().split('T')[0];
    };


    const handleBooking = async () => {
        if (!apartment) return;

        if (!isLoggedIn || !token) {
            alert('Please log in to book a viewing session');
            return;
        }

        if (!bookingData.start) {
            alert('Please select a start date');
            return;
        }

        setIsBooking(true);
        try {
            const formattedStart = bookingData?.start?.split('T')[0];
            const formattedEnd = calculateEndDate(formattedStart, apartment?.duration);

            const deposit = Number(apartment?.security_deposit && parseInt(apartment?.security_deposit.replace(/[^0-9]/g, '')));
            const bookingPayload = {
                apartment_id: apartment.id,
                amount: Number(apartment?.amount ? apartment?.amount?.replace(/[^0-9]/g, '') : 0) + deposit,
                currency_code: "NGN",
                start: formattedStart,
                end: formattedEnd
            };

            //console.log('Sending booking payload:', bookingPayload);

            const response = await fetch(baseURL + '/rented-apartment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bookingPayload),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Viewing Session Booked successfully!');
                setBookingData({start: '', end: ''});
                router.push(frontendURL + '/user/rent/' + data.data.id);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to book viewing session. Please try again.');
            }
        } catch (error) {
            //console.error('Error booking viewing session:', error);
            alert('Failed to book viewing session. Please try again.');
        } finally {
            setIsBooking(false);
        }
    };
    const handleVisiting = async () => {
        if (!apartment) return;

        if (!isLoggedIn || !token) {
            alert('Please log in to Register Visit Date');
            return;
        }

        if (!visitDate) {
            alert('Please select a date');
            return;
        }
        setIsVisiting(true);
        try {
            const response = await fetch(baseURL + '/visitation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({date: visitDate, apartment_id: apartment.id}),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    showAlert('Visitation Booked! Please contact ' + (apartment?.user?.business_name || apartment?.user?.name) + ' for directions and further instructions.', 'success');
                    router.push(frontendURL + '/user/rent/');
                } else {
                    showAlert(data?.message, 'error');
                }
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'Failed to book viewing session. Please try again.', 'error');
            }
        } catch (error) {
            //console.error('Error booking viewing session:', error);
            showAlert('Failed to book viewing session. Please try again.', 'error');
        } finally {
            setIsVisiting(false);
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!apartment) {
        return <div className="flex justify-center items-center min-h-screen">Apartment not found</div>;
    }

    return (
        <div className="w-full px-4 py-20 md:py-28">
            <Card className="w-full md:w-[90%] mx-auto border-none">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                            <img
                                src={apartment.images && Object.values(apartment.images)[0]?.preview_url || '/placeholder.jpg'}
                                alt={apartment.title}
                                // width={500}
                                // height={500}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <h1 className="text-2xl font-bold text-gray-800">{apartment.title}</h1>

                            <div className="flex items-center gap-2">
                                <Home className="text-orange-500"/>
                                <span className="text-gray-600">Rooms: {apartment.number_of_rooms}</span>
                            </div>


                            {
                                apartment.category && <div className="flex items-center gap-2">
                                    <Boxes className="text-orange-500"/>
                                    <span className="text-gray-600">Category: {apartment.category}</span>
                                </div>
                            }


                            <div className="flex items-center gap-2">
                                <MapPin className="text-orange-500"/>
                                <span
                                    className="text-gray-600">{`${apartment.city_code}, ${apartment.state_code}`}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Banknote className="text-orange-500"/>
                                <span className="text-gray-600 font-bold">Price: {apartment.amount}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="text-orange-500"/>
                                <span className="text-gray-600">Duration: {apartment?.duration}</span>
                            </div>


                            <div className="flex items-center gap-2">
                                <Shield className="text-orange-500"/>
                                <span
                                    className="text-gray-800">Security Deposit: {apartment?.security_deposit_currency_code}
                                    {formatAmountNumber(apartment?.security_deposit)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <List className="text-orange-500"/>
                                <span className="text-gray-600">
  Amenities: {
                                    apartment.amenities
                                        ? filterAmenities(apartment.amenities)?.join(', ')
                                        : 'None listed'
                                }
</span>
                            </div>

                            {
                                apartment?.agent_type == 'agent' ? <>
                                    {
                                        apartment.agent && <div className="flex items-center gap-2">
                                            <User className="text-orange-500"/>
                                            <span
                                                className="text-gray-600">{String(apartment.agent_type).toLocaleUpperCase()}: {apartment.agent}</span>
                                        </div>
                                    }
                                    {
                                        isSubscribed && apartment?.agent_email &&
                                        <div className="flex items-center gap-2">
                                            <MailIcon className="text-orange-500"/>
                                            <span className="text-gray-600">Email: {apartment?.agent_email}</span>
                                        </div>
                                    }
                                    {
                                        isSubscribed && apartment?.agent_phone &&
                                        <div className="flex items-center gap-2">
                                            <PhoneCallIcon className="text-orange-500"/>
                                            <span className="text-gray-600">Phone: {apartment?.agent_phone}</span>
                                        </div>
                                    }
                                </> : <>
                                    <div className='flex justify-start space-x-2'>
                                        {
                                            apartment?.business_logo && <div className="flex items-center gap-2">
                                                <img src={apartment?.business_logo}
                                                     className='w-32 rounded-lg hover:shadow-lg'/>
                                            </div>
                                        }{
                                        apartment?.business_name && <div className="flex items-center gap-2">
                                            <BuildingIcon className="text-orange-500"/>
                                            <span
                                                className="text-gray-600">{String(apartment.agent_type).toLocaleUpperCase()}: {apartment?.business_name}</span>
                                        </div>
                                    }
                                    </div>
                                    {
                                        isSubscribed && apartment?.business_address &&
                                        <div className="flex items-center gap-2">
                                            <GlobeIcon className="text-orange-500"/>
                                            <span className="text-gray-600">Phone: {apartment?.business_address}</span>
                                        </div>
                                    }

                                    {
                                        isSubscribed && apartment?.business_email &&
                                        <div className="flex items-center gap-2">
                                            <EmailIcon className="text-orange-500"/>
                                            <span className="text-gray-600">Phone: {apartment?.business_email}</span>
                                        </div>
                                    }
                                    {
                                        isSubscribed && apartment?.business_phone &&
                                        <div className="flex items-center gap-2">
                                            <PhoneCallIcon className="text-orange-500"/>
                                            <span className="text-gray-600">Phone: {apartment?.business_phone}</span>
                                        </div>
                                    }
                                </>
                            }


                            <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-2'>
                                {/*isSubscribed === true ? : <div className='col-span-2  py-4 w-full'>*/}
                                {/*<div className='text-xs'>Subscribe now to enjoy the full benefits of our*/}
                                {/*    platform*/}
                                {/*</div>*/}
                                {/*<Button onClick={() => router.push('/subscribe')}*/}
                                {/*        className='bg-orange-500 hover:bg-orange-600 text-white w-full mt-2'>Subscribe*/}
                                {/*    Now</Button></div>*/}
                                {

                                    isLoggedIn ?<>
                                            {rentApartmentNow()}
                                            {bookVisitation()}

                                            {
                                                apartment?.agent_id && (apartment?.agent || apartment?.business_name) &&
                                                <ChatDialog
                                                    agentId={apartment?.agent_id}
                                                    agentName={apartment?.agent ?? apartment?.business_name}
                                                />
                                            }

                                        </>
                                        : <div className="text-center col-span-2 py-4 w-full">
                                            <p className="text-gray-600 mb-4">
                                                Please log in to continue
                                            </p>
                                            <Button
                                                onClick={() => {
                                                    saveFormData('intended_url', '/find-homes/' + apartment.id);
                                                    router.push('/auth/login')
                                                }}
                                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                            >
                                                Go to Login
                                            </Button>
                                        </div>
                                }
                            </div>
                            <div className="mt-4">
                                <h2 className="text-xl font-semibold mb-2">Description</h2>
                                <p className="text-gray-600">{apartment.description}</p>
                            </div>
                            <div className='flex justify-center space-x-4'>
                                <div className='flex  '>{apartment?.views_count}&nbsp; <LucideEye/>
                                </div>
                                <div className='flex justify-center'>
                                    <div>{apartment?.like_count}</div>
                                    <div>
                                        {
                                            isLoggedIn ? <HeartIcon onClick={() => toggleLike()}
                                                                    className={(likedApartment == true ? 'text-red-800 fill-red-800' : 'text-green-800 fill-green-800') + ' cursor-pointer'}/> :
                                                <HeartIcon
                                                    className={(likedApartment == true ? 'text-red-800 fill-red-800' : 'text-green-800 fill-green-800') + ' cursor-pointer'}/>
                                        }

                                    </div>
                                </div>
                                <div className='flex justify-center'>
                                    <span className="px-2">Share:</span>
                                    <div className="px-2">
                                        <FacebookShareButton url={window.location.href}>
                                            <FacebookIcon size={24}/>
                                        </FacebookShareButton>
                                    </div>
                                    <div className="px-2">
                                        <WhatsappShareButton className="px-2" url={window.location.href}>
                                            <WhatsappIcon size={24} className='fill-white bg-white text-green-600'/>
                                        </WhatsappShareButton>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Property Images</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {apartment.images && Object.values(apartment.images).map((image, index) => (
                                <div key={index} className="w-full h-[150px] rounded-lg overflow-hidden">
                                    <img
                                        src={image.preview_url}
                                        alt={`Property image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Property Videos</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {apartment.videos && Object.values(apartment.videos).map((video, index) => (
                                <div key={index} className="relative">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div
                                                className="w-full h-[150px] rounded-lg overflow-hidden bg-gray-100 cursor-pointer flex items-center justify-center">
                                                <div className="text-orange-500">Click to play video</div>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent
                                            className="max-w-4xl flex items-center justify-center p-0 bg-black border-none">
                                            <video
                                                controls
                                                className="w-auto h-auto object-cover"
                                                src={video.original_url}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
