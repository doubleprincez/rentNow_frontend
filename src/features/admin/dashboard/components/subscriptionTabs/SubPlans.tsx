"use client"
import { AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlansInterface } from "@/types/subscription";
import { Loader2, Search } from "lucide-react"
import { useState } from "react"



const SubPlans = ()=>{

    const [loading,setLoading] = useState(false);
    const [plans,setPlans] = useState<PlansInterface[]>();
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [handleSearch,setHandleSearch] = useState( );
    



    return <> <div className="p-6 bg-gray-50 min-h-screen">
              <h1 className="text-2xl font-bold mb-4">Plans</h1>
            
         
                <div className="p-6">
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Search subscriptions..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div> 

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Id</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="flex justify-center">
                                            <Loader2 className='animate-spin'/> Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : !Array.isArray(plans) || plans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No Subscription Yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    plans.map((plan:PlansInterface) => (
                                        <TableRow key={plan.id}>
                                            <TableCell>
                                                <div className='w-14 h-14 rounded-md overflow-hidden'>
                                                    {plan.id}
                                                </div>
                                            </TableCell>
                                            <TableCell>{plan?.name}</TableCell>
                                            <TableCell>
                                                 
                                            </TableCell>
                                            <TableCell> {plan?.description} </TableCell>
                                            <TableCell>{plan?.invoice_period} - {plan?.invoice_interval} </TableCell>

                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-center space-x-2 py-4">
                        {/* <Button
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
                        </Button> */}
                    </div>
                </div>
            </div>
    </>
}

export default SubPlans