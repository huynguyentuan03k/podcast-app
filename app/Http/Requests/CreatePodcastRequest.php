<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePodcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', 'unique:podcasts,title'],
            'content' => ['nullable','string'],
            'slug' => ['required', 'string', 'max:255', 'unique:podcasts,slug'],
            'description' => ['nullable', 'string'],
            'publisher_id' => ['nullable', 'integer'],
            'cover_image' => ['nullable','image','max:2048'],
            // cu phap exsist:table,column , Trường dữ liệu cần kiểm tra phải tồn tại trong bảng cơ sở dữ liệu đã cho cu the la column id.
            'author_ids' => ['array'],
            'author_ids.*' => ['integer','exists:authors,id'],
            'category_ids' => ['array'],
            'category_ids.*' => ['integer','exists:categories,id'],
            //'category_ids' => 'required|array|min:1'
            // Ý nghĩa: "Tôi bắt buộc phải có trường category_ids, và nó phải là một mảng, trong mảng đó phải có ít nhất 1 phần tử."

            // 'category_ids.*' (Validate từng phần tử bên trong)
            // Ví dụ: 'category_ids.*' => 'integer|exists:categories,id'
            // Ý nghĩa: "Đối với mọi phần tử nằm trong mảng category_ids, phần tử đó phải là số nguyên và phải tồn tại trong bảng categories, cột id."

        ];
    }
}
