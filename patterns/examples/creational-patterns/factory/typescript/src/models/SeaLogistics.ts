import { Transport } from "../interfaces/Transport.interface";
import { Logistics } from "./Logistics";

export class SeaLogisticsCreator extends Logistics {
  public planDelivery(): Transport {
    return new SeaLogistics();
  }
}

export class SeaLogistics implements Transport {
  public deliver(): string {
    return 'Sea';
  }
}