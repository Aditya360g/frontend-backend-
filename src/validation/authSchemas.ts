import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(
    1,
    "Email is required.",
  )
  .email(
    "Enter a valid email address.",
  );

const strongPasswordSchema = z
  .string()
  .min(
    8,
    "Password must contain at least 8 characters.",
  )
  .max(
    100,
    "Password cannot exceed 100 characters.",
  )
  .regex(
    /[A-Z]/,
    "Password must contain an uppercase letter.",
  )
  .regex(
    /[a-z]/,
    "Password must contain a lowercase letter.",
  )
  .regex(
    /[0-9]/,
    "Password must contain a number.",
  );

export const loginSchema =
  z.object({
    email: emailSchema,

    password: z
      .string()
      .min(
        1,
        "Password is required.",
      ),
  });

export const registerSchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(
          2,
          "Name must contain at least 2 characters.",
        )
        .max(
          80,
          "Name cannot exceed 80 characters.",
        ),

      email: emailSchema,

      password:
        strongPasswordSchema,

      confirmPassword: z
        .string()
        .min(
          1,
          "Confirm your password.",
        ),
    })
    .refine(
      (values) =>
        values.password ===
        values.confirmPassword,
      {
        message:
          "Passwords do not match.",

        path: [
          "confirmPassword",
        ],
      },
    );

export const resetPasswordSchema =
  z
    .object({
      password:
        strongPasswordSchema,

      confirmPassword: z
        .string()
        .min(
          1,
          "Confirm your password.",
        ),
    })
    .refine(
      (values) =>
        values.password ===
        values.confirmPassword,
      {
        message:
          "Passwords do not match.",

        path: [
          "confirmPassword",
        ],
      },
    );

export const changePasswordSchema =
  z
    .object({
      currentPassword: z
        .string()
        .min(
          1,
          "Current password is required.",
        ),

      newPassword:
        strongPasswordSchema,

      confirmNewPassword: z
        .string()
        .min(
          1,
          "Confirm your new password.",
        ),
    })
    .refine(
      (values) =>
        values.newPassword ===
        values.confirmNewPassword,
      {
        message:
          "New passwords do not match.",

        path: [
          "confirmNewPassword",
        ],
      },
    )
    .refine(
      (values) =>
        values.currentPassword !==
        values.newPassword,
      {
        message:
          "New password must be different from the current password.",

        path: [
          "newPassword",
        ],
      },
    );

export const profileSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must contain at least 2 characters.",
      )
      .max(
        80,
        "Name cannot exceed 80 characters.",
      ),

    phone: z
      .string()
      .trim()
      .max(
        20,
        "Phone number is too long.",
      )
      .optional(),

    bio: z
      .string()
      .trim()
      .max(
        500,
        "Bio cannot exceed 500 characters.",
      )
      .optional(),
  });

export type LoginFormValues =
  z.infer<
    typeof loginSchema
  >;

export const forgotPasswordSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(
        1,
        "Email is required.",
      )
      .email(
        "Enter a valid email address.",
      ),
  });

export type RegisterFormValues =
  z.infer<
    typeof registerSchema
  >;

export type ResetPasswordFormValues =
  z.infer<
    typeof resetPasswordSchema
  >;

export type ProfileFormValues =
  z.infer<
    typeof profileSchema
  >;

export type ForgotPasswordFormValues =
  z.infer<
    typeof forgotPasswordSchema
  >;

export type ChangePasswordFormValues =
  z.infer<
    typeof changePasswordSchema
  >;