<?php

namespace Frieren\Integrate\Enums;

enum OutboxStatus: string
{
    case Pending = 'pending';
    case Published = 'published';
    case Failed = 'failed';
}
