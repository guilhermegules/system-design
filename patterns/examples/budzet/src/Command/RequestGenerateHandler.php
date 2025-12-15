<?php

namespace Budzet\Command;

use Budzet\Budget;
use Budzet\Request;
use Budzet\RequestAction\CreateRequest;
use Budzet\RequestAction\LogRequest;
use Budzet\RequestAction\RequestObserverAction;
use Budzet\RequestAction\SendRequestByEmail;
use DateTimeImmutable;

class RequestGenerateHandler
{
  private array $generateRequestActions = [];

  public function __construct(/**Repository. Service */)
  {
  }

  public function addAction(RequestObserverAction $requestObserverAction)
  {
    $this->generateRequestActions[] = $requestObserverAction;
  }

  public function execute(RequestGenerateCommand $requestGenerate) 
  {
    $budget = new Budget();
    $budget->quantityItems = $requestGenerate->getItemsQuantity();
    $budget->value = $requestGenerate->getBudgetValue();

    $request = new Request();
    $request->endDate = new DateTimeImmutable();
    $request->clientName = $requestGenerate->getClientName();
    $request->budget = $budget;

    foreach($this->generateRequestActions as $requestObserverAction) {
      $requestObserverAction->action($request);
    }
  }
}