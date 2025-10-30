<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = ['name','zone_id','code'];

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }
}
