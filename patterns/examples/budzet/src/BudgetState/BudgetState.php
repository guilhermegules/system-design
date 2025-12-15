<?php

namespace Budzet\BudgetState;

use Budzet\Budget;
use DomainException;

abstract class BudgetState 
{
  /**
   * @throws DomainException
   */
  abstract public function calculateExtraDiscount(Budget $budget): float;

  public function approve(Budget $budget) 
  {
    throw new DomainException("This budget cannot be approved");
  }

  public function reprove(Budget $budget) 
  {
    throw new DomainException("This budget cannot be reproved");
  }

  public function complete(Budget $budget) 
  {
    throw new DomainException("This budget cannot be completed");
  }
}