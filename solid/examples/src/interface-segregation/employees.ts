export interface Payable {
  getSalary(): number;
}

export interface TimeTrackable {
  clockIn(): void;
  clockOut(): void;
}

export interface TimesheetSubmittable {
  submitTimesheet(): void;
}

export class FullTimeEmployee implements Payable, TimeTrackable {
  getSalary(): number {
    return 5000;
  }

  clockIn(): void {
    console.log("Full-time employee clocked in");
  }

  clockOut(): void {
    console.log("Full-time employee clocked out");
  }
}

export class Contractor implements Payable, TimesheetSubmittable {
  getSalary(): number {
    return 4000;
  }

  submitTimesheet(): void {
    console.log("Contractor timesheet submitted");
  }
}

export function processPayroll(employee: Payable): void {
  console.log(`Paying ${employee.getSalary()}`);
}

export function trackWork(employee: TimeTrackable): void {
  employee.clockIn();
  employee.clockOut();
}

export function collectTimesheet(employee: TimesheetSubmittable): void {
  employee.submitTimesheet();
}
