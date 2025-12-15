<?php

namespace Budzet\Tax;

use Budzet\Budget;

class Ikcv extends TaxWithTwoRates 
{
  public function shouldApplyMaxRate(Budget $budget): bool {
    return $budget->value > 300 && $budget->quantityItems > 3;
  }

  public function calculateMaxRate(Budget $budget): float {
    return $budget->value * 0.04;
  }

  public function calculateMinRate(Budget $budget) : float {
    return $budget->value * 0.025;
  }
}
