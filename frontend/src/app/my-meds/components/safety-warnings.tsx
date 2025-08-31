'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';

interface SafetyWarning {
  type: 'MAX_DOSE' | 'INTERACTION' | 'CONTRAINDICATION' | 'AGE_RESTRICTION' | 'FREQUENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  recommendation?: string;
  icon: string;
  color: string;
}

interface SafetyWarningsProps {
  warnings: SafetyWarning[];
  onAcknowledge?: () => void;
  showAcknowledgeButton?: boolean;
}

export function SafetyWarnings({ warnings, onAcknowledge, showAcknowledgeButton = false }: SafetyWarningsProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="h-5 w-5" />;
      case 'HIGH':
        return <AlertTriangle className="h-5 w-5" />;
      case 'MEDIUM':
        return <AlertCircle className="h-5 w-5" />;
      case 'LOW':
        return <Info className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-800';
      case 'HIGH':
        return 'text-orange-800';
      case 'MEDIUM':
        return 'text-yellow-800';
      case 'LOW':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MAX_DOSE':
        return 'حداکثر دوز';
      case 'INTERACTION':
        return 'تداخل دارویی';
      case 'CONTRAINDICATION':
        return 'منع مصرف';
      case 'AGE_RESTRICTION':
        return 'محدودیت سنی';
      case 'FREQUENCY':
        return 'فاصله زمانی';
      default:
        return 'هشدار';
    }
  };

  const criticalWarnings = warnings.filter(w => w.severity === 'CRITICAL');
  const otherWarnings = warnings.filter(w => w.severity !== 'CRITICAL');

  return (
    <div className="space-y-4">
      {/* Critical Warnings */}
      {criticalWarnings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">هشدارهای مهم</h3>
          </div>
          {criticalWarnings.map((warning, index) => (
            <Alert key={index} className={`${getSeverityBgColor(warning.severity)} border-2`}>
              <div className="flex items-start gap-3">
                <div className={`${getSeverityTextColor(warning.severity)} mt-0.5`}>
                  {getSeverityIcon(warning.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTitle className={getSeverityTextColor(warning.severity)}>
                      {warning.icon} {getTypeLabel(warning.type)}
                    </AlertTitle>
                    <Badge variant={getSeverityColor(warning.severity) as "default" | "destructive" | "outline" | "secondary"} className="text-xs">
                      {warning.severity === 'CRITICAL' ? 'بحرانی' : 
                       warning.severity === 'HIGH' ? 'بالا' :
                       warning.severity === 'MEDIUM' ? 'متوسط' : 'پایین'}
                    </Badge>
                  </div>
                  <AlertDescription className={`${getSeverityTextColor(warning.severity)} mb-2`}>
                    {warning.message}
                  </AlertDescription>
                  {warning.recommendation && (
                    <div className={`${getSeverityTextColor(warning.severity)} text-sm font-medium bg-white bg-opacity-50 rounded p-2`}>
                      💡 توصیه: {warning.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Other Warnings */}
      {otherWarnings.length > 0 && (
        <div className="space-y-3">
          {criticalWarnings.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">سایر هشدارها</h4>
            </div>
          )}
          {otherWarnings.map((warning, index) => (
            <Alert key={index} className={getSeverityBgColor(warning.severity)}>
              <div className="flex items-start gap-3">
                <div className={`${getSeverityTextColor(warning.severity)} mt-0.5`}>
                  {getSeverityIcon(warning.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTitle className={`${getSeverityTextColor(warning.severity)} text-sm`}>
                      {warning.icon} {getTypeLabel(warning.type)}
                    </AlertTitle>
                    <Badge variant={getSeverityColor(warning.severity) as "default" | "destructive" | "outline" | "secondary"} className="text-xs">
                      {warning.severity === 'HIGH' ? 'بالا' :
                       warning.severity === 'MEDIUM' ? 'متوسط' : 'پایین'}
                    </Badge>
                  </div>
                  <AlertDescription className={`${getSeverityTextColor(warning.severity)} text-sm mb-1`}>
                    {warning.message}
                  </AlertDescription>
                  {warning.recommendation && (
                    <div className={`${getSeverityTextColor(warning.severity)} text-xs bg-white bg-opacity-50 rounded p-2`}>
                      💡 {warning.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Acknowledge Button */}
      {showAcknowledgeButton && onAcknowledge && (
        <div className="flex justify-center pt-2">
          <Button 
            onClick={onAcknowledge}
            variant={criticalWarnings.length > 0 ? "outline" : "default"}
            className="w-full sm:w-auto"
          >
            {criticalWarnings.length > 0 ? 'متوجه شدم و مسئولیت را می‌پذیرم' : 'متوجه شدم'}
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="text-xs text-gray-600 text-center pt-2 border-t">
        {warnings.length} هشدار ایمنی شناسایی شد
        {criticalWarnings.length > 0 && (
          <span className="text-red-600 font-medium">
            {' '}(شامل {criticalWarnings.length} هشدار بحرانی)
          </span>
        )}
      </div>
    </div>
  );
}