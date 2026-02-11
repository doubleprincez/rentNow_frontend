'use client'
import {Eye, Home as HomeIcon, Star} from 'lucide-react';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {AxiosApi} from '@/lib/utils';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {baseURL} from "@/../next.config";
import {useRouter} from "next/navigation";

interface Statistics {
    total_apartments: number;
    total_rented_apartments: number;
    total_ratings: number;
    total_followers: number;
    total_following: number | null;
    total_views: number;
}

interface ChartData {
    name: string;
    total_rent: number;
    total_apartments: number;
}

const generateMockData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
        name: month,
        total_rent: 0,
        total_apartments: 0
    }));
};

const Home = () => {
    const router = useRouter();
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>(generateMockData());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = useSelector((state: any) => state.auth.token);

    useEffect(() => {
        if (!token) {
            router.push('/agents/auth/login'); // Replace with your actual login route
        }
    }, [token, router]);


    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!token) return;

            try {
                // Fetch statistics
                const statsResponse = await AxiosApi('agent', token).get(baseURL + '/statistics', {
                    validateStatus: function (status) {
                        return status === 200;
                    }
                });

                if (isMounted && statsResponse.data?.success && statsResponse.data?.data) {
                    setStatistics(statsResponse.data.data);
                    //console.log('Statistics data:', statsResponse.data.data);
                }

                // Fetch chart data
                const chartResponse = await AxiosApi('agent', token).get(baseURL + '/bar-chart', {
                    validateStatus: function (status) {
                        return status === 200;
                    }
                });

                if (isMounted && chartResponse.data?.success && chartResponse.data?.data) {
                    // Transform the data if needed
                    const transformedData = Object.entries(chartResponse.data.data).map(([month, values]: [string, any]) => ({
                        name: month,
                        total_rent: values.total_rent || 0,
                        total_apartments: values.total_apartments || 0
                    }));
                    setChartData(transformedData);
                    //console.log('Chart data:', transformedData);
                }
            } catch (err) {
                if (isMounted) {
                    //console.error('Error fetching data:', err);
                    setError('Failed to load dashboard data');
                }
            } finally {
                if (isMounted) {
                    setLoading(()=>false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const statsCards = [
        {
            icon: HomeIcon,
            title: 'Total Apartments',
            value: statistics?.total_apartments || 0
        },
        {
            icon: HomeIcon,
            title: 'Rented Apartments',
            value: statistics?.total_rented_apartments || 0
        },
        {
            icon: Star,
            title: 'Total Ratings',
            value: statistics?.total_ratings || 0
        },
        {
            icon: Eye,
            title: 'Total Views',
            value: statistics?.total_views || 0
        },
    ];

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{item.title}</p>
                                <p className="text-2xl font-semibold mt-2">{item.value}</p>
                            </div>
                            <item.icon className="h-8 w-8 text-gray-400"/>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Analytics Overview</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{top: 20, right: 10, left: -30, bottom: -10}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tick={{fontSize: 12, fill: '#64748b'}}
                            />
                            <YAxis
                                axisLine={false}
                                tick={{fontSize: 12, fill: '#64748b'}}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total_rent"
                                stroke="#f97316"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{r: 6, fill: "#f97316"}}
                            />
                            <Line
                                type="monotone"
                                dataKey="total_apartments"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{r: 6, fill: "#22c55e"}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Home;