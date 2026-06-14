<?php

namespace Frieren\Integrate\Enums;

enum IntegrationEventType: string
{
    case CrawlerJobCompleted = 'crawler.job.completed';
    case CrawlerJobFailed = 'crawler.job.failed';
    case ImportCompleted = 'import.completed';
    case ImportRejected = 'import.rejected';
    case EpisodePublished = 'episode.published';
    case EpisodeAudioUnavailable = 'episode.audio.unavailable';
}
