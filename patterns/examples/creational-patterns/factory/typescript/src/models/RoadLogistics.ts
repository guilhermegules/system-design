import { Transport } from "../interfaces/Transport.interface";
import { Logistics } from "./Logistics";

export class RoadLogisticsCreator extends Logistics {
  public planDelivery(): Transport {
    return new RoadLogistics();
  }
}

export class RoadLogistics implements Transport {
  public deliver(): string {
    return 'Road';
  }
}