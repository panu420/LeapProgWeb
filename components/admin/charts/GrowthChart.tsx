/**
 * Grafico a linee per mostrare la crescita di contenuti negli ultimi 7 giorni
 */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyStat {
  date: string;
  dayName: string;
  notes: number;
  quizzes: number;
  veroFalso: number;
  missions: number;
}

interface GrowthChartProps {
  data: DailyStat[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Crescita Contenuti (Ultimi 7 Giorni)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dayName"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="notes"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Appunti"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="quizzes"
            stroke="#10b981"
            strokeWidth={2}
            name="Quiz"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="veroFalso"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Vero/Falso"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}



