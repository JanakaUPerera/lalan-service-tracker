<?php

namespace App\Http\Controllers\Api;

use App\Actions\ChangeRequestStatus;
use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateRequestStatusRequest;
use App\Http\Resources\ServiceRequestResource;
use App\Models\ServiceRequest;

class RequestStatusController extends Controller
{
    public function update(
        UpdateRequestStatusRequest $request,
        ServiceRequest $serviceRequest,
        ChangeRequestStatus $changeStatus,
    ): ServiceRequestResource {
        $updated = $changeStatus->execute(
            $serviceRequest,
            $request->user(),
            RequestStatus::from($request->validated('status')),
            (int) $request->validated('expected_version'),
            $request->validated('remark'),
        );

        return new ServiceRequestResource($updated);
    }
}
