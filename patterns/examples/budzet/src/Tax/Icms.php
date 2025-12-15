<?php

namespace Budzet\Tax;

use Budzet\Budget;

class Icms implements Tax
{
  public function taxCalculation(Budget $budget): float 
  {
    return $budget->value * 0.1;
  }
}
