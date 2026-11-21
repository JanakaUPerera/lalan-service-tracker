<?php

namespace Database\Seeders;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->each(function (User $user): void {
            ServiceRequest::factory()
                ->count(fake()->numberBetween(2, 3))
                ->for($user, 'owner')
                ->create();
        });
    }
}
