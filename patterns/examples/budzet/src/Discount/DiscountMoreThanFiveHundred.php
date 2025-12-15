<?php

namespace Budzet\Discount;

use Budzet\Budget;

class DiscountMoreThanFiveHundred extends Discount
{
  public function calculate(Budget $budget): float 
  {
    if ($budget->value > 500) {
      return $budget->value * 0.05;
    }

    return $this->nextDiscount->calculate($budget);
  }
}
