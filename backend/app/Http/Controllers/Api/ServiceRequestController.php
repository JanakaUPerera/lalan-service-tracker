<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexServiceRequestsRequest;
use App\Http\Requests\StoreServiceRequestRequest;
use App\Http\Resources\ServiceRequestResource;
use App\Models\ServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ServiceRequestController extends Controller
{
    public function index(IndexServiceRequestsRequest $request): AnonymousResourceCollection
    {
        $requests = $request->user()
            ->serviceRequests()                 // scoping to the owner IS the authorization here
            ->filter($request->validated())
            ->latest()
            ->latest('id')                      // deterministic tie-break
            ->paginate($request->integer('per_page', 10));

        return ServiceRequestResource::collection($requests);
    }

    public function store(StoreServiceRequestRequest $request): JsonResponse
    {
        // validated() only holds title/description/priority; created_by comes from the session.
        $serviceRequest = $request->user()->serviceRequests()->create($request->validated());

        return (new ServiceRequestResource($serviceRequest))
            ->response()
            ->setStatusCode(201);
    }

    public function show(ServiceRequest $serviceRequest): ServiceRequestResource
    {
        Gate::authorize('view', $serviceRequest);

        return new ServiceRequestResource($serviceRequest);
    }
}
