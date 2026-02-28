import { useState } from 'react';
import { MagicEquationHeader } from '@/components/dashboard/MagicEquationHeader';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  getCurrentKPIData,
  getFortnight1KPIData,
  getPreviousFortnightKPIData,
} from '@/data/mockData';
import { getCurrentMonth, getCurrentFortnight } from '@/lib/formatters';
import { Sparkles } from 'lucide-react';

const availableMonths = [
  '2025-02',
  '2025-01',
  '2024-12',
  '2024-11',
];

const Magic = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedFortnight, setSelectedFortnight] = useState<1 | 2>(getCurrentFortnight());
  const monthlyKPI = getCurrentKPIData();
  const currentFortnightKPI = getFortnight1KPIData();
  const previousFortnightKPI = getPreviousFortnightKPIData();

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold text-foreground">Magic Equation</h1>
                </div>
                <TodayWidget variant="inline" />
              </div>
              <DashboardFilters
                selectedMonth={selectedMonth}
                selectedFortnight={selectedFortnight}
                availableMonths={availableMonths}
                onMonthChange={setSelectedMonth}
                onFortnightChange={setSelectedFortnight}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <MagicEquationHeader
            monthlyKPI={monthlyKPI}
            currentFortnightKPI={currentFortnightKPI}
            previousFortnightKPI={previousFortnightKPI}
            selectedMonth={selectedMonth}
            selectedFortnight={selectedFortnight}
          />
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Magic;
