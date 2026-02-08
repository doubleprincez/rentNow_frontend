"use client";
import {useAlert} from "@/contexts/AlertContext";
import {AxiosApi, formatAmountNumber, simpleDateFormat} from "@/lib/utils";
import {RentInterface} from "@/types/rent";
import React, {useEffect, useState} from "react";
import {baseURL} from "@/../next.config";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ChevronLeft, ChevronRight, EyeIcon, Loader2, LoaderCircle, MailIcon, PhoneCallIcon, Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {getAgentRents, getAgentVisits} from "../api/userApi";
import {DialogHeader} from "@/components/ui/dialog";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@radix-ui/react-dialog";
import {useSelector} from "react-redux";
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription} from "@/components/ui/alert";


const ManageRent = () => {
    const agent = useSelector((state: any) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const {showAlert} = useAlert();
    const [rowLoading, setRowLoading] = useState<number | boolean>();

    const [rents, setRents] = useState<RentInterface>();

    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(1);

    const fetchRents = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await getAgentRents(currentPage, searchTerm, agent?.token);

            if (response.success && response.data) {
                setRents(response.data.data);
                setTotalPages(Math.ceil(response.data.total / 20));
            } else {
                throw new Error('Invalid response format');
            }
            setError('');
        } catch (err: any) {
            showAlert(
                err?.data?.message || err.message || "Unable to Process, Please try again.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchRents();
        fetchVisits();
    }, []);


    const handleRentState = async (id: number, status: string) => {
        // update rent state
        if (rents?.proof_of_payment || confirm('Tenant has not uploaded proof of payment yet, continue?')) {
            if (rowLoading) return;
            setRowLoading(() => id);

            await AxiosApi('agent').post(baseURL + '/rented-apartment/' + id + '/activate', {status: status})
                .then((response: { data: any }) => {
                    fetchRents();
                    showAlert(response?.data?.message, 'success');
                })
                .catch((error: any) => {
                    showAlert(
                        error?.response?.data?.message || error.message || "Unable to Process, Please try again.",
                        "error"
                    );
                })
                .finally(() => setRowLoading(false));
        }

    }

    const [visits, setVisits] = useState<RentInterface[] | any>()
    const [visitLoading, setVisitLoading] = useState(false);
    const [visitSearchTerm, setVisitSearchTerm] = useState('');

    const [visitCurrentPage, setVisitCurrentPage] = useState(1);
    const [visitError, setVisitError] = useState('');
    const [visitTotalPages, setVisitTotalPages] = useState(1);

    const handleVisitSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVisitSearchTerm(e.target.value);
        setVisitCurrentPage(1);
    };

    const fetchVisits = async () => {
        try {
            if (visitLoading) return;
            setVisitLoading(() => true);
            const response = await getAgentVisits(currentPage, searchTerm);

            if (response.success && response.data) {
                setVisits(response.data.data);
                setVisitTotalPages(Math.ceil(response.data.total / 20));
            } else {
                throw new Error('Invalid response format');
            }

            setVisitError('');
        } catch (err: any) {
            setVisitError(err.message || 'Failed to fetch subscriptions');
            setVisits('');
        } finally {
            setVisitLoading(() => false);
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
                            value={visitSearchTerm}
                            onChange={handleVisitSearch}
                        />
                    </div>
                </div>

                {visitError && (
                    <Alert variant="destructive" className=" text-red-800 mb-4">
                        <AlertDescription>{visitError}</AlertDescription>
                    </Alert>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Id</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Apartment</TableHead>
                                <TableHead>Visiting Date</TableHead>
                                <TableHead>Action</TableHead>
                                {/*<TableHead>Status</TableHead>*/}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {visitLoading ? (
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
                                            {visit?.user?.name}
                                        </TableCell>
                                        <TableCell>
                                            {visit?.apartment?.title}
                                        </TableCell>
                                        <TableCell>{new Date(visit.visit_date).toLocaleString()} </TableCell>
                                        <TableCell>
                                            <div className={"flex"}>
                                                <div>
                                                    <MailIcon className="text-orange-500"/></div>
                                                <div>
                                                    <a href={"mailto:" + visit?.user?.email}>{visit?.user?.email}</a>
                                                </div>
                                            </div>
                                            <div className={"flex"}>
                                                <PhoneCallIcon className="text-orange-500"/> <a
                                                href={"tel:" + visit?.user?.phone}>{visit?.user?.phone}</a>
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
                        onClick={() => setVisitCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={visitCurrentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <span className="text-sm"> Page {visitCurrentPage} of {visitTotalPages} </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisitCurrentPage(prev => Math.min(visitTotalPages, prev + 1))}
                        disabled={visitCurrentPage === visitTotalPages}
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                </div>

            </div>
        </div>

    }

    return <>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">Rent Management</h1>
            <div>
                {/* // show new rent request at the top that requires confirmation first */}
                {/* // all other returns */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Tenant Name</TableHead>
                                <TableHead>Apartment</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Amount Paid</TableHead>
                                <TableHead>Proof of Payment</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        <div className='flex justify-center '>
                                            <Loader2 className='animate-spin'/> Loading...
                                        </div>

                                    </TableCell>
                                </TableRow>
                            ) : !Array.isArray(rents) || rents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        No Pending Rent
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rents.map((rent: RentInterface, i: number) => (
                                    <TableRow key={rent.id}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>
                                            {rent?.tenant?.name}
                                        </TableCell>
                                        <TableCell>{rent?.apartment?.title}</TableCell>

                                        <TableCell>{simpleDateFormat(rent?.start)} - {simpleDateFormat(rent?.end)}</TableCell>
                                        <TableCell>{rent?.currency_code} {formatAmountNumber(rent?.amount)}</TableCell>
                                        <TableCell className={'flex justify-center items-center'}>

                                            {rent?.proof_of_payment ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            className="mt-2 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex">
                                                            <EyeIcon/> View
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Proof of Payment</DialogTitle>
                                                        </DialogHeader>
                                                        <img src={rent?.proof_url} alt="Proof of Payment"
                                                             className="w-full"/>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : <>Waiting for Proof</>}
                                        </TableCell>

                                        <TableCell className={' '}>
                                            <div className="flex">{
                                                ((rent?.proof_of_payment && rent?.approved == null) || rent?.approved != null) ? <> {rent?.approved ? 'Confirmed' : 'Denied'}</> : <>
                                                    {
                                                        (rowLoading !== rent.id) ?
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className='bg-red-500 text-white text-xs px-2 py-1 mx-3 rounded-md'
                                                                    onClick={() => handleRentState(rent.id, 'denied')}>
                                                                    Reject
                                                                </Button>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    className='bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 mx-3 rounded-md'
                                                                    onClick={() => handleRentState(rent.id, 'confirmed')}>
                                                                    Accept
                                                                </Button>
                                                            </div>

                                                            : <><LoaderCircle
                                                                className="animate-spin text-center mx-auto"/></>
                                                    }
                                                </>

                                            }</div>


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
            {manageVisitation()}
        </div>
    </>
}


export default ManageRent;