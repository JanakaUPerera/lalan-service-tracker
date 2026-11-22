<?php

namespace App\Actions;

use App\Enums\RequestStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Exceptions\StaleVersionException;
use App\Models\RequestStatusHistory;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChangeRequestStatus
{
    public function execute(
        ServiceRequest $serviceRequest,
        User $actor,
        RequestStatus $target,
        int $expectedVersion,
        ?string $remark = null,
    ): ServiceRequest {
        return DB::transaction(function () use ($serviceRequest, $actor, $target, $expectedVersion, $remark) {
            // Re-read inside the transaction: the route-bound model may already be stale.
            $current = ServiceRequest::query()
                ->lockForUpdate()
                ->findOrFail($serviceRequest->getKey());

            // 1. Stale check first: if the record moved on, its state can't be trusted.
            if ($current->version !== $expectedVersion) {
                throw new StaleVersionException($current->version);
            }

            // 2. Workflow rule lives in the enum.
            if (! $current->status->canTransition($target)) {
                throw new InvalidStatusTransitionException($current->status, $target);
            }

            // 3. Compare-and-set: only succeeds if nobody bumped the version since we read it.
            $affected = ServiceRequest::query()
                ->whereKey($current->getKey())
                ->where('version', $expectedVersion)
                ->update([
                    'status' => $target->value,
                    'version' => DB::raw('version + 1'),
                ]);

            if ($affected !== 1) {
                throw new StaleVersionException(
                    (int) ServiceRequest::query()->whereKey($current->getKey())->value('version')
                );
            }

            // 4. Audit row, in the same transaction.
            RequestStatusHistory::create([
                'service_request_id' => $current->id,
                'actioned_by' => $actor->id,
                'from_status' => $current->status->value,
                'to_status' => $target->value,
                'remark' => $remark,
            ]);

            return $current->refresh();
        });
    }
}
