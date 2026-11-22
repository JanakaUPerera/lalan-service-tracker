<?php

namespace App\Models;

use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestStatusHistory extends Model
{
    public $timestamps = false;

    protected $fillable = ['service_request_id', 'actioned_by', 'from_status', 'to_status', 'remark'];

    protected function casts(): array
    {
        return [
            'from_status' => RequestStatus::class,
            'to_status' => RequestStatus::class,
            'created_at' => 'datetime',
        ];
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class, 'service_request_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actioned_by');
    }
}
