<?php

namespace Frieren\Integrate\RabbitMQ;

use PhpAmqpLib\Connection\AMQPStreamConnection;

final class RabbitMqConnectionFactory
{
    public function make(): AMQPStreamConnection
    {
        $config = config('integrate.rabbitmq');

        return new AMQPStreamConnection(
            host: $config['host'],
            port: $config['port'],
            user: $config['user'],
            password: $config['password'],
            vhost: $config['vhost'],
            insist: false,
            login_method: 'AMQPLAIN',
            login_response: null,
            locale: 'en_US',
            connection_timeout: $config['connection_timeout'],
            read_write_timeout: $config['read_write_timeout'],
            context: null,
            keepalive: true,
            heartbeat: $config['heartbeat'],
        );
    }
}
