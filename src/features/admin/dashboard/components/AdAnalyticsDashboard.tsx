'use client'
import React, { useEffect, useState } from 'react';
import { AxiosApi } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DashboardStats {
  total_impressions: number;
  total_unlocks: number;
  total_skips: number;
  total_completions: number;
  completion_rate: number;
  skip_rate: number;
  average_watch_duration: number;
}

interface UserBreakdown {
  user_type: string;
  total_events: number;
  impressions: number;
  unlocks: number;
  skips: number;
  completions: number;
}

const AdAnalyticsDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userBreakdown, setUserBreakdown] = useState<UserBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') ?? undefined;
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
      
      const [dashboardRes, breakdownRes] = await Promise.all([
        AxiosApi('admin', token).get(baseURL + '/ad-analytics/dashboard'),
        AxiosApi('admin', token).get(baseURL + '/ad-analytics/user-breakdown')
      ]);

      setStats(dashboardRes.data.data);
      setUserBreakdown(breakdownRes.data.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to fetch analytics",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ad Analytics Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="text-sm text-gray-500">Total Impressions</h3>
            <p className="text-2xl font-bold">{stats.total_impressions}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm text-gray-500">Total Unlocks</h3>
            <p className="text-2xl font-bold">{stats.total_unlocks}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm text-gray-500">Completion Rate</h3>
            <p className="text-2xl font-bold">{stats.completion_rate.toFixed(2)}%</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm text-gray-500">Skip Rate</h3>
            <p className="text-2xl font-bold">{stats.skip_rate.toFixed(2)}%</p>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">User Breakdown</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Type</TableHead>
              <TableHead>Total Events</TableHead>
              <TableHead>Impressions</TableHead>
              <TableHead>Unlocks</TableHead>
              <TableHead>Skips</TableHead>
              <TableHead>Completions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userBreakdown.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.user_type}</TableCell>
                <TableCell>{item.total_events}</TableCell>
                <TableCell>{item.impressions}</TableCell>
                <TableCell>{item.unlocks}</TableCell>
                <TableCell>{item.skips}</TableCell>
                <TableCell>{item.completions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdAnalyticsDashboard;
