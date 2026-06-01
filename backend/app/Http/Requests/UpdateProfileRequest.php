<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'  => ['sometimes', 'string', 'min:2', 'max:100'],
            'phone' => ['required', 'string', 'min:10', 'max:20', 'regex:/^[0-9]+$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Nomor HP wajib diisi.',
            'phone.min'      => 'Nomor HP minimal 10 digit.',
            'phone.regex'    => 'Nomor HP hanya boleh berisi angka.',
        ];
    }
}
