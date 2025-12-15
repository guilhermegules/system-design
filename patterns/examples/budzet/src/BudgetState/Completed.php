<?php

namespace Budzet\BudgetState;

use Budzet\Budget;
use DomainException;

class Completed extends BudgetState
{
  public function calculateExtraDiscount(Budget $budget): float
  {
    throw new DomainException("Completed budgets cannot have extra discounts");
  }
}