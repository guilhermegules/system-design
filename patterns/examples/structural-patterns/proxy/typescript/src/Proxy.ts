import { RealSubject } from "./RealSubject";
import { Subject } from "./Subject";

export class Proxy implements Subject {
  private realSubject: RealSubject;

  constructor(realSubject: RealSubject) {
    this.realSubject = realSubject;
  }

  request(): void {
    if (this.hasAccess()) {
      this.realSubject.request();
      this.logAccess();
    }
  }

  private hasAccess(): boolean {
    return true;
  }

  private logAccess(): void {
    console.log("Proxy: logging the time of request.");
  }
}
