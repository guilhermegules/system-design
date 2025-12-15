<?php

namespace Budzet;

use Budzet\Tax\Tax;

class TaxCalculation 
{
  public function calculate(Budget $budget, Tax $tax): float
  {
    return $tax->taxCalculation($budget);
  }
}