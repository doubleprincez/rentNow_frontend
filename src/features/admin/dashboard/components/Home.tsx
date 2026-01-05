'use client'
import { Grid2x2Check, ListCheck, Users, Building2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store' 
import { fetchDashboard } from '@/redux/dashboardSlice'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AdminHome = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.admin.token);
  const { statistics, chartData, isLoading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    if (token) {
      dispatch(fetchDashboard(token) as any);
    }
  }, [dispatch, token]);

  const statsCards = [
    {
      icon: Building2,
      title: 'Total Properties',
      value: statistics?.total_apartments || 0,
    },
    {
      icon: Grid2x2Check,
      title: 'Rented Properties',
      value: statistics?.total_rented_apartment || 0,
    },
    {
      icon: ListCheck,
      title: 'Rent Requests',
      value: statistics?.total_rent_request || 0,
    },
    {
      icon: Users,
      title: 'Total Users',
      value: statistics?.total_users || 0,
    },
  ];

  // Transform chart data for Recharts
  const transformedChartData = chartData 
    ? Object.entries(chartData).map(([month, data]) => ({
        name: month,
        total_rent: Number(data.total_rent),
        total_apartments: Number(data.total_apartments)
      }))
    : [];

  // if (error) {
  //   return <div className="text-red-500 p-4">{error}</div>;
  // }

  return (
    <div className='w-full h-full px-1 md:px-4 py-2 md:py-4 flex flex-col gap-2 sm:gap-4'>
      <div className='w-full flex flex-col gap-1'>
        <span className='text-black/80 text-[1.5rem] font-semibold'>Overview</span>
        <div className='w-full grid grid-cols-2 sml:grid-cols-2 mdl:grid-cols-4 gap-1 sm:gap-4'>
          {statsCards.map((item, index) => (
            <div className='col-span-1 h-[100px] bg-black/80 rounded-xl shadow-md shadow-orange-600 flex items-center p-4 gap-1' key={index}>
              <div>
                <item.icon className='w-8 sm:w-10 lg:w-16 h-8 sm:h-10 lg:h-16 text-orange-500'/>
              </div>
              <div className='flex flex-col leading-6'>
                <h1 className='text-white font-semibold text-[.7em] sm:text-[.9em]'>{item.title}</h1>
                <span className='text-white text-[1rem] sm:text-[2rem] font-bold syne'>{item.value}</span>
              </div> 
            </div>
          ))}
        </div>
      </div>

      <div className='w-full grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4'>
        <div className='col-span-1 md:col-span-4 w-full h-[250px] sm:h-[400px] bg-black/80 rounded-xl shadow-md shadow-orange-600 flex items-center sm:p-4 gap-1'>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedChartData} margin={{ top: 20, right: 10, left: -20, bottom: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" className='text-[.8em] md:text-[.9em]'/>
              <YAxis className='text-[.8em] md:text-[.9em]'/>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total_rent"
                stroke="#f97316"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="total_apartments"
                stroke="#22c55e"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;