<?php

namespace Budzet;

use Budzet\Discount\DiscountMoreThanFiveHundred;
use Budzet\Discount\DiscountMoreThenFiveItems;
use Budzet\Discount\NoDiscount;

class DiscountCalculation
{
  public function calculate(Budget $budget): float {
    $discountChain = new DiscountMoreThenFiveItems(
      new DiscountMoreThanFiveHundred(
        new NoDiscount()
      ));

    return $discountChain->calculate($budget);
  }
}
