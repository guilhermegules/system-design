<?php

namespace Budzet\BudgetState;

use Budzet\Budget;
use DomainException;

class Reproved extends BudgetState
{
  public function calculateExtraDiscount(Budget $budget): float
  {
    throw new DomainException("Reproved budget cannot receive extra discounts");
  }

  public function complete(Budget $budget)
  {
    $budget->currentState = new Completed();
  }
}