<?php

namespace Tests\Feature;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class StatusWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function makeRequest(array $attributes = []): ServiceRequest
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'web');

        return ServiceRequest::factory()->create(array_merge(['created_by' => $user->id], $attributes));
    }

    private function changeStatus(ServiceRequest $request, string $status, int $version, ?string $remark = null): TestResponse
    {
        return $this->patchJson("/api/requests/{$request->id}/status", array_filter([
            'status' => $status,
            'expected_version' => $version,
            'remark' => $remark,
        ], fn ($value) => $value !== null));
    }

    public function test_valid_transition_persists_increments_version_and_creates_one_history_row(): void
    {
        $request = $this->makeRequest();

        $this->changeStatus($request, 'IN_PROGRESS', 1, 'Technician assigned')
            ->assertOk()
            ->assertJsonPath('data.status', 'IN_PROGRESS')
            ->assertJsonPath('data.version', 2);

        $this->assertDatabaseHas('service_requests', [
            'id' => $request->id,
            'status' => 'IN_PROGRESS',
            'version' => 2,
        ]);
        $this->assertDatabaseCount('request_status_histories', 1);
        $this->assertDatabaseHas('request_status_histories', [
            'service_request_id' => $request->id,
            'actioned_by' => $request->created_by,
            'from_status' => 'OPEN',
            'to_status' => 'IN_PROGRESS',
            'remark' => 'Technician assigned',
        ]);
    }

    #[DataProvider('invalidTransitions')]
    public function test_invalid_transition_returns_409_and_changes_nothing(string $from, string $to): void
    {
        $request = $this->makeRequest(['status' => $from]);

        $this->changeStatus($request, $to, 1)
            ->assertStatus(409)
            ->assertJsonPath('code', 'INVALID_TRANSITION');

        $fresh = $request->fresh();
        $this->assertSame($from, $fresh->status->value);
        $this->assertSame(1, $fresh->version);
        $this->assertDatabaseCount('request_status_histories', 0);
    }

    public static function invalidTransitions(): array
    {
        return [
            'skip OPEN -> RESOLVED' => ['OPEN', 'RESOLVED'],
            'no-op OPEN -> OPEN' => ['OPEN', 'OPEN'],
            'reverse IN_PROGRESS -> OPEN' => ['IN_PROGRESS', 'OPEN'],
            'no-op IN_PROGRESS -> IN_PROGRESS' => ['IN_PROGRESS', 'IN_PROGRESS'],
            'reopen RESOLVED -> IN_PROGRESS' => ['RESOLVED', 'IN_PROGRESS'],
            'no-op RESOLVED -> RESOLVED' => ['RESOLVED', 'RESOLVED'],
        ];
    }

    public function test_stale_expected_version_returns_409_without_overwriting_latest_state(): void
    {
        $request = $this->makeRequest();

        // Client A and client B both loaded version 1. A wins.
        $this->changeStatus($request, 'IN_PROGRESS', 1)->assertOk();

        // Client B is stale. Even a transition that would be legal now (IN_PROGRESS -> RESOLVED)
        // must be rejected because B's version is old.
        $this->changeStatus($request, 'RESOLVED', 1)
            ->assertStatus(409)
            ->assertJsonPath('code', 'STALE_VERSION')
            ->assertJsonPath('current_version', 2);

        $fresh = $request->fresh();
        $this->assertSame('IN_PROGRESS', $fresh->status->value);
        $this->assertSame(2, $fresh->version);
        $this->assertDatabaseCount('request_status_histories', 1); // only A's change
    }

    public function test_status_request_is_validated(): void
    {
        $request = $this->makeRequest();

        $this->patchJson("/api/requests/{$request->id}/status", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status', 'expected_version']);

        $this->changeStatus($request, 'DONE', 1)->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->changeStatus($request, 'IN_PROGRESS', 1, str_repeat('a', 256))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('remark');

        $this->assertDatabaseCount('request_status_histories', 0);
    }

    public function test_history_returns_ordered_audit_trail_for_owner(): void
    {
        $request = $this->makeRequest();

        $this->changeStatus($request, 'IN_PROGRESS', 1, 'Started')->assertOk();
        $this->changeStatus($request, 'RESOLVED', 2, 'Fixed')->assertOk();

        $this->getJson("/api/requests/{$request->id}/history")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.from_status', 'OPEN')
            ->assertJsonPath('data.0.to_status', 'IN_PROGRESS')
            ->assertJsonPath('data.0.actioned_by.name', $request->owner->name)
            ->assertJsonPath('data.1.to_status', 'RESOLVED')
            ->assertJsonPath('data.1.remark', 'Fixed');
    }
}
