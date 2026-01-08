/**
 * Grafico a barre comparativo per mostrare l'attività quiz vs vero/falso
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ActivityChartProps {
  completedQuizzes: number;
  completedVeroFalso: number;
  totalQuizAttempts: number;
  totalVeroFalsoAttempts: number;
}

export default function ActivityChart({
  completedQuizzes,
  completedVeroFalso,
  totalQuizAttempts,
  totalVeroFalsoAttempts,
}: ActivityChartProps) {
  const data = [
    {
      name: 'Completati',
      Quiz: completedQuizzes,
      'Vero/Falso': completedVeroFalso,
    },
    {
      name: 'Tentativi Totali',
      Quiz: totalQuizAttempts,
      'Vero/Falso': totalVeroFalsoAttempts,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Attività Quiz vs Vero/Falso
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
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
          <Bar dataKey="Quiz" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Vero/Falso" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



