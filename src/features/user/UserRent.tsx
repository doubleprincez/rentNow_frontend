'use client'
import React, {useEffect, useState} from 'react';
import {ChevronLeft, ChevronRight, MailIcon, PhoneCallIcon, Search} from 'lucide-react';
import {redirect, useRouter} from 'next/navigation';
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {useSelector} from "react-redux";
import {frontendURL} from "@/../next.config";
import {getUserRents, getUserVisits} from '../landing/api/rents';
import {RentInterface} from '@/types/rent';
import {formatAmountNumber} from '@/lib/utils'


const UserRent = () => {
    const router = useRouter();
    //    view previous rents

    // make it easy to upload proof of payment

    // print out


    const isLoggedIn = useSelector((state: any) => state.user.isLoggedIn);

    const [rents, setRents] = useState<RentInterface[] | any>()
    const [rentLoading, setRentLoading] = useState(false);
    const [rentSearchTerm, setRentSearchTerm] = useState('');

    const [rentCurrentPage, setRentCurrentPage] = useState(1);
    const [rentError, setRentError] = useState('');
    const [rentTotalPages, setRentTotalPages] = useState(1);

    // get all transactions

    // allow viewing and downloading invoice
    const handleApartmentClick = (apartment: number) => {
        router.push(frontendURL + `/find-homes/${apartment}`);
    };

    const rentHandleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRentSearchTerm(e.target.value);
        setRentCurrentPage(1);
    };


    const fetchRents = async () => {
        try {
            if (rentLoading) return;
            setRentLoading(() => true);
            const response = await getUserRents(rentCurrentPage, rentSearchTerm);

            if (response.success && response.data) {
                setRents(response.data.data);
                setRentTotalPages(Math.ceil(response.data.total / 20));
            } else {
                throw new Error('Invalid response format');
            }

            setRentError('');
        } catch (err: any) {
            setRentError(err.message || 'Failed to fetch subscriptions');
            setRents('');
        } finally {
            setRentLoading(() => false);
        }
    };

    useEffect(() => {
        if (!isLoggedIn) {
            return redirect('/auth/login');
        }
        fetchRents();
        fetchVisits();

    }, [isLoggedIn])


    const manageRent = () => {
        return <div className="relative bg-gray-100 w-full pt-[64px] md:pt-[75px]"
        >
            <div className="bg-opacity-60 pt-5">
                <div className="w-full px-4 py-8 flex flex-col items-center gap-4 ">
                    <h1 className="text-black/80 text-[1.5rem] font-semibold">Manage Rents</h1>
                </div>

                <div className="mb-6">
                    <div className="relative w-1/3">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Search Rent..."
                            className="pl-8"
                            value={rentSearchTerm}
                            onChange={rentHandleSearch}
                        />
                    </div>
                </div>

                {rentError && (
                    <Alert variant="destructive" className=" text-red-800 mb-4">
                        <AlertDescription>{rentError}</AlertDescription>
                    </Alert>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Id</TableHead>
                                <TableHead>Apartments</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {rentLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : !Array.isArray(rents) || rents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No Rented Apartment
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rents.map((rent, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className='w-14 h-14 rounded-md overflow-hidden'>
                                                {rent?.id}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => handleApartmentClick(rent?.apartment_id)}>{rent?.apartment?.title}</button>
                                        </TableCell>
                                        <TableCell>{new Date(rent.start).toDateString()}
                                            <br/> {new Date(rent?.end).toDateString()}</TableCell>

                                        <TableCell> {rent?.currency_code}{formatAmountNumber(rent?.amount)} </TableCell>
                                        <TableCell>{rent?.approved == null && rent?.proof_of_payment ? 'Awaiting Approval' : rent?.approved ? 'Accepted' : 'Denied'} </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-center space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRentCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={rentCurrentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <span className="text-sm"> Page {currentPage} of {totalPages} </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRentCurrentPage(prev => Math.min(rentTotalPages, prev + 1))}
                        disabled={rentCurrentPage === rentTotalPages}
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                </div>

            </div>
        </div>
    }

    const [visits, setVisits] = useState<RentInterface[] | any>()
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(1);


    const handleVisitSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };


    const fetchVisits = async () => {
        try {
            if (loading) return;
            setLoading(() => true);
            const response = await getUserVisits(currentPage, searchTerm);

            if (response.success && response.data) {
                setVisits(response.data.data);
                setTotalPages(Math.ceil(response.data.total / 20));
            } else {
                throw new Error('Invalid response format');
            }

            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to fetch subscriptions');
            setVisits('');
        } finally {
            setLoading(() => false);
        }
    };

    const manageVisitation = () => {
        return <div>
            <div className="bg-opacity-60 pt-5">
                <div className="w-full px-4 py-8 flex flex-col items-center gap-4 ">
                    <h1 className="text-black/80 text-[1.5rem] font-semibold">Manage Visits</h1>
                </div>

                <div className="mb-6">
                    <div className="relative w-1/3">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder="Search Visit..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={handleVisitSearch}
                        />
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className=" text-red-800 mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Id</TableHead>
                                <TableHead>Apartment</TableHead>
                                <TableHead>Visiting Date</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Contact Agent</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : !Array.isArray(visits) || visits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No Bookings
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visits.map((visit: any, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className='w-14 h-14 rounded-md overflow-hidden'>
                                                {visit?.id}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => handleApartmentClick(visit?.apartment_id)}>{visit?.apartment?.title}</button>
                                        </TableCell>
                                        <TableCell>{new Date(visit.visit_date).toDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {visit?.apartment?.user?.business_name || visit?.apartment?.user?.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className={"flex flex-col"}>
                                                {(visit?.apartment?.user?.business_email ?? visit?.apartment?.user?.email) &&
                                                    <div className={"flex mb-2"}>
                                                        <div><MailIcon className="text-orange-500"/></div>
                                                        <div>
                                                            <a className={"text-red-200 cursor-pointer"}
                                                               href={"mailto:" + (visit?.apartment?.user?.business_email ?? visit?.apartment?.user?.email)}>{visit?.apartment?.user?.business_email ?? visit?.apartment?.user?.email}
                                                            </a></div>
                                                    </div>}
                                                {(visit?.apartment?.user?.business_phone||visit?.apartment?.user?.phone) && <div className={"flex mb-2"}>
                                                    <div><PhoneCallIcon className="text-orange-500"/></div>
                                                    <div><a className={"text-red-200"}
                                                            href={"tel:" + (visit?.apartment?.user?.business_phone||visit?.apartment?.user?.phone)}>{visit?.apartment?.user?.business_phone||visit?.apartment?.user?.phone}</a>
                                                    </div>
                                                </div>}
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
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
                    <span className="text-sm"> Page {currentPage} of {totalPages} </span>
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
        </div>

    }


    return <>
        <div className={"p-4"}>
            {manageRent()}
        </div>
        <div className={"p-4"}>
            {manageVisitation()}
        </div>
    </>
}


export default UserRent;











