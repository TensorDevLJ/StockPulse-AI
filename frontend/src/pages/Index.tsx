import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StockChart from "@/components/StockChart";
import PredictionCard from "@/components/PredictionCard";
import { getLatestStock, getPrediction } from "@/lib/api";  // ✅ Import API helpers

interface StockData {
  symbol: string;
  price: number;
  timestamp: string;
}

interface PredictionData {
  symbol: string;
  current_price: number;
  predicted_price: number;
  trend: "uptrend" | "downtrend";
  confidence_lower: number;
  confidence_upper: number;
}

const Index = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLatestPrice = async () => {
    try {
      const data = await getLatestStock(selectedSymbol); // ✅ use helper
      setStockData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Make sure the Python backend is running.",
        variant: "destructive",
      });
    }
  };

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const data = await getPrediction(selectedSymbol); // ✅ use helper
      setPrediction(data);
    } catch (error) {
      toast({
        title: "Prediction Error",
        description: "Not enough data yet. The backend needs more stock history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestPrice();
    fetchPrediction();

    const interval = setInterval(fetchLatestPrice, 5000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                StockPulse AI Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time prices with AI-powered insights
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Activity className="h-4 w-4 animate-pulse text-green-500" />
              Live
            </Badge>
          </div>
        </header>

        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Stock</CardTitle>
              <CardDescription>Choose a stock to track</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AAPL">Apple (AAPL)</SelectItem>
                  <SelectItem value="MSFT">Microsoft (MSFT)</SelectItem>
                  <SelectItem value="GOOGL">Google (GOOGL)</SelectItem>
                  <SelectItem value="TSLA">Tesla (TSLA)</SelectItem>
                  <SelectItem value="AMZN">Amazon (AMZN)</SelectItem>
                  <SelectItem value="META">Meta (META)</SelectItem>
                  <SelectItem value="NVDA">NVIDIA (NVDA)</SelectItem>
                </SelectContent>
              </Select>

              {stockData && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <span className="text-2xl font-bold">${stockData.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">{new Date(stockData.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              )}

              <Button onClick={fetchPrediction} disabled={loading} className="w-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh Prediction
              </Button>
            </CardContent>
          </Card>

          <PredictionCard prediction={prediction} loading={loading} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Real-time price movements</CardDescription>
          </CardHeader>
          <CardContent>
            <StockChart symbol={selectedSymbol} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
