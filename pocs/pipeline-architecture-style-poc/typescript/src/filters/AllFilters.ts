import { FilterType, IProducerFilter, ITesterFilter, ITransformerFilter, IConsumerFilter } from '../core/types.js';
import {
  RawTransactionRecord,
  RawTransactionsDatabase,
  SelectionRulesDatabase,
  AnalyticsDatabase,
  ExecutiveReportDatabase,
  CurrencyRiskAggregate,
  ExecutiveAuditReport
} from '../infrastructure/databases.js';
import { MapReduceEngine } from '../core/map-reduce.js';

export class RawDataProducerFilter implements IProducerFilter<RawTransactionRecord> {
  readonly name = 'RawDataProducer';
  readonly type = FilterType.PRODUCER;

  constructor(private readonly rawDb: RawTransactionsDatabase) {}

  async execute(): Promise<AsyncIterable<RawTransactionRecord>> {
    return this.rawDb.streamTransactions();
  }
}

export class SelectionRulesTesterFilter implements ITesterFilter<RawTransactionRecord> {
  readonly name = 'SelectionRulesTester';
  readonly type = FilterType.TESTER;

  constructor(private readonly rulesDb: SelectionRulesDatabase) {}

  async test(item: RawTransactionRecord): Promise<boolean> {
    const rules = await this.rulesDb.getActiveRules();
    const isAmountValid = item.amount >= rules.minAmount && item.amount <= rules.maxAmount;
    const isCurrencyAllowed = rules.allowedCurrencies.includes(item.currency);
    const isCountryAllowed = !rules.restrictedCountries.includes(item.metadata.ipCountry);
    return isAmountValid && isCurrencyAllowed && isCountryAllowed;
  }

  async execute(input: RawTransactionRecord): Promise<RawTransactionRecord | null> {
    const passed = await this.test(input);
    if (!passed) {
      console.warn(`  [Tester] Rejected transaction ${input.id} (Amount: ${input.amount} ${input.currency})`);
      return null;
    }
    return input;
  }
}

export interface EnrichedTransaction {
  id: string;
  userId: string;
  originalAmount: number;
  originalCurrency: string;
  amountUSD: number;
  taxUSD: number;
  netUSD: number;
  riskScore: number;
  channel: string;
}

export class CurrencyTaxTransformerFilter implements ITransformerFilter<RawTransactionRecord, EnrichedTransaction> {
  readonly name = 'CurrencyTaxTransformer';
  readonly type = FilterType.TRANSFORMER;

  private exchangeRates: Record<string, number> = {
    USD: 1.0,
    EUR: 1.08,
    GBP: 1.29,
  };

  async execute(input: RawTransactionRecord): Promise<EnrichedTransaction> {
    const rate = this.exchangeRates[input.currency] ?? 1.0;
    const amountUSD = input.amount * rate;
    const taxUSD = amountUSD * 0.15;
    const netUSD = amountUSD - taxUSD;

    let riskScore = 0.1;
    if (amountUSD > 5000) riskScore += 0.4;
    if (input.metadata.channel === 'wire') riskScore += 0.3;

    return {
      id: input.id,
      userId: input.userId,
      originalAmount: input.amount,
      originalCurrency: input.currency,
      amountUSD,
      taxUSD,
      netUSD,
      riskScore: Math.min(riskScore, 1.0),
      channel: input.metadata.channel,
    };
  }
}

export class RiskAnalyticsMapReduceFilter implements ITransformerFilter<EnrichedTransaction[], CurrencyRiskAggregate[]> {
  readonly name = 'RiskAnalyticsMapReduce';
  readonly type = FilterType.TRANSFORMER;
  private mapReduce: MapReduceEngine<EnrichedTransaction, string, { amountUSD: number; risk: number }, CurrencyRiskAggregate>;

  constructor(private readonly analyticsDb: AnalyticsDatabase) {
    this.mapReduce = new MapReduceEngine<EnrichedTransaction, string, { amountUSD: number; risk: number }, CurrencyRiskAggregate>(
      async (tx) => [
        {
          key: tx.originalCurrency,
          value: { amountUSD: tx.amountUSD, risk: tx.riskScore },
        },
      ],
      async (currency, intermediateList) => {
        const transactionCount = intermediateList.length;
        const totalVolumeUSD = intermediateList.reduce((acc, cur) => acc + cur.amountUSD, 0);
        const averageRiskScore = intermediateList.reduce((acc, cur) => acc + cur.risk, 0) / transactionCount;
        const maxTransactionUSD = Math.max(...intermediateList.map((cur) => cur.amountUSD));

        return {
          currency,
          transactionCount,
          totalVolumeUSD,
          averageRiskScore,
          maxTransactionUSD,
        };
      }
    );
  }

  async execute(transactions: EnrichedTransaction[]): Promise<CurrencyRiskAggregate[]> {
    const aggregatesMap = await this.mapReduce.process(transactions);
    const aggregates: CurrencyRiskAggregate[] = [];

    for (const [currency, aggregate] of aggregatesMap.entries()) {
      await this.analyticsDb.persistAggregate(currency, aggregate);
      aggregates.push(aggregate);
    }

    return aggregates;
  }
}

export interface PipelineFinalPayload {
  transactions: EnrichedTransaction[];
  aggregates: CurrencyRiskAggregate[];
}

export class ExecutiveReportConsumerFilter implements IConsumerFilter<PipelineFinalPayload> {
  readonly name = 'ExecutiveReportConsumer';
  readonly type = FilterType.CONSUMER;

  constructor(private readonly reportDb: ExecutiveReportDatabase) {}

  async execute(payload: PipelineFinalPayload): Promise<void> {
    const totalTransactionsProcessed = payload.transactions.length;
    const totalGrossUSD = payload.transactions.reduce((sum, tx) => sum + tx.amountUSD, 0);
    const totalTaxCollectedUSD = payload.transactions.reduce((sum, tx) => sum + tx.taxUSD, 0);

    const report: ExecutiveAuditReport = {
      id: `rep-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      totalTransactionsProcessed,
      totalGrossUSD,
      totalTaxCollectedUSD,
      currencySummaries: payload.aggregates,
    };

    await this.reportDb.saveExecutiveReport(report);

    console.log('\n================== EXECUTIVE AUDIT REPORT (CONSUMER SINK) ==================');
    console.log(`Report ID:          ${report.id}`);
    console.log(`Timestamp:          ${report.generatedAt}`);
    console.log(`Total Processed:    ${report.totalTransactionsProcessed} valid transactions`);
    console.log(`Gross Volume (USD): $${report.totalGrossUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    console.log(`Tax Retained (USD): $${report.totalTaxCollectedUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    console.log(`----------------------------------------------------------------------------`);
    console.log(`Aggregates by Currency (MapReduce Output):`);
    for (const summary of report.currencySummaries) {
      console.log(
        `  • [${summary.currency}] Count: ${summary.transactionCount} | ` +
        `Volume: $${summary.totalVolumeUSD.toFixed(2)} USD | ` +
        `Avg Risk: ${(summary.averageRiskScore * 100).toFixed(1)}% | ` +
        `Max Tx: $${summary.maxTransactionUSD.toFixed(2)} USD`
      );
    }
    console.log('============================================================================\n');
  }
}
