import { Logistics } from "./models/Logistics";
import { RoadLogisticsCreator } from "./models/RoadLogistics";
import { SeaLogisticsCreator } from "./models/SeaLogistics";

function clientLogistic(logistic: Logistics) {
  console.log(logistic.createTransport());
}

console.log('App: Launched with the RoadLogistics');
clientLogistic(new RoadLogisticsCreator());

console.log('\n');

console.log('App: Launched with the SeaLogistics');
clientLogistic(new SeaLogisticsCreator());