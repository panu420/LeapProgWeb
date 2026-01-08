/**
 * Grafico a barre per mostrare i top 5 utenti per punti
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

interface TopUser {
  id: number;
  nome: string;
  email: string;
  livello: number;
  punti: number;
}

interface TopUsersChartProps {
  users: TopUser[];
}

export default function TopUsersChart({ users }: TopUsersChartProps) {
  // Prepara i dati per il grafico (solo nome e punti)
  const chartData = users.map((user) => ({
    nome: user.nome.split(' ')[0], // Solo il primo nome per brevità
    punti: user.punti,
    livello: user.livello,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top 5 Utenti per Punti
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="nome"
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
            formatter={(value: number) => [`${value} punti`, 'Punti']}
          />
          <Bar dataKey="punti" fill="#3b82f6" name="Punti" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



