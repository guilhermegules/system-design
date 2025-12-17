interface BadEmployee {
  getSalary(): number;
  clockIn(): void;
  clockOut(): void;
  submitTimesheet(): void;
}

class FullTimeBadEmployee implements BadEmployee {
  getSalary(): number {
    return 5000;
  }

  clockIn(): void {
    console.log("Clocked in");
  }

  clockOut(): void {
    console.log("Clocked out");
  }

  submitTimesheet(): void {
    throw new Error("Full-time Bademployees don't submit timesheets");
  }
}

class BadContractor implements BadEmployee {
  getSalary(): number {
    return 4000;
  }

  clockIn(): void {
    throw new Error("Contractors don't clock in");
  }

  clockOut(): void {
    throw new Error("Contractors don't clock out");
  }

  submitTimesheet(): void {
    console.log("Timesheet submitted");
  }
}
