<?php

namespace Budzet\Command;

class RequestGenerateCommand 
{
  public function __construct(
    private float $budgetValue, 
    private string $clientName, 
    private int $itemsQuantity
  ) {}

  public function getBudgetValue() 
  {
    return $this->budgetValue;  
  }

  public function getClientName()
  {
    return $this->clientName;
  }

  public function getItemsQuantity()
  {
    return $this->itemsQuantity;
  }
}