import { Subject } from "./Subject";

export class RealSubject implements Subject {
  request(): void {
    console.log("RealSubject: Handling request");
  }
}
