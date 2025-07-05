import React from 'react';

interface PaymentHistoryVisualProps {
  paymentPattern: string;
  compact?: boolean;
}

export function PaymentHistoryVisual({
  paymentPattern,
  compact = false,
}: PaymentHistoryVisualProps) {
  const generatePaymentHistory = () => {
    // Use the full actual payment pattern data available
    const pattern = paymentPattern || 'CCCCCCCCCCCCCCCCCCCCCCC';
    return pattern.split('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'C':
        return 'bg-green-500';
      case '1':
        return 'bg-yellow-500';
      case '2':
        return 'bg-orange-500';
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'C':
        return 'Current';
      case '1':
        return '30 days late';
      case '2':
        return '60 days late';
      case '3':
        return '90 days late';
      case '4':
        return '120 days late';
      case '5':
        return '150 days late';
      case '6':
        return '180 days late';
      case '7':
        return '210+ days late';
      default:
        return 'No data';
    }
  };

  const paymentHistory = generatePaymentHistory();

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact Payment Pattern Visual */}
        <div className="flex flex-wrap gap-0.5">
          {paymentHistory.map((status, i) => {
            const monthsAgo = paymentHistory.length - 1 - i;
            const date = new Date();
            date.setMonth(date.getMonth() - monthsAgo);
            const monthYear = date.toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' });

            return (
              <div
                key={i}
                className={`w-3 h-3 ${getStatusColor(status)} border border-gray-300 flex-center text-white text-xs font-bold`}
                title={`${monthYear}: ${getStatusTitle(status)}`}
              ></div>
            );
          })}
        </div>

        {/* Compact Legend */}
        <div className="text-xs text-gray-500 flex gap-3">
          <span>🟢 Current</span>
          <span>🟡 30d</span>
          <span>🟠 60d</span>
          <span>🔴 90d+</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        {paymentHistory.length}-Month Payment History
      </h4>
      <div className="space-y-3">
        {/* Payment Pattern Visual */}
        <div className="flex flex-wrap gap-1">
          {paymentHistory.map((status, i) => {
            const monthsAgo = paymentHistory.length - 1 - i;
            const date = new Date();
            date.setMonth(date.getMonth() - monthsAgo);
            const monthYear = date.toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' });

            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 ${getStatusColor(status)} border border-gray-300 flex-center text-white text-xs font-bold`}
                  title={`${monthYear}: ${getStatusTitle(status)}`}
                >
                  {status}
                </div>
                <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-center w-8 text-center">
                  {monthYear}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Payment Status Legend:</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 border"></div>
              <span>C = Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 border"></div>
              <span>1 = 30 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 border"></div>
              <span>2 = 60 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 border"></div>
              <span>3+ = 90+ days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
