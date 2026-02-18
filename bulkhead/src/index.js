import { runBulkhead } from "./bulkhead.js";
import { runWithoutBulkhead } from "./without-bulkhead.js";

const mode = process.argv[2]

async function run() {
    if (!mode) {
        console.log(`
Usage:
npm start without-bulkhead
npm start with-bulkhead
`);
        return;
    }

    if (mode === "without-bulkhead") {
        await runWithoutBulkhead();
        return;
    }

    if (mode === "with-bulkhead") {
        await runBulkhead();
        return;
    }
}

run()