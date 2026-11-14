export interface RawTransactionRecord {
  id: string;
  userId: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  timestamp: string;
  metadata: {
    channel: 'web' | 'mobile' | 'pos' | 'wire';
    ipCountry: string;
  };
}

export class RawTransactionsDatabase {
  private records: RawTransactionRecord[] = [
    { id: 'tx-001', userId: 'usr-10', amount: 1500.0, currency: 'USD', timestamp: '2026-10-19T10:00:00Z', metadata: { channel: 'web', ipCountry: 'US' } },
    { id: 'tx-002', userId: 'usr-20', amount: 250.0, currency: 'EUR', timestamp: '2026-10-19T10:01:00Z', metadata: { channel: 'pos', ipCountry: 'DE' } },
    { id: 'tx-003', userId: 'usr-30', amount: -45.0, currency: 'USD', timestamp: '2026-10-19T10:02:00Z', metadata: { channel: 'mobile', ipCountry: 'US' } },
    { id: 'tx-004', userId: 'usr-10', amount: 7200.0, currency: 'USD', timestamp: '2026-10-19T10:03:00Z', metadata: { channel: 'web', ipCountry: 'US' } },
    { id: 'tx-005', userId: 'usr-40', amount: 800000.0, currency: 'GBP', timestamp: '2026-10-19T10:04:00Z', metadata: { channel: 'wire', ipCountry: 'GB' } },
    { id: 'tx-006', userId: 'usr-50', amount: 320.0, currency: 'GBP', timestamp: '2026-10-19T10:05:00Z', metadata: { channel: 'mobile', ipCountry: 'GB' } },
    { id: 'tx-007', userId: 'usr-60', amount: 1800.0, currency: 'EUR', timestamp: '2026-10-19T10:06:00Z', metadata: { channel: 'web', ipCountry: 'FR' } },
  ];

  async *streamTransactions(): AsyncIterable<RawTransactionRecord> {
    for (const record of this.records) {
      yield { ...record };
    }
  }

  async getAll(): Promise<RawTransactionRecord[]> {
    return [...this.records];
  }
}

export interface SelectionRule {
  minAmount: number;
  maxAmount: number;
  allowedCurrencies: string[];
  restrictedCountries: string[];
}

export class SelectionRulesDatabase {
  async getActiveRules(): Promise<SelectionRule> {
    return {
      minAmount: 1.0,
      maxAmount: 100000.0,
      allowedCurrencies: ['USD', 'EUR', 'GBP'],
      restrictedCountries: ['NK', 'IR'],
    };
  }
}

export interface CurrencyRiskAggregate {
  currency: string;
  transactionCount: number;
  totalVolumeUSD: number;
  averageRiskScore: number;
  maxTransactionUSD: number;
}

export class AnalyticsDatabase {
  private analyticsStore = new Map<string, CurrencyRiskAggregate>();

  async persistAggregate(currency: string, aggregate: CurrencyRiskAggregate): Promise<void> {
    this.analyticsStore.set(currency, aggregate);
  }

  async getAllAggregates(): Promise<CurrencyRiskAggregate[]> {
    return Array.from(this.analyticsStore.values());
  }
}

export interface ExecutiveAuditReport {
  id: string;
  generatedAt: string;
  totalTransactionsProcessed: number;
  totalGrossUSD: number;
  totalTaxCollectedUSD: number;
  currencySummaries: CurrencyRiskAggregate[];
}

export class ExecutiveReportDatabase {
  private reports: ExecutiveAuditReport[] = [];

  async saveExecutiveReport(report: ExecutiveAuditReport): Promise<void> {
    this.reports.push(report);
  }

  getLatestReport(): ExecutiveAuditReport | null {
    return this.reports[this.reports.length - 1] ?? null;
  }
}
