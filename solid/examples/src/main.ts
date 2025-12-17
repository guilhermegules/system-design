import {
  MongoOrderRepository,
  EmailNotificationService,
  OrderService,
} from "./dependency-inversion/order-processing.js";
import {
  FullTimeEmployee,
  Contractor,
  processPayroll,
  trackWork,
  collectTimesheet,
} from "./interface-segregation/employees.js";
import {
  CreditCardPayment,
  CashPayment,
  type RefundablePayment,
  type PaymentMethod,
} from "./liskov-substitution/payment-method.js";
import {
  Circle,
  Rectangle,
  ShapeCalculator,
} from "./open-close/shape-calculator.js";
import {
  UserRegistrationService,
  UserValidator,
  UserRepository,
  EmailService,
} from "./single-responsibility/user-service.js";

// Single Responsibility Principle

const registrationService = new UserRegistrationService(
  new UserValidator(),
  new UserRepository(),
  new EmailService()
);

registrationService.register("user@example.com", "securePassword");

// Open-close principle

const circle = new Circle(100);
const rectangle = new Rectangle(100, 100);

const calculator = new ShapeCalculator();

calculator.calculate(circle);
calculator.calculate(rectangle);

// Liskov Substitution Principle

const creditCard = new CreditCardPayment();
const cash = new CashPayment();

processPayment(creditCard, 100);
processPayment(cash, 50);

processRefund(creditCard, 30);

function processPayment(payment: PaymentMethod, amount: number): void {
  payment.pay(amount);
}

function processRefund(payment: RefundablePayment, amount: number): void {
  payment.refund(amount);
}

// Interface Segregation Principle

const fullTime = new FullTimeEmployee();
const contractor = new Contractor();

processPayroll(fullTime);
processPayroll(contractor);

trackWork(fullTime);
// trackWork(contractor); // ❌ Compile-time error (correct)

collectTimesheet(contractor);
// collectTimesheet(fullTime); // ❌ Compile-time error (correct)

// Dependency Inversion Principle

const repository = new MongoOrderRepository();
const notifier = new EmailNotificationService();

const orderService = new OrderService(repository, notifier);

orderService.placeOrder({ id: "ORD-1", total: 250 });
