<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RequestStatusHistoryResource;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class RequestHistoryController extends Controller
{
    public function index(ServiceRequest $serviceRequest): AnonymousResourceCollection
    {
        Gate::authorize('view', $serviceRequest);

        return RequestStatusHistoryResource::collection(
            $serviceRequest->histories()->with('actor:id,name')->get()
        );
    }
}
