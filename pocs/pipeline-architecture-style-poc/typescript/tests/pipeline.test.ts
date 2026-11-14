import test from 'node:test';
import assert from 'node:assert/strict';
import { AsyncQueuePipe } from '../src/core/pipe.js';
import {
  RawTransactionsDatabase,
  SelectionRulesDatabase,
  AnalyticsDatabase,
  ExecutiveReportDatabase
} from '../src/infrastructure/databases.js';
import {
  RawDataProducerFilter,
  SelectionRulesTesterFilter,
  CurrencyTaxTransformerFilter,
  RiskAnalyticsMapReduceFilter,
  ExecutiveReportConsumerFilter
} from '../src/filters/AllFilters.js';
import { runMonolithicPipeline } from '../src/monolithic-runner.js';

test('AsyncQueuePipe: verifies FIFO and close behavior', async () => {
  const pipe = new AsyncQueuePipe<number>(5);
  await pipe.send(10);
  await pipe.send(20);
  pipe.close();

  const item1 = await pipe.receive();
  const item2 = await pipe.receive();
  const item3 = await pipe.receive();

  assert.equal(item1, 10);
  assert.equal(item2, 20);
  assert.equal(item3, null);
  assert.equal(pipe.isClosed(), true);
});

test('SelectionRulesTesterFilter: filters out invalid/negative transactions', async () => {
  const rulesDb = new SelectionRulesDatabase();
  const tester = new SelectionRulesTesterFilter(rulesDb);

  const validRecord = {
    id: 'tx-test-valid',
    userId: 'usr-1',
    amount: 100,
    currency: 'USD' as const,
    timestamp: '2026-10-19T00:00:00Z',
    metadata: { channel: 'web' as const, ipCountry: 'US' },
  };

  const invalidRecord = {
    id: 'tx-test-invalid',
    userId: 'usr-2',
    amount: -10,
    currency: 'USD' as const,
    timestamp: '2026-10-19T00:00:00Z',
    metadata: { channel: 'web' as const, ipCountry: 'US' },
  };

  const passResult = await tester.execute(validRecord);
  const failResult = await tester.execute(invalidRecord);

  assert.notEqual(passResult, null);
  assert.equal(failResult, null);
});

test('CurrencyTaxTransformerFilter: converts EUR to USD with 15% tax', async () => {
  const transformer = new CurrencyTaxTransformerFilter();
  const record = {
    id: 'tx-eur',
    userId: 'usr-eu',
    amount: 100,
    currency: 'EUR' as const,
    timestamp: '2026-10-19T00:00:00Z',
    metadata: { channel: 'web' as const, ipCountry: 'DE' },
  };

  const result = await transformer.execute(record);
  assert.equal(result.amountUSD, 108.0);
  assert.equal(result.taxUSD, 16.2);
  assert.equal(result.netUSD, 91.8);
});

test('End-to-End Monolithic Pipeline completes and saves executive report', async () => {
  const report = await runMonolithicPipeline();
  assert.notEqual(report, null);
  assert.ok(report!.totalTransactionsProcessed > 0);
  assert.ok(report!.currencySummaries.length > 0);
});
