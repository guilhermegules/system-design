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
import { DistributedMessagePipe } from './core/pipe.js';

export async function runDistributedPipeline() {
  console.log('================================================================');
  console.log('>>> [START] Distributed Pipeline Simulation (Async Message Broker)');
  console.log('    Topology: Services interconnected via Network Topic Pipes');
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

  // Distributed Network Pipes (Simulated Kafka / RabbitMQ topics with latency)
  const rawTopicPipe = new DistributedMessagePipe<any>('transactions.raw.v1', 10);
  const validatedTopicPipe = new DistributedMessagePipe<any>('transactions.validated.v1', 10);

  // Service A (Producer Service)
  const serviceProducer = (async () => {
    const stream = await producer.execute();
    for await (const record of stream) {
      console.log(`  [Service: Producer] Published to broker topic '${rawTopicPipe.topicName}': ${record.id}`);
      await rawTopicPipe.send(record);
    }
    rawTopicPipe.close();
  })();

  // Service B (Tester / Compliance Service)
  const serviceTester = (async () => {
    while (true) {
      const record = await rawTopicPipe.receive();
      if (record === null) break;
      const tested = await tester.execute(record);
      if (tested !== null) {
        console.log(`  [Service: Tester] Forwarded valid record to '${validatedTopicPipe.topicName}': ${tested.id}`);
        await validatedTopicPipe.send(tested);
      }
    }
    validatedTopicPipe.close();
  })();

  // Service C (Transformation Service)
  const enrichedBatch: EnrichedTransaction[] = [];
  const serviceTransformer = (async () => {
    while (true) {
      const record = await validatedTopicPipe.receive();
      if (record === null) break;
      const enriched = await transformer.execute(record);
      enrichedBatch.push(enriched);
      console.log(`  [Service: Transformer] Normalized ${enriched.id} -> $${enriched.amountUSD.toFixed(2)} USD`);
    }
  })();

  await Promise.all([serviceProducer, serviceTester, serviceTransformer]);

  // Service D (MapReduce Analytics Worker)
  console.log(`\n  [Service: MapReduce Cluster] Distributed shuffle & aggregation...`);
  const aggregates = await mapReducer.execute(enrichedBatch);

  // Service E (Consumer / Reporting Service)
  await consumer.execute({ transactions: enrichedBatch, aggregates });

  console.log('>>> [SUCCESS] Distributed Pipeline simulation completed.\n');
  return reportDb.getLatestReport();
}

if (process.argv[1]?.endsWith('distributed-runner.ts')) {
  runDistributedPipeline().catch(console.error);
}
