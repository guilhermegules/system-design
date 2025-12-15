<?php

use Budzet\Budget;
use Budzet\DiscountCalculation;
use Budzet\Tax\Icms;
use Budzet\Tax\Iss;
use Budzet\TaxCalculation;

require "vendor/autoload.php";

$taxCalculation = new TaxCalculation();
$discountCalcuation = new DiscountCalculation();

$budget = new Budget();
$budget->value = 600;
$budget->quantityItems = 10;

// echo $taxCalculation->calculate($budget, new Iss());

echo $discountCalcuation->calculate($budget);