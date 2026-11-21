<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Janaka Perera',
            'email' => 'janaka.perera@gmail.com',
            'password' => 'asd@1234',
        ]);

        User::factory()->create([
            'name' => 'Lalan Group',
            'email' => 'lalan.group@gmail.com',
            'password' => 'asd@1234',
        ]);
    }
}
