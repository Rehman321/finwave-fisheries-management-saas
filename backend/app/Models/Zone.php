<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    use HasFactory;

    protected $fillable = ['name','code','description'];

    public function cities()
    {
        return $this->hasMany(City::class);
    }

    public function customers()
    {
        return $this->belongsToMany(Customer::class, 'customer_zone');
    }
}
