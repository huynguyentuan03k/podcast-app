<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email_verified_at' => $this->email_verified_at,
            'email' => $this->email,
            'devices_count' => $this->whenCounted('devices'),
            'social_accounts_count' => $this->whenCounted('socialAccounts'),
            'profile' => $this->whenLoaded('profile', fn () => [
                'id' => $this->profile?->id,
                'display_name' => $this->profile?->display_name,
                'phone_number' => $this->profile?->phone_number,
                'avatar' => $this->profile?->avatar,
                'date_of_birth' => $this->profile?->date_of_birth?->toDateString(),
                'gender' => $this->profile?->gender,
                'bio' => $this->profile?->bio,
                'locale' => $this->profile?->locale,
                'timezone' => $this->profile?->timezone,
                'metadata' => $this->profile?->metadata,
                'created_at' => $this->profile?->created_at?->toDateTimeString(),
                'updated_at' => $this->profile?->updated_at?->toDateTimeString(),
            ]),
            'preference' => $this->whenLoaded('preference', fn () => [
                'id' => $this->preference?->id,
                'language' => $this->preference?->language,
                'theme' => $this->preference?->theme,
                'notification_enabled' => $this->preference?->notification_enabled,
                'email_notification_enabled' => $this->preference?->email_notification_enabled,
                'push_notification_enabled' => $this->preference?->push_notification_enabled,
                'autoplay_enabled' => $this->preference?->autoplay_enabled,
                'playback_speed' => $this->preference?->playback_speed,
                'metadata' => $this->preference?->metadata,
                'created_at' => $this->preference?->created_at?->toDateTimeString(),
                'updated_at' => $this->preference?->updated_at?->toDateTimeString(),
            ]),
            'devices' => $this->whenLoaded('devices', fn () => $this->devices->map(fn ($device) => [
                'id' => $device->id,
                'device_uuid' => $device->device_uuid,
                'platform' => $device->platform,
                'device_name' => $device->device_name,
                'push_token' => $device->push_token,
                'app_version' => $device->app_version,
                'os_version' => $device->os_version,
                'last_seen_at' => $device->last_seen_at?->toDateTimeString(),
                'revoked_at' => $device->revoked_at?->toDateTimeString(),
                'metadata' => $device->metadata,
                'created_at' => $device->created_at?->toDateTimeString(),
                'updated_at' => $device->updated_at?->toDateTimeString(),
            ])->values()),
            'social_accounts' => $this->whenLoaded('socialAccounts', fn () => $this->socialAccounts->map(fn ($account) => [
                'id' => $account->id,
                'provider' => $account->provider,
                'provider_user_id' => $account->provider_user_id,
                'email' => $account->email,
                'nickname' => $account->nickname,
                'avatar' => $account->avatar,
                'token_expires_at' => $account->token_expires_at?->toDateTimeString(),
                'metadata' => $account->metadata,
                'created_at' => $account->created_at?->toDateTimeString(),
                'updated_at' => $account->updated_at?->toDateTimeString(),
            ])->values()),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
