export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  uptime: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function fetchDashboardStats(
  token: string,
): Promise<DashboardStats | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return (json?.data ?? json) as DashboardStats;
  } catch {
    return null;
  }
}
