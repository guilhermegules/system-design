import { Proxy } from "./Proxy";
import { RealSubject } from "./RealSubject";
import { Subject } from "./Subject";

function clientCode(subject: Subject) {
  subject.request();
}

console.log("Client: Executing the client code with a real subject");
const realSubject = new RealSubject();
clientCode(realSubject);

console.log("Client: Executing the same client with a proxy");
const proxy = new Proxy(realSubject);
clientCode(proxy);
