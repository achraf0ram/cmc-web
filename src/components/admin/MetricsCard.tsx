
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  previousValue,
  description,
  trend = 'neutral',
  icon: Icon = BarChart3,
  className
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculatePercentageChange = () => {
    if (previousValue && typeof value === 'number') {
      const change = ((value - previousValue) / previousValue) * 100;
      return Math.abs(change).toFixed(1);
    }
    return null;
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {previousValue && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn("text-xs font-medium", getTrendColor())}>
                {calculatePercentageChange()}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
