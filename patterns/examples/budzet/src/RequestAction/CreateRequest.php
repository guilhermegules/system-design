<?php

namespace Budzet\RequestAction;

use Budzet\Request;

class CreateRequest implements RequestObserverAction
{
  public function action(Request $request): void
  {
    echo "Saving request on DB" . PHP_EOL;
    var_dump($request);
    echo PHP_EOL;
  }
}
