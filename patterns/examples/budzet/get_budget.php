<?php

use Budzet\Budget;
use Budzet\BudgetList;

require_once 'vendor/autoload.php';

$budget1 = new Budget();
$budget1->quantityItems = 3;
$budget1->approve();
$budget1->value = 1500.75;

$budget2 = new Budget();
$budget2->quantityItems = 1;
$budget2->reprove();
$budget2->value = 1500;

$budget3 = new Budget();
$budget3->quantityItems = 5;
$budget3->approve();
$budget3->complete();
$budget3->value = 1375;

$budgets = new BudgetList();
$budgets->addBudget($budget1);
$budgets->addBudget($budget2);
$budgets->addBudget($budget3);


foreach($budgets->getCompletedBudgets() as $budget) {
  echo "Value #{$budget->value}" . PHP_EOL;
  echo "State: " . get_class($budget->currentState) . PHP_EOL;
  echo "Quantity: #{$budget->quantityItems}" . PHP_EOL;
  echo PHP_EOL;
}