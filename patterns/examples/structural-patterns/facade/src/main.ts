class Facade {
  constructor(private subsystem1: Subsystem1, private subsystem2: Subsystem2) {
    this.subsystem1 = subsystem1 ?? new Subsystem1();
    this.subsystem2 = subsystem2 ?? new Subsystem2();
  }

  public operation(): string {
    let result = "Facade initializes subsystems:\n";
    result += this.subsystem1.operation1();
    result += this.subsystem2.operation2();
    result += "Facade orders subsystems to perform the action:\n";
    result += this.subsystem1.operationX();
    result += this.subsystem2.operationY();

    return result;
  }
}

class Subsystem1 {
  public operation1() {
    return "Subsystem1: READY!";
  }

  public operationX() {
    return "Subsystem1: GO!\n";
  }
}

class Subsystem2 {
  public operation2() {
    return "Subsystem2: Get ready!\n";
  }

  public operationY() {
    return "Subsystem2: FIRE!\n";
  }
}

function clientCode(facade: Facade) {
  console.log(facade.operation());
}

const subsystem1 = new Subsystem1();
const subsystem2 = new Subsystem2();
const facade = new Facade(subsystem1, subsystem2);

clientCode(facade);
