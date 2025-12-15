<?php

namespace Budzet\Discount;

use Budzet\Budget;

abstract class Discount
{
  public function __construct(protected ?Discount $nextDiscount)
  {
    $this->nextDiscount = $nextDiscount;
  }

  abstract public function calculate(Budget $budget): float;
}