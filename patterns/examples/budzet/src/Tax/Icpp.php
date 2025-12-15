<?php

namespace Budzet\Tax;

use Budzet\Budget;

class Icpp extends TaxWithTwoRates 
{
  public function shouldApplyMaxRate(Budget $budget): bool {
    return $budget->value > 500;
  }

  public function calculateMaxRate(Budget $budget): float {
    return $budget->value * 0.03;
  }

  public function calculateMinRate(Budget $budget) : float {
    return $budget->value * 0.02;
  }
}
