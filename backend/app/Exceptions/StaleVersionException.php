<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

class StaleVersionException extends RuntimeException
{
    public function __construct(public readonly int $currentVersion)
    {
        parent::__construct('This request was changed by someone else.');
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'code' => 'STALE_VERSION',
            'current_version' => $this->currentVersion,
        ], 409);
    }
}
