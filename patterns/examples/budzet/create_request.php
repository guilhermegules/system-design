<?php

require_once "vendor/autoload.php";

use Budzet\Command\RequestGenerateCommand;
use Budzet\Command\RequestGenerateHandler;
use Budzet\RequestAction\CreateRequest;
use Budzet\RequestAction\LogRequest;
use Budzet\RequestAction\SendRequestByEmail;

$budgetValue = $argv[1];
$itemsQuantity = $argv[2];
$clientName = $argv[3];

$generateRequestHandler = new RequestGenerateHandler();
$generateRequestCommand = new RequestGenerateCommand($budgetValue, $clientName, $itemsQuantity);

$requestRepository = new CreateRequest();
$logRequest = new LogRequest();
$sendRequestByEmail = new SendRequestByEmail();

$generateRequestHandler->addAction($requestRepository);
$generateRequestHandler->addAction($logRequest);
$generateRequestHandler->addAction($sendRequestByEmail);

$generateRequestHandler->execute($generateRequestCommand);
