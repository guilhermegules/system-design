<?php

namespace Budzet\BudgetState;

use Budzet\Budget;

class Approved extends BudgetState
{
  public function calculateExtraDiscount(Budget $budget): float
  {
    return $budget->value * 0.02;
  }

  public function complete(Budget $budget) {
    $budget->currentState = new Completed();
  }
}