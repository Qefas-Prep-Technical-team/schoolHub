export interface FinanceTransaction {
  id: string;
  amount: number;
  currency?: string;
  createdAt: string;
  paidAt?: string | null;
  paymentReference?: string;
  reference?: string;
  channel?: string;
  status: string;
  paymentType?: string;
  term?: string;
  session?: string;
  student?: {
    id?: string;
    name: string;
    studentCode?: string;
  } | null;
  parent?: {
    id?: string;
    fullName: string;
    email?: string;
    phone?: string;
  } | null;
  gatewayResponse?: Record<string, unknown> | null;
}

export interface FinanceSettlementAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: string;
  isDefault: boolean;
  totalSettled: number;
  paystackSubaccountCode?: string;
  flwSubaccountCode?: string;
}

export interface BankAccountAudit {
  id: string;
  schoolId: string;
  settlementAccountId?: string | null;
  action: string;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  gateway?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

export interface FinanceAnalytics {
  totalRevenue: number;
  pendingRevenue: number;
  activePayerCount: number;
  averageTransaction: number;
  monthlyTrends: Array<{ month: string; revenue: number; count: number }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  recentTransactions: FinanceTransaction[];
  paymentStatus: {
    color: string;
    message: string;
    label: string;
    status: string;
  };
  accounts: FinanceSettlementAccount[];
  bankAudits?: BankAccountAudit[];
  isVerified: boolean;
  transcriptRevenue?: number;
  transcriptCount?: number;
  transcriptTransactions?: FinanceTransaction[];
}

export interface PaginatedTransactionsResponse {
  success: boolean;
  transactions: FinanceTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

