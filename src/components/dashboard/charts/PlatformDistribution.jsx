import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const PlatformDistribution = () => {
  const data = [
    { name: 'TikTok', value: 30, color: '#E01E5A' },
    { name: 'Meta', value: 35, color: '#035096' },
    { name: 'Youtube', value: 25, color: '#FF0000' },
    { name: 'Snapchat', value: 10, color: '#FFDD00' }
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-[250px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="w-full space-y-3">
        {data.map((platform, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: platform.color }}
              />
              <span className="text-white text-sm">{platform.name}</span>
            </div>
            <span className="text-white font-semibold text-sm">{platform.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformDistribution;

