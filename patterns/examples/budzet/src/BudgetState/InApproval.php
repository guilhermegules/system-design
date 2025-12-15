<?php

namespace Budzet\BudgetState;

use Budzet\Budget;

class InApproval extends BudgetState
{
  public function calculateExtraDiscount(Budget $budget): float
  {
    return $budget->value * 0.05;
  }

  public function approve(Budget $budget)
  {
    $budget->currentState = new Approved();
  }

  public function reprove(Budget $budget)
  {
    $budget->currentState = new Reproved();
  }
}