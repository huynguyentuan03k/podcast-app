<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// full api sanctum
class AuthController extends Controller
{
    public function login(Request $request){

    $data = $request->validate([
        'email' => ['required','email'],
        'password' => ['required'],
    ]);

    $user = User::where('email','=',$data['email'])->first();

    if(!$user || ! Hash::check($data['password'],$user->password)){
            return response()->json([
                "message" => "login failed",
            ],401);
    }

    $token = $user->createToken('token-podcast')->plainTextToken;

    return response()->json([
            "message" => "login sucessfully",
            "token" => $token,
        ]);
    }

    public function register(RegisterUserRequest $request){
        $data = $request->validated();

        $user = DB::transaction(function() use ($data){
            $data['password'] = Hash::make($data['password']);

            return User::create($data);
        });

        $token = $user->createToken('token-podcast')->plainTextToken;

        return response()->json([
            'message' => 'register Successfully',
            'token' => $token,
            'user' => $user,
        ],201);

    }

}
