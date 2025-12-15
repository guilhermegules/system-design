<?php

namespace Budzet;

use DateTimeInterface;

class Request
{
  public string $clientName;
  public DateTimeInterface $endDate;
  public Budget $budget;
}