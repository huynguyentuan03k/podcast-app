<?php

namespace Frieren\Integrate\Console\Commands;

use Frieren\Integrate\RabbitMQ\RabbitMqConnectionFactory;
use Illuminate\Console\Command;

final class SetupRabbitMqCommand extends Command
{
    protected $signature = 'integrate:rabbitmq:setup';
    protected $description = 'Declare the main exchange, integration queue and bindings.';

    public function handle(RabbitMqConnectionFactory $factory): int
    {
        $connection = $factory->make();
        $channel = $connection->channel();

        try {
            $exchange = config('integrate.rabbitmq.exchange');
            $queue = config('integrate.consumer.queue');
            $channel->exchange_declare($exchange, 'topic', false, true, false);
            $channel->queue_declare($queue, false, true, false, false);

            foreach (config('integrate.consumer.bindings', []) as $routingKey) {
                $channel->queue_bind($queue, $exchange, $routingKey);
                $this->line("Bound {$queue} <- {$routingKey}");
            }
        } finally {
            $channel->close();
            $connection->close();
        }

        $this->info('RabbitMQ topology is ready.');
        return self::SUCCESS;
    }
}
