import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PredictionData {
  symbol: string;
  current_price: number;
  predicted_price: number;
  trend: "uptrend" | "downtrend";
  confidence_lower: number;
  confidence_upper: number;
}

interface PredictionCardProps {
  prediction: PredictionData | null;
  loading: boolean;
}

const PredictionCard = ({ prediction, loading }: PredictionCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Prediction</CardTitle>
          <CardDescription>Analyzing market trends...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (
    !prediction ||
    prediction.current_price === undefined ||
    prediction.predicted_price === undefined
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Prediction</CardTitle>
          <CardDescription>Gathering data for prediction</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground text-center">
            The AI model needs at least 10 historical data points.<br />
            Please wait while the backend collects data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const priceChange = prediction.predicted_price - prediction.current_price;
  const changePercent = (
    (priceChange / prediction.current_price) *
    100
  ).toFixed(2);

  const isUptrend = prediction.trend === "uptrend";

  return (
    <Card className={isUptrend ? "border-green-500/50" : "border-red-500/50"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Prediction</CardTitle>
          <Badge
            variant={isUptrend ? "default" : "destructive"}
            className="gap-1 capitalize"
          >
            {isUptrend ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {prediction.trend}
          </Badge>
        </div>
        <CardDescription>Short-term price forecast</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Current</span>
            <span className="font-semibold">
              ${prediction.current_price?.toFixed(2) ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Predicted</span>
            <span
              className={`font-bold text-lg ${
                isUptrend ? "text-green-600" : "text-red-600"
              }`}
            >
              ${prediction.predicted_price?.toFixed(2) ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Change</span>
            <span
              className={`font-semibold ${
                isUptrend ? "text-green-600" : "text-red-600"
              }`}
            >
              {priceChange > 0 ? "+" : ""}
              {priceChange?.toFixed(2) ?? "—"} ({changePercent ?? "—"}%)
            </span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confidence Range</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Lower</span>
            <span>
              ${prediction.confidence_lower?.toFixed(2) ?? "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Upper</span>
            <span>
              ${prediction.confidence_upper?.toFixed(2) ?? "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
