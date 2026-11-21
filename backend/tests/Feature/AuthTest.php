<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function fromFrontend(): static
    {
        return $this->withHeaders(['Origin' => 'http://localhost:3000']);
    }

    public function test_user_can_sign_in_with_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $this->fromFrontend()
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_sign_in_with_wrong_password_returns_401(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $this->fromFrontend()
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertUnauthorized()
            ->assertJsonStructure(['message']);

        $this->assertGuest('web');
    }

    public function test_login_validates_required_fields(): void
    {
       $this->fromFrontend()
            ->postJson('/api/auth/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_protected_routes_reject_unauthenticated_requests(): void
    {
       $this->getJson('api/auth/me')->assertUnauthorized();
    }

    public function test_me_returns_the_signed_in_user(): void
    {
        $user  = User::factory()->create();

        $this->actingAs($user, 'web')
            ->getJson('api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }
}
