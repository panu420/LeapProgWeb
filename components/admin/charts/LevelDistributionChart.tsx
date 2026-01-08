/**
 * Grafico a barre per mostrare la distribuzione degli utenti per livello
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LevelData {
  livello: number;
  count: number;
}

interface LevelDistributionChartProps {
  data: LevelData[];
}

export default function LevelDistributionChart({
  data,
}: LevelDistributionChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distribuzione Utenti per Livello
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="livello"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Livello', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Utenti', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
            formatter={(value: number) => [`${value} utenti`, 'Numero']}
          />
          <Bar
            dataKey="count"
            fill="#10b981"
            name="Utenti"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



