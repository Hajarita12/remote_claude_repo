'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import { fetchDashboardStats, type DashboardStats } from '@/lib/dashboard';

type LoadingState = 'loading' | 'no-token' | 'ready' | 'error';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [status, setStatus] = useState<LoadingState>('loading');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('no-token');
      return;
    }

    fetchDashboardStats(token)
      .then((data) => {
        if (data === null) {
          setStatus('error');
        } else {
          setStats(data);
          setStatus('ready');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, []);

  if (status === 'no-token') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Please log in
          </h1>
          <p className="text-gray-500">
            You must be logged in to view the dashboard.
          </p>
        </div>
      </main>
    );
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Failed to load stats
          </h1>
          <p className="text-gray-500">
            Please check your connection and try again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      {stats !== null && (
        <div className="grid grid-cols-2 gap-6">
          <StatsCard label="Total Users" value={stats.totalUsers} />
          <StatsCard label="Active Users" value={stats.activeUsers} />
          <StatsCard label="Total Messages" value={stats.totalMessages} />
          <StatsCard label="Uptime" value={stats.uptime} />
        </div>
      )}
    </main>
  );
}
