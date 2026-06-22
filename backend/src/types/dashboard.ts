export interface DashboardSummary {
  title: string;
  description: string;
  lastUpdated: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  uptime: string;
}
