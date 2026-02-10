import React from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ activeTab }) => {
  const impressionsData = [
    { day: 'LUN', value: 9500 },
    { day: 'MAR', value: 14200 },
    { day: 'MER', value: 13800 },
    { day: 'JEU', value: 22100 },
    { day: 'VEN', value: 23400 },
    { day: 'SAM', value: 24800 },
    { day: 'DIM', value: 13200 }
  ];

  const clicsData = [
    { day: 'LUN', value: 285 },
    { day: 'MAR', value: 380 },
    { day: 'MER', value: 414 },
    { day: 'JEU', value: 520 },
    { day: 'VEN', value: 480 },
    { day: 'SAM', value: 620 },
    { day: 'DIM', value: 580 }
  ];

  const conversionsData = [
    { day: 'LUN', value: 28 },
    { day: 'MAR', value: 38 },
    { day: 'MER', value: 35 },
    { day: 'JEU', value: 52 },
    { day: 'VEN', value: 48 },
    { day: 'SAM', value: 62 },
    { day: 'DIM', value: 58 }
  ];

  const getData = () => {
    switch (activeTab) {
      case 'clics':
        return clicsData;
      case 'conversions':
        return conversionsData;
      default:
        return impressionsData;
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F0F0F] border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{payload[0].payload.day}</p>
          <p className="text-white font-semibold">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render Bar Chart for Impressions
  if (activeTab === 'impressions') {
    return (
      <div className="w-full h-[300px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={getData()}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={0}
            barCategoryGap="5%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#2A2A2A' }}
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#2A2A2A' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1A1A1A' }} />
            <Bar
              dataKey="value"
              fill="#781E8A"
              radius={[8, 8, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Render Area Chart for Clics and Conversions
  return (
    <div className="w-full h-[300px] sm:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={getData()}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#6B7280"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#2A2A2A' }}
          />
          <YAxis
            stroke="#6B7280"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#2A2A2A' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#60A5FA"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;

