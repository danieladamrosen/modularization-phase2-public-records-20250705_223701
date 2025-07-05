import { AlertTriangle, TrendingUp, CreditCard, Search, Clock, DollarSign } from 'lucide-react';

interface CategorySummary {
  category: string;
  count: number;
  avgImpact: number;
  totalImpact: number;
  impactLevel: 'High' | 'Medium' | 'Low';
  icon: React.ComponentType<{ className?: string }>;
}

interface DerogatoryImpactChartProps {
  creditData: any;
}

export function DerogatoryImpactChart({ creditData }: DerogatoryImpactChartProps) {
  if (!creditData?.CREDIT_RESPONSE?.CREDIT_LIABILITY) {
    return null;
  }

  const accounts = creditData.CREDIT_RESPONSE.CREDIT_LIABILITY;
  const reportDate = new Date(
    creditData.CREDIT_RESPONSE['@CreditReportFirstIssuedDate'] || '2023-07-06'
  );

  // Extract all credit factors that impact scores
  const categoryMap = new Map<
    string,
    { count: number; impacts: number[]; level: 'High' | 'Medium' | 'Low' }
  >();

  // 1. Analyze derogatory accounts
  const derogatoryAccounts = accounts.filter((account: any) => {
    return (
      account['@_DerogatoryDataIndicator'] === 'Y' ||
      account['@IsCollectionIndicator'] === 'Y' ||
      account['@IsChargeoffIndicator'] === 'Y' ||
      parseInt(account['@_PastDueAmount'] || '0') > 0 ||
      (account._CURRENT_RATING?.['@_Code'] &&
        ['2', '3', '4', '5', '6', '7', '8', '9'].includes(account._CURRENT_RATING['@_Code'])) ||
      account['@_ChargeOffDate']
    );
  });

  derogatoryAccounts.forEach((account: any) => {
    const pastDue = parseInt(account['@_PastDueAmount'] || '0');

    let category = 'Late Payments';
    let scoreImpact = 8; // VantageScore is more sensitive to payment history
    let impactLevel: 'High' | 'Medium' | 'Low' = 'Low';

    if (account['@IsChargeoffIndicator'] === 'Y') {
      category = 'Charge-offs';
      scoreImpact = 12; // More realistic VantageScore impact
      impactLevel = 'High';
    } else if (account['@IsCollectionIndicator'] === 'Y') {
      category = 'Collections';
      scoreImpact = 10; // Realistic collection impact
      impactLevel = 'High';
    } else if (pastDue > 0) {
      category = 'Past Due Accounts';
      scoreImpact = pastDue > 1000 ? 8 : 5;
      impactLevel = pastDue > 1000 ? 'Medium' : 'Low';
    } else if (account._CURRENT_RATING?.['@_Code']) {
      const rating = account._CURRENT_RATING['@_Code'];
      if (['8', '9'].includes(rating)) {
        category = 'Serious Delinquencies';
        scoreImpact = 10; // Realistic serious delinquency impact
        impactLevel = 'High';
      } else if (['6', '7'].includes(rating)) {
        category = '90+ Day Lates';
        scoreImpact = 8; // Realistic 90+ day impact
        impactLevel = 'High';
      } else if (['4', '5'].includes(rating)) {
        category = '60+ Day Lates';
        scoreImpact = 6; // Realistic 60+ day impact
        impactLevel = 'Medium';
      } else if (['2', '3'].includes(rating)) {
        category = '30+ Day Lates';
        scoreImpact = 4; // Realistic 30+ day impact
        impactLevel = 'Low';
      }
    }

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { count: 0, impacts: [], level: impactLevel });
    }

    const existing = categoryMap.get(category)!;
    existing.count++;
    existing.impacts.push(scoreImpact);
    if (impactLevel === 'High' || (impactLevel === 'Medium' && existing.level === 'Low')) {
      existing.level = impactLevel;
    }
  });

  // 2. Analyze credit utilization
  const openRevolvingAccounts = accounts.filter(
    (account: any) =>
      account['@_AccountType'] === 'Revolving' &&
      (account['@_AccountStatusType'] === 'Open' || !account['@IsClosedIndicator'])
  );

  let highUtilizationCount = 0;
  let totalUtilizationImpact = 0;
  let overallUtilization = 0;
  let totalBalances = 0;
  let totalLimits = 0;

  openRevolvingAccounts.forEach((account: any) => {
    const balance = parseInt(account.BalanceAmount || '0');
    const limit = parseInt(account['@_CreditLimitAmount'] || '0');

    if (limit > 0) {
      totalBalances += balance;
      totalLimits += limit;

      const utilization = (balance / limit) * 100;
      if (utilization > 30) {
        highUtilizationCount++;
        if (utilization > 90) {
          totalUtilizationImpact += 8; // Realistic high utilization impact
        } else if (utilization > 70) {
          totalUtilizationImpact += 6;
        } else if (utilization > 50) {
          totalUtilizationImpact += 4;
        } else {
          totalUtilizationImpact += 2;
        }
      }
    }
  });

  // Calculate overall utilization
  if (totalLimits > 0) {
    overallUtilization = (totalBalances / totalLimits) * 100;

    // Add impact for overall utilization over 30%
    if (overallUtilization > 30) {
      if (overallUtilization > 90) {
        totalUtilizationImpact += 10; // Realistic maxed out utilization impact
      } else if (overallUtilization > 70) {
        totalUtilizationImpact += 7;
      } else if (overallUtilization > 50) {
        totalUtilizationImpact += 5;
      } else {
        totalUtilizationImpact += 3;
      }
    }
  }

  if (totalUtilizationImpact > 0) {
    categoryMap.set('High Credit Utilization', {
      count: Math.max(highUtilizationCount, 1),
      impacts: [totalUtilizationImpact],
      level: totalUtilizationImpact > 15 ? 'High' : totalUtilizationImpact > 8 ? 'Medium' : 'Low',
    });
  }

  // 3. Analyze hard inquiries (using same logic as Hard Inquiries section)
  const isRecentInquiry = (dateString: string) => {
    if (!dateString) return false;
    const inquiryDate = new Date(dateString);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    return inquiryDate > twoYearsAgo;
  };

  const createInquiryItems = (inquiries: any[], bureauName: string) => {
    return inquiries.map((inquiry: any, index: number) => ({
      id: `${bureauName.toLowerCase()}-inquiry-${index}`,
      bureau: bureauName,
      name: inquiry['@_Name'] || 'Unknown Company',
      date: inquiry['@_Date'] || '',
      type: inquiry['@CreditBusinessType'] || 'Unknown',
      isRecent: isRecentInquiry(inquiry['@_Date'] || ''),
    }));
  };

  // Get all inquiry items from all bureaus (same as Hard Inquiries section)
  const allInquiryItems = [
    ...createInquiryItems(
      creditData.CREDIT_RESPONSE?.CREDIT_INQUIRY?.filter(
        (i: any) => i['@CreditFileID'] === 'EA01'
      ) || [],
      'Equifax'
    ),
    ...createInquiryItems(
      creditData.CREDIT_RESPONSE?.CREDIT_INQUIRY?.filter(
        (i: any) => i['@CreditFileID'] === 'RA01'
      ) || [],
      'Experian'
    ),
    ...createInquiryItems(
      creditData.CREDIT_RESPONSE?.CREDIT_INQUIRY?.filter(
        (i: any) => i['@CreditFileID'] === 'TA01'
      ) || [],
      'TransUnion'
    ),
  ];

  // Count recent inquiries that impact credit score (within 24 months)
  const recentInquiries = allInquiryItems.filter((item) => item.isRecent);

  if (recentInquiries.length > 0) {
    // Realistic VantageScore inquiry impact
    const inquiryImpact =
      recentInquiries.length === 1
        ? 1
        : recentInquiries.length === 2
          ? 2
          : Math.min(recentInquiries.length * 2, 8);

    categoryMap.set('Hard Inquiries', {
      count: recentInquiries.length,
      impacts: [inquiryImpact],
      level: inquiryImpact > 4 ? 'Medium' : 'Low',
    });
  }

  // 4. Analyze credit age (thin file or new accounts)
  const allAccounts = accounts.filter((account: any) => account.AccountOpenedDate);
  const accountAges = allAccounts.map((account: any) => {
    const openDate = new Date(account.AccountOpenedDate);
    return (reportDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24 * 365); // Years
  });

  const avgAge =
    accountAges.length > 0
      ? accountAges.reduce((sum: number, age: number) => sum + age, 0) / accountAges.length
      : 0;
  const newAccountsCount = accountAges.filter((age: number) => age < 1).length;

  if (avgAge < 4 || newAccountsCount > 2) {
    const ageImpact = Math.min((avgAge < 2 ? 6 : 4) + newAccountsCount * 2, 10); // Realistic age impact

    categoryMap.set('Limited Credit History', {
      count: newAccountsCount > 0 ? newAccountsCount : 1,
      impacts: [ageImpact],
      level: ageImpact > 6 ? 'Medium' : 'Low',
    });
  }

  // Function to get appropriate icon for category
  const getCategoryIcon = (category: string) => {
    if (category.includes('Charge-off') || category.includes('Collection')) return AlertTriangle;
    if (category.includes('Utilization')) return CreditCard;
    if (category.includes('Inquiries')) return Search;
    if (category.includes('History') || category.includes('Age')) return Clock;
    return DollarSign; // Default for other payment-related issues
  };

  // Convert to sorted array
  const categories: CategorySummary[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      avgImpact: Math.round(
        data.impacts.reduce((sum, impact) => sum + impact, 0) / data.impacts.length
      ),
      totalImpact: data.impacts.reduce((sum, impact) => sum + impact, 0),
      impactLevel: data.level,
      icon: getCategoryIcon(category),
    }))
    .sort((a, b) => b.totalImpact - a.totalImpact);

  if (categories.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">No Major Credit Score Impact</span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          No significant derogatory items affecting credit scores.
        </p>
      </div>
    );
  }

  const totalPotentialGain = categories.reduce((sum, cat) => sum + cat.totalImpact, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 md:w-4 md:h-4 text-green-600" />
            <h3 className="font-bold text-base md:text-sm text-gray-900">Score Impact</h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">+{totalPotentialGain}</div>
            <div className="text-xs text-gray-600">points</div>
          </div>
        </div>
      </div>

      <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <div key={index} className="flex-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <IconComponent
                  className={`hidden md:block w-4 h-4 ${
                    category.impactLevel === 'High'
                      ? 'text-red-600'
                      : category.impactLevel === 'Medium'
                        ? 'text-orange-600'
                        : 'text-yellow-600'
                  }`}
                />
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    <span className="md:hidden">
                      {category.category === 'Past Due Accounts' ? 'Past Due' : 
                       category.category === 'High Credit Utilization' ? 'High Utilization' : 
                       category.category}
                    </span>
                    <span className="hidden md:inline">{category.category}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.count} {category.count === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>
              <div className="text-lg md:text-sm font-bold text-green-600">+{category.totalImpact}</div>
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 bg-green-50 border-t border-gray-200 rounded-b-lg">
        <p className="text-sm md:text-xs text-gray-600 text-center">
          <span className="md:hidden">Potential gain from fixing these issues</span>
          <span className="hidden md:inline">Potential score improvement from addressing these items</span>
        </p>
      </div>
    </div>
  );
}

function getAccountTypeDisplay(accountType: string): string {
  const typeMap: { [key: string]: string } = {
    Revolving: 'Credit Card',
    Installment: 'Loan',
    Mortgage: 'Mortgage',
    OpenAccount: 'Open Account',
  };
  return typeMap[accountType] || accountType;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(amount);
}
