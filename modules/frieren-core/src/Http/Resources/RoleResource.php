<?php

namespace Frieren\Core\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'description' => $this->description,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'permissions' => $this->whenLoaded('permissions', fn () => $this->permissions->pluck('name')),
            'admin_users' => $this->whenLoaded('adminUsers', fn () => AdminUserResource::collection($this->adminUsers)),
        ];
    }
}
