<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->roles()->where('name','admin')->exists();
    }

    public function view(User $user, Role $role): bool
    {
        return $user->roles()->where('name','admin')->exists();
    }

    public function create(User $user): bool
    {
        return $user->roles()->where('name','admin')->exists();
    }

    public function update(User $user, Role $role): bool
    {
        return $user->roles()->where('name','admin')->exists();
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->roles()->where('name','admin')->exists();
    }
}
