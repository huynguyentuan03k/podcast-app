<?php

namespace Frieren\Integrate\Contracts;

use Frieren\Integrate\DTO\IntegrationEvent;

interface EventPublisher
{
    public function publish(IntegrationEvent $event): void;
}
