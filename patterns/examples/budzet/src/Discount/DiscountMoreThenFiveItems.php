<?php

namespace Budzet\Discount;

use Budzet\Budget;

class DiscountMoreThenFiveItems extends Discount
{
  public function calculate(Budget $budget): float 
  {
    if ($budget->quantityItems > 5) {
      return $budget->value * 0.1;
    }

    return $this->nextDiscount->calculate($budget);
  }
}
