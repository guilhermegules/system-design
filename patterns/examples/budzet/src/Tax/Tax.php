<?php

namespace Budzet\Tax;

use Budzet\Budget;

interface Tax 
{
  public function taxCalculation(Budget $budget): float;  
}