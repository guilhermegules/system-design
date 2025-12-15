import { Transport } from "../interfaces/Transport.interface";

/**
 * The Logistics class declares the factory method that is supposed to return 
 * an object of a Transport class the Logistics subclasses usually provide the 
 * implementation of this method.
 */
export abstract class Logistics {
  /**
   * Note that the Logistics may also provide some default implementation of the
   * factory method.
   */
  public abstract planDelivery(): Transport;

  /**
   * Also note that, despite its name, the Creator's primary responsibility is
   * not creating products. Usually, it contains some core business logic that
   * relies on Product objects, returned by the factory method. Subclasses can
   * indirectly change that business logic by overriding the factory method
   * and returning a different type of product from it.
   */
  public createTransport(): string {
    const transport = this.planDelivery();

    return `Creator: The same creator's code has just worked with ${transport.deliver()}`;
  }
}