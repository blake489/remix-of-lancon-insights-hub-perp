// Utility functions for formatting values

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
  }
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatVariance(value: number, isPercent = false): string {
  const prefix = value >= 0 ? '+' : '';
  if (isPercent) {
    return `${prefix}${value.toFixed(1)}pp`;
  }
  return `${prefix}${formatCurrency(value, true)}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

export function getMonthName(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getCurrentFortnight(): 1 | 2 {
  const day = new Date().getDate();
  return day <= 14 ? 1 : 2;
}

export function getFortnightDates(month: string, fortnight: 1 | 2): { start: string; end: string } {
  const [year, monthNum] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNum, 0).getDate();
  
  if (fortnight === 1) {
    return {
      start: `${month}-01`,
      end: `${month}-14`,
    };
  }
  return {
    start: `${month}-15`,
    end: `${month}-${lastDay}`,
  };
}
