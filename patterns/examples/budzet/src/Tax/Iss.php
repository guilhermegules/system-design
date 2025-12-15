<?php

namespace Budzet\Tax;

use Budzet\Budget;

class Iss implements Tax
{
  public function taxCalculation(Budget $budget): float 
  {
    return $budget->value * 0.06;
  }
}
