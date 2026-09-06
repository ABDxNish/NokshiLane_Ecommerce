import {
  z,
} from 'zod';


export const bdPhone =
  /^(?:\+8801|01)[3-9]\d{8}$/;


export const loginSchema =
  z.object({
    email:
      z.string()
        .trim()
        .email(
          'Enter a valid email address',
        ),

    password:
      z.string()
        .min(
          1,
          'Password is required',
        ),
  });


export const registerSchema =
  z.object({
    name:
  z.string()
    .trim()
    .min(
      2,
      'Name must be at least 2 characters',
    )
    .max(
      60,
      'Name is too long',
    )
    .regex(
      /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u,
      'Name can contain letters, spaces, apostrophes, dots and hyphens only',
    ),

    email:
      z.string()
        .trim()
        .email(
          'Enter a valid email address',
        ),

    phone:
      z.string()
        .trim()
        .regex(
          bdPhone,
          'Enter a valid Bangladeshi mobile number',
        ),

    password:
      z.string()
        .min(
          8,
          'Password must be at least 8 characters',
        )
        .max(
          72,
          'Password is too long',
        )
        .regex(
          /[A-Z]/,
          'Add at least one uppercase letter',
        )
        .regex(
          /[a-z]/,
          'Add at least one lowercase letter',
        )
        .regex(
          /\d/,
          'Add at least one number',
        )
        .regex(
          /[^A-Za-z0-9]/,
          'Add at least one special character',
        ),

    confirmPassword:
      z.string(),

    acceptTerms:
      z.boolean()
        .refine(
          (value) => value,
          {
            message:
              'You must accept the terms',
          },
        ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: [
        'confirmPassword',
      ],
      message:
        'Passwords do not match',
    },
  );


export const checkoutSchema =
  z.object({
    recipientName: z
  .string()
  .trim()
  .min(
    2,
    'Recipient name must be at least 2 characters',
  )
  .max(
    60,
    'Recipient name is too long',
  )
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u,
    'Recipient name can contain letters, spaces, dots, apostrophes and hyphens only',
  ),

    phone:
      z.string()
        .trim()
        .regex(
          bdPhone,
          'Enter a valid Bangladeshi mobile number',
        ),

    address:
      z.string()
        .trim()
        .min(
          8,
          'Enter a complete delivery address',
        )
        .max(200),

    city:
      z.string()
        .trim()
        .min(
          2,
          'City is required',
        )
        .max(60),

    area:
      z.string()
        .trim()
        .min(
          2,
          'Area / Thana is required',
        )
        .max(80),

    postcode: z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' ||
      /^\d{4}$/.test(value),
    {
      message:
        'Postcode must contain exactly 4 digits',
    },
  ),

    paymentMethod:
      z.enum([
        'COD',
        'SSLCOMMERZ',
      ]),
  });


export const productSchema =
  z.object({
    name:
      z.string()
        .trim()
        .min(2)
        .max(120),

    slug:
      z.string()
        .trim()
        .min(2)
        .max(140)
        .regex(
          /^[a-z0-9-]+$/,
          'Use lowercase letters, numbers and hyphens',
        ),

    sku:
      z.string()
        .trim()
        .min(2)
        .max(50),

    brand:
      z.string()
        .trim()
        .max(60)
        .optional(),

    description:
      z.string()
        .trim()
        .min(
          10,
          'Description must be at least 10 characters',
        )
        .max(3000),

    price:
      z.number()
        .positive(
          'Price must be greater than 0',
        ),

    compareAtPrice:
      z.number()
        .positive()
        .nullable(),

    stock:
      z.number()
        .int()
        .min(
          0,
          'Stock cannot be negative',
        ),

    imageUrl:
      z.string()
        .url(
          'Enter a valid image URL',
        ),

    imagesText:
      z.string()
        .optional(),

    featured:
      z.boolean(),

    bestseller:
      z.boolean(),

    rating:
      z.number()
        .min(0)
        .max(5),

    categoryId:
      z.string()
        .uuid(
          'Select a valid category',
        ),
  })
  .refine(
    (data) =>
      data.compareAtPrice ===
        null ||
      data.compareAtPrice >
        data.price,
    {
      path: [
        'compareAtPrice',
      ],
      message:
        'Compare-at price must be greater than selling price',
    },
  );
