<?php

namespace Budzet\RequestAction;

use Budzet\Request;

class SendRequestByEmail implements RequestObserverAction
{
  public function action(Request $request): void
  {
    echo "Client: #{$request->clientName}" . PHP_EOL;
    echo "Sending emails of requests!" . PHP_EOL;
  }
}