<?php

namespace Tests\Feature;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ServiceRequestTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(?User $user = null): User
    {
        $user ??= User::factory()->create();
        $this->actingAs($user, 'web');

        return $user;
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Printer not working',
            'description' => 'Office printer stopped responding.',
            'priority' => 'HIGH',
        ], $overrides);
    }

    public function test_user_can_create_a_request_and_server_controls_protected_fields(): void
    {
        $user = $this->signIn();
        $other = User::factory()->create();

        // The client tries to smuggle in protected fields.
        $response = $this->postJson('/api/requests', $this->validPayload([
            'created_by' => $other->id,
            'status' => 'RESOLVED',
            'version' => 99,
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Printer not working')
            ->assertJsonPath('data.status', 'OPEN')
            ->assertJsonPath('data.version', 1);

        $this->assertDatabaseHas('service_requests', [
            'id' => $response->json('data.id'),
            'created_by' => $user->id,
            'status' => 'OPEN',
            'version' => 1,
        ]);
    }

    #[DataProvider('invalidPayloads')]
    public function test_create_rejects_invalid_input(array $overrides, string $field): void
    {
        $this->signIn();

        $this->postJson('/api/requests', $this->validPayload($overrides))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($field);

        $this->assertDatabaseCount('service_requests', 0);
    }

    public static function invalidPayloads(): array
    {
        return [
            'title too short' => [['title' => 'ab'], 'title'],
            'title too long' => [['title' => str_repeat('a', 101)], 'title'],
            'title missing' => [['title' => ''], 'title'],
            'description too short' => [['description' => 'too short'], 'description'],
            'description too long' => [['description' => str_repeat('a', 501)], 'description'],
            'priority not allowed' => [['priority' => 'URGENT'], 'priority'],
        ];
    }

    public function test_index_returns_only_own_requests_newest_first(): void
    {
        $user = $this->signIn();
        $other = User::factory()->create();

        $older = ServiceRequest::factory()->create(['created_by' => $user->id, 'created_at' => now()->subDay()]);
        $newer = ServiceRequest::factory()->create(['created_by' => $user->id, 'created_at' => now()]);
        ServiceRequest::factory()->create(['created_by' => $other->id]);

        $this->getJson('/api/requests')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id);
    }

    public function test_index_paginates_with_default_10_and_max_25(): void
    {
        $user = $this->signIn();
        ServiceRequest::factory()->count(12)->create(['created_by' => $user->id]);

        $this->getJson('/api/requests')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('meta.per_page', 10);

        $this->getJson('/api/requests?page=2')->assertOk()->assertJsonCount(2, 'data');

        $this->getJson('/api/requests?per_page=26')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('per_page');
    }

    public function test_index_combines_search_status_and_priority_filters(): void
    {
        $user = $this->signIn();
        $make = fn (string $title, string $status, string $priority) => ServiceRequest::factory()->create([
            'created_by' => $user->id, 'title' => $title, 'status' => $status, 'priority' => $priority,
        ]);

        $make('Printer broken', 'OPEN', 'HIGH');
        $make('Printer jam', 'IN_PROGRESS', 'HIGH');
        $make('VPN access', 'OPEN', 'LOW');

        $this->getJson('/api/requests?search=printer')->assertJsonCount(2, 'data');
        $this->getJson('/api/requests?status=OPEN&priority=HIGH')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Printer broken');
        $this->getJson('/api/requests?search=printer&status=IN_PROGRESS')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Printer jam');
        $this->getJson('/api/requests?status=BOGUS')->assertUnprocessable();
    }

    public function test_user_cannot_access_another_users_request_detail_history_or_status(): void
    {
        $owner = User::factory()->create();
        $record = ServiceRequest::factory()->create(['created_by' => $owner->id]);

        $this->signIn(); // a different user

        $this->getJson("/api/requests/{$record->id}")->assertNotFound();
        $this->getJson("/api/requests/{$record->id}/history")->assertNotFound();
        $this->patchJson("/api/requests/{$record->id}/status", [
            'status' => 'IN_PROGRESS',
            'expected_version' => 1,
        ])->assertNotFound();

        // Nothing changed.
        $fresh = $record->fresh();
        $this->assertSame('OPEN', $fresh->status->value);
        $this->assertSame(1, $fresh->version);
        $this->assertDatabaseCount('request_status_histories', 0);

        // Unknown IDs look identical to someone else's record.
        $this->getJson('/api/requests/999999')->assertNotFound();
    }
}