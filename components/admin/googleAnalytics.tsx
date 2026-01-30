import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { LoadingAnimation } from '../ui/loading-animation';

type AnalyticsRow = {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
};

type ChartData = {
  date: string;
  activeUsers: number;
  formattedDate: string;
};

type AnalyticsData = {
  data: AnalyticsRow[];
  realtimeUsers?: number;
};

export default function GoogleAnalytics() {
  const [data, setData] = useState<AnalyticsRow[] | null>(null);
  const [realtimeUsers, setRealtimeUsers] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/gAnalyse');
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
        }
        
        const json: AnalyticsData = await res.json();
        setData(json.data);
        setRealtimeUsers(json.realtimeUsers || null);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Format data for the chart
  const chartData: ChartData[] = data?.map((row) => {
    const dateStr = row.dimensionValues[0].value;
    const activeUsers = parseInt(row.metricValues[0].value, 10);
    
    // Format date from YYYYMMDD to readable format
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const formattedDate = `${month}/${day}`;
    
    return {
      date: dateStr,
      activeUsers,
      formattedDate,
    };
  }) || [];

  // Calculate total active users
  const totalActiveUsers = chartData.reduce((sum, item) => sum + item.activeUsers, 0);
  const averageActiveUsers = chartData.length > 0 ? Math.round(totalActiveUsers / chartData.length) : 0;
  const maxActiveUsers = Math.max(...chartData.map(item => item.activeUsers), 0);

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="font-serif text-2xl font-medium mb-6">Google Analytics</h2>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardContent className="flex items-center justify-center p-12">
            <LoadingAnimation size={60} className="text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="font-serif text-2xl font-medium mb-6">Google Analytics</h2>
        <Card className="bg-destructive/5 backdrop-blur-sm border-destructive/20 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-destructive font-medium mb-2">Erreur de chargement des analytics</h3>
            <p className="text-destructive/80 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors text-sm"
            >
              Réessayer
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="font-serif text-2xl font-medium mb-6">Google Analytics</h2>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardContent className="p-6">
            <p className="text-muted-foreground">Aucune donnée analytique disponible</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-12">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-medium mb-2">Google Analytics</h2>
        <p className="text-muted-foreground">Utilisateurs actifs au cours des 30 derniers jours</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Realtime Users Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Utilisateurs actifs</CardTitle>
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground"></span>
            </span>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-xs opacity-75 mb-2">au cours des 30 dernières minutes</p>
            <div className="text-3xl font-serif font-medium">
              {realtimeUsers !== null ? realtimeUsers.toLocaleString() : '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-medium">{totalActiveUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moyenne Quotidienne</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-medium">{averageActiveUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pic Quotidien</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-medium">{maxActiveUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-medium">Tendance des Utilisateurs Actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="formattedDate" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ fontWeight: '500', marginBottom: '4px', color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '14px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                name="Utilisateurs Actifs"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}