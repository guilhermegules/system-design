<?php

namespace Budzet;

use Budzet\BudgetState\BudgetState;
use Budzet\BudgetState\InApproval;

class Budget 
{
  public float $value;
  public int $quantityItems;
  public BudgetState $currentState;

  public function __construct()
  {
    $this->currentState = new InApproval();
  }

  public function applyExtraDiscount()
  {
    $this->value = $this->currentState->calculateExtraDiscount($this);
  }

  public function approve()
  {
    $this->currentState->approve($this);
  }

  public function reprove()
  {
    $this->currentState->reprove($this);
  }

  public function complete() 
  {
    $this->currentState->complete($this);
  }
}
