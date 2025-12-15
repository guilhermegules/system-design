import { CarBuilder } from "./builders/CarBuilder";

const carBuilder = new CarBuilder();

console.log("Six seats car");
carBuilder.setEngine(["main engine", "radiator"]);

carBuilder.setSeats(6);

carBuilder.getCar().listCarInfo();

console.log("Two seats car");

carBuilder.setSeats(2);

carBuilder.getCar().listCarInfo();
