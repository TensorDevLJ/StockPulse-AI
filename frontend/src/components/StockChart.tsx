import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:8000";

interface ChartData {
  price: number;
  timestamp: string;
  time: string;
}

interface StockChartProps {
  symbol: string;
}

const StockChart = ({ symbol }: StockChartProps) => {
  const [data, setData] = useState<ChartData[]>([]);
  const { toast } = useToast();

const fetchHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${symbol}`);
    if (!response.ok) throw new Error("Failed to fetch history");
    const result = await response.json();

    // FIX: access result.history (not result directly)
    const history = result.history || [];

    const formatted = history.slice(-20).map((item: any) => ({
      price: item.price,
      timestamp: item.timestamp,
      time: new Date(item.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    }));

    setData(formatted);
  } catch (error) {
    console.error("Error fetching history:", error);
    toast({
      title: "Fetch Error",
      description: "Unable to load stock history. Check backend connection.",
      variant: "destructive",
    });
  }
};


  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>Collecting price data... This may take a few minutes.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="time" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          domain={['auto', 'auto']}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockChart;
