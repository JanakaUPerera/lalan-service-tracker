<?php

namespace App\Enums;

enum RequestStatus: string
{
    case Open = 'OPEN';
    case InProgress = 'IN_PROGRESS';
    case Resolved = 'RESOLVED';

    public function getNext(): ?self
    {
        return match ($this) {
            self::Open => self::InProgress,
            self::InProgress => self::Resolved,
            self::Resolved => null
        };
    }

    public function canTransition(self $target): bool
    {
        return $this->getNext() === $target;
    }
}
