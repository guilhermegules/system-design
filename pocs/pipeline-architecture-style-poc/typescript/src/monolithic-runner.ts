import {
  RawTransactionsDatabase,
  SelectionRulesDatabase,
  AnalyticsDatabase,
  ExecutiveReportDatabase
} from './infrastructure/databases.js';
import {
  RawDataProducerFilter,
  SelectionRulesTesterFilter,
  CurrencyTaxTransformerFilter,
  RiskAnalyticsMapReduceFilter,
  ExecutiveReportConsumerFilter,
  EnrichedTransaction
} from './filters/AllFilters.js';
import { AsyncQueuePipe } from './core/pipe.js';

export async function runMonolithicPipeline() {
  console.log('================================================================');
  console.log('>>> [START] Monolithic In-Memory Pipeline (Pipes & Filters)');
  console.log('================================================================');

  const rawDb = new RawTransactionsDatabase();
  const rulesDb = new SelectionRulesDatabase();
  const analyticsDb = new AnalyticsDatabase();
  const reportDb = new ExecutiveReportDatabase();

  const producer = new RawDataProducerFilter(rawDb);
  const tester = new SelectionRulesTesterFilter(rulesDb);
  const transformer = new CurrencyTaxTransformerFilter();
  const mapReducer = new RiskAnalyticsMapReduceFilter(analyticsDb);
  const consumer = new ExecutiveReportConsumerFilter(reportDb);

  const rawPipe = new AsyncQueuePipe<any>(50);
  const validatedPipe = new AsyncQueuePipe<any>(50);

  const producerTask = (async () => {
    const stream = await producer.execute();
    for await (const record of stream) {
      console.log(`  [Producer] Emitted transaction: ${record.id} (${record.amount} ${record.currency})`);
      await rawPipe.send(record);
    }
    rawPipe.close();
  })();

  const testerTask = (async () => {
    while (true) {
      const record = await rawPipe.receive();
      if (record === null) break;
      const tested = await tester.execute(record);
      if (tested !== null) {
        await validatedPipe.send(tested);
      }
    }
    validatedPipe.close();
  })();

  const enrichedBatch: EnrichedTransaction[] = [];
  const transformerTask = (async () => {
    while (true) {
      const record = await validatedPipe.receive();
      if (record === null) break;
      const enriched = await transformer.execute(record);
      enrichedBatch.push(enriched);
      console.log(`  [Transformer] Normalized ${enriched.id} -> $${enriched.amountUSD.toFixed(2)} USD (Risk: ${(enriched.riskScore * 100).toFixed(0)}%)`);
    }
  })();

  await Promise.all([producerTask, testerTask, transformerTask]);

  console.log(`\n  [MapReduce] Processing batch of ${enrichedBatch.length} records...`);
  const aggregates = await mapReducer.execute(enrichedBatch);

  await consumer.execute({ transactions: enrichedBatch, aggregates });

  console.log('>>> [SUCCESS] Monolithic Pipeline completed.\n');
  return reportDb.getLatestReport();
}

if (process.argv[1]?.endsWith('monolithic-runner.ts')) {
  runMonolithicPipeline().catch(console.error);
}
