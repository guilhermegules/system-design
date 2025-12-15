/**
 * The Transport interface declares the operations that all concrete products must
 * implement.
 */
export interface Transport {
  deliver(): string;
}