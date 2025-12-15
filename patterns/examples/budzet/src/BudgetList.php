<?php

namespace Budzet;

use ArrayIterator;
use IteratorAggregate;
use Traversable;
use Budzet\Budget;
use Budzet\BudgetState\Completed;

class BudgetList implements IteratorAggregate
{
  private array $budgets;

  public function __construct()
  {
    $this->budgets = [];
  }

  public function addBudget(Budget $budget)
  {
    $this->budgets[] = $budget;
  }

  public function getIterator(): Traversable
  {
    return new ArrayIterator($this->budgets);
  }

  public function getCompletedBudgets(): array {
    return array_filter(
      $this->budgets, 
      fn(Budget $budget) => $budget->currentState instanceof Completed
    );
  }
}