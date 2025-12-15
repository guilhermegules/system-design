<?php

namespace Budzet\Tax;

use Budzet\Budget;

abstract class TaxWithTwoRates implements Tax 
{
  public function taxCalculation(Budget $budget): float 
  {
    if($this->shouldApplyMaxRate($budget)) {
      return $this->calculateMaxRate($budget);
    }

    return $this->calculateMinRate($budget);
  }

  protected abstract function shouldApplyMaxRate(Budget $budget): bool;
  protected abstract function calculateMaxRate(Budget $budget): float;
  protected abstract function calculateMinRate(Budget $budget) : float;
}