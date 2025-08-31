import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function EducationalAlert() {
  return (
    <section className="py-6 px-4 md:py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-sm md:text-base">
            <strong>توجه مهم:</strong> این سیستم جایگزین مشاوره پزشک نیست. در صورت وجود علائم شدید یا ادامه‌دار، حتماً به پزشک مراجعه کنید.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  );
}