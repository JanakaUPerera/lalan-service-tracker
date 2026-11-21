<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login (LoginRequest $request): JsonResponse
    {
        if ( !Auth::guard('web')->attempt($request->validated())){
            return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
        }

        $request->session()->regenerate();

        return (new UserResource($request->user()))->response();
    }

    public function me (Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout (Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
