/**
 * Grafico a torta per mostrare la distribuzione dei contenuti
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ContentDistributionChartProps {
  notes: number;
  quizzes: number;
  veroFalso: number;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

export default function ContentDistributionChart({
  notes,
  quizzes,
  veroFalso,
}: ContentDistributionChartProps) {
  const data = [
    { name: 'Appunti', value: notes },
    { name: 'Quiz', value: quizzes },
    { name: 'Vero/Falso', value: veroFalso },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distribuzione Contenuti
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}



