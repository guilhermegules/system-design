const mockSdk = {
  start: jest.fn(),
  shutdown: jest.fn(),
};
let mockIgnoreHook: (request: { url?: string }) => boolean = () => false;

jest.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: jest.fn(() => mockSdk),
}));
jest.mock('@opentelemetry/exporter-trace-otlp-http', () => ({
  OTLPTraceExporter: jest.fn(),
}));
jest.mock('@opentelemetry/auto-instrumentations-node', () => ({
  getNodeAutoInstrumentations: jest.fn(
    (options: {
      '@opentelemetry/instrumentation-http'?: {
        ignoreIncomingRequestHook: (request: { url?: string }) => boolean;
      };
    }) => {
      mockIgnoreHook =
        options['@opentelemetry/instrumentation-http']?.ignoreIncomingRequestHook ?? (() => false);
      return [];
    },
  ),
}));

import { NodeSDK } from '@opentelemetry/sdk-node';
import '../src/otel';

describe('otel', () => {
  it('starts the OpenTelemetry SDK', () => {
    expect(NodeSDK).toHaveBeenCalledTimes(1);
    expect(mockSdk.start).toHaveBeenCalledTimes(1);
  });

  it('ignores health and metrics requests from tracing', () => {
    expect(mockIgnoreHook({ url: '/health' })).toBe(true);
    expect(mockIgnoreHook({ url: '/metrics' })).toBe(true);
    expect(mockIgnoreHook({ url: '/orders' })).toBe(false);
    expect(mockIgnoreHook({})).toBe(false);
  });

  it('shuts down the SDK on SIGTERM', () => {
    process.emit('SIGTERM');
    expect(mockSdk.shutdown).toHaveBeenCalledTimes(1);
  });

  it('shuts down the SDK on SIGINT', () => {
    process.emit('SIGINT');
    expect(mockSdk.shutdown).toHaveBeenCalledTimes(2);
  });
});
