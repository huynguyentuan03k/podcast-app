<?php

namespace Frieren\Integrate\Contracts;

use Frieren\Integrate\DTO\IntegrationEvent;

interface EventHandler
{
    public function supports(IntegrationEvent $event): bool;

    public function handle(IntegrationEvent $event): void;
}
