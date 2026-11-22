<?php

namespace App\Policies;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ServiceRequestPolicy
{
    public function owns (User $user, ServiceRequest $serviceRequest): Response
    {
        return $user->id == $serviceRequest->created_by ? Response::allow() : Response::denyAsNotFound();
    }

    public function view (User $user, ServiceRequest $serviceRequest): Response
    {
        return $this->owns($user, $serviceRequest);
    }

    public function updateStatus(User $user, ServiceRequest $serviceRequest): Response
    {
        return $this->owns($user, $serviceRequest);
    }
}
