<?php

namespace Budzet\RequestAction;

use Budzet\Request;

interface RequestObserverAction 
{
  public function action(Request $request): void;
}