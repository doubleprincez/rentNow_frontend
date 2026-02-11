"use client"
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Rectangle,
  PieChart, Pie, Cell, Customized } from 'recharts';


const data = [
  { name: 'Jan', value: Math.floor(Math.random() * 1000) },
  { name: 'Feb', value: Math.floor(Math.random() * 1000) },
  { name: 'Mar', value: Math.floor(Math.random() * 1000) },
  { name: 'Apr', value: Math.floor(Math.random() * 1000) },
  { name: 'May', value: Math.floor(Math.random() * 1000) },
  { name: 'Jun', value: Math.floor(Math.random() * 1000) },
  { name: 'Jul', value: Math.floor(Math.random() * 1000) },
  { name: 'Aug', value: Math.floor(Math.random() * 1000) },
  { name: 'Sep', value: Math.floor(Math.random() * 1000) },
  { name: 'Oct', value: Math.floor(Math.random() * 1000) },
  { name: 'Nov', value: Math.floor(Math.random() * 1000) },
  { name: 'Dec', value: Math.floor(Math.random() * 1000) },
];

const pieData = [
  { name: 'Rents', value: 1040 },  
  { name: 'Listing', value: 1080 },    
  { name: 'Quotes', value: 1000 },  
];

const secondPieData = [
  { name: 'Light Purple', value: 30 },
  { name: 'Yellow', value: 20 },
  { name: 'Light Blue', value: 30 },
  { name: 'Light Orange', value: 20 },
];

const CustomTooltip = ({ active, payload, label }:any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '5px', border: '1px solid #ccc' }}>
          <p className="label">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
};

const CustomBar = (props:any) => {
    const { x, y, width, height, radius } = props;
  
    return (
      <g>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill="#60a5fa"
          radius={[radius, radius, 0, 0]}
        />
      </g>
    );
};

const COLORS = ['#22c55e', '#FB923C', '#6e6e6e']; 

// const renderTotalLabel = ({ cx, cy }:any) => {
//   return (
//     <text 
//       x={cx} 
//       y={cy} 
//       textAnchor="middle" 
//       dominantBaseline="middle" 
//       className="text-[.9em] text-center font-normal text-white"
//     >
//       Total food sold
//       <tspan x={cx} dy="1em" className="text-lg text-gray-500 font-semibold">
//         3120
//       </tspan>
//     </text>
//   );
// };

const PIECOLORS = ['#D6BCFA', '#FBBF24', '#93C5FD', '#FED7AA'];

const renderLabel = ({ percent }:any) => `${(percent * 100).toFixed(0)}%`;

export const RevenueBar = () => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 20, right: 5, left: -25, bottom: 5 }}>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis 
            dataKey="name" 
            className='text-[.7em]'
        />
        <YAxis 
            domain={[0, 1000]} 
            ticks={[0, 200, 400, 600, 800, 1000]} 
            className='text-[.7em]'
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="value" shape={<CustomBar radius={5} />} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const MenuPieChart = () => {
  const cx = 95; 
  const cy = 90; 

  return (
    <ResponsiveContainer width="100%" height={200} className="w-[180px]">
      <PieChart>
        <Pie
          data={pieData}
          cx={cx}   
          cy={cy}   
          outerRadius={90}  
          innerRadius={60} 
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        {/* <Customized component={() => renderTotalLabel({ cx, cy })} /> */}
      </PieChart>
    </ResponsiveContainer>
  );
};

export const PercentagePie = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={secondPieData}
          cx={100}
          cy={100}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={renderLabel} 
        >
          {secondPieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIECOLORS[index % PIECOLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};