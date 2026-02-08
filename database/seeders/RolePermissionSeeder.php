<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $permissions = [
            // Users
            'user.view',
            'user.create',
            'user.update',
            'user.delete',

            // Podcasts
            'podcast.view',
            'podcast.create',
            'podcast.update',
            'podcast.delete',
        ];

        foreach($permissions as $permission){
            Permission::firstOrCreate(['name' => $permission]);
        }

        // role
        $admin = Role::firstOrCreate(['name'=>'admin']);
        $editor = Role::firstOrCreate(['name'=>'editor']);
        $viewer = Role::firstOrCreate(['name'=>'viewer']);


        // gán permisson vào role
        $admin->givePermissionTo(Permission::all());

        $viewer->givePermissionTo([
            'podcast.view',
            'user.view',
        ]);

        $editor->givePermissionTo([
            'podcast.view',
            'podcast.create',
            'podcast.update',
            'podcast.delete',
        ]);





    }
}
