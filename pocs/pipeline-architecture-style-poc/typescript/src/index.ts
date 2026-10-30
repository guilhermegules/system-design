import { runMonolithicPipeline } from './monolithic-runner.js';
import { runDistributedPipeline } from './distributed-runner.js';

async function main() {
  console.log('#################################################################');
  console.log('# PIPELINE ARCHITECTURE STYLE (PIPES & FILTERS) POC');
  console.log('#################################################################\n');

  await runMonolithicPipeline();

  await runDistributedPipeline();

  console.log('All pipeline topology demonstrations completed successfully.');
}

main().catch((err) => {
  console.error('Pipeline execution error:', err);
  process.exit(1);
});
