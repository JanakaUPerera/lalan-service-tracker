<?php

namespace App\Exceptions;

use App\Enums\RequestStatus;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class InvalidStatusTransitionException extends RuntimeException
{
    public function __construct(
        public readonly RequestStatus $from,
        public readonly RequestStatus $to,
    ) {
        parent::__construct("Cannot change status from {$from->value} to {$to->value}.");
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'code' => 'INVALID_TRANSITION',
        ], 409);
    }
}
