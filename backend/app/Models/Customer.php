<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = ['name','email','phone','city_id','address'];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function zones()
    {
        return $this->belongsToMany(Zone::class, 'customer_zone');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
