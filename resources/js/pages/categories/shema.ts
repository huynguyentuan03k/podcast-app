import { z } from 'zod';

export type Meta = {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
};

export type Links = {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
};

export const CategoryNameSchema = z.object({
    en: z.string().nullable(),
    vi: z.string().nullable(),
});

export const CategorySchema = z.object({
    id: z.number(),
    name: CategoryNameSchema,
    description: z.string().nullable(),
    created_at: z.union([z.date(), z.string()]).nullable(),
    updated_at: z.union([z.date(), z.string()]).nullable(),
});

export const CategoriesSchema = z.array(CategorySchema);

export const CategoryFormSchema = z.object({
    name: z.object({
        en: z.string().min(1, 'English name is required.'),
        vi: z.string().min(1, 'Vietnamese name is required.'),
    }),
    description: z.string().nullable(),
});

export type Category = z.infer<typeof CategorySchema>;
export type Categories = z.infer<typeof CategoriesSchema>;
export type CategoryForm = z.infer<typeof CategoryFormSchema>;

export type CategoryResponse<T> = {
    data: T;
    meta: Meta;
    links: Links;
};

export const categoryConfig = {
    key: 'categories',
    title: 'Categories',
    singular: 'Category',
    endpoint: '/api/categories',
    basePath: '/portal/categories',
    breadcrumbs: [{ title: 'Categories', href: '/portal/categories' }],
};
