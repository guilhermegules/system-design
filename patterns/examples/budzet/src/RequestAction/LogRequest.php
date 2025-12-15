<?php

namespace Budzet\RequestAction;

use Budzet\Request;

class LogRequest implements RequestObserverAction
{
  public function action(Request $request): void
  {
    echo "Creating logs!!!" . PHP_EOL;
  }
}