import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
  useWatch,
} from "react-hook-form";

import AlertMessage from
  "../../components/common/AlertMessage";

import FormField from
  "../../components/common/FormField";

import {
  useAuth,
} from "../../hooks/useAuth";

import {
  userService,
} from "../../services/userService";

import {
  getErrorMessage,
} from "../../utils/getErrorMessage";

import {
  profileSchema,
  type ProfileFormValues,
} from "../../validation/authSchemas";

function formatMemberSince(
  value?: string,
): string {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
    },
  ).format(date);
}

export default function ProfilePage() {
  const {
    user,
    setCurrentUser,
  } = useAuth();

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const {
    register,
    reset,
    control,
    handleSubmit,
    setError,
    clearErrors,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(
      profileSchema,
    ),

    defaultValues: {
      name: "",
      phone: "",
      bio: "",
    },
  });

  const watchedName =
    useWatch({
      control,
      name: "name",
      defaultValue: "",
    });

  const watchedPhone =
    useWatch({
      control,
      name: "phone",
      defaultValue: "",
    });

  const watchedBio =
    useWatch({
      control,
      name: "bio",
      defaultValue: "",
    });

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      name: user.name || "",
      phone: user.phone || "",
      bio: user.bio || "",
    });
  }, [
    reset,
    user,
  ]);

  const displayName =
    watchedName?.trim() ||
    user?.name?.trim() ||
    "SelfB User";

  const avatarText =
    displayName
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0),
      )
      .join("")
      .toUpperCase();

  const displayedRole =
    user?.role ||
    user?.roles?.[0] ||
    "USER";

  const profileFields = [
    watchedName,
    user?.email,
    watchedPhone,
    watchedBio,
  ];

  const completedFields =
    profileFields.filter(
      (value) =>
        typeof value ===
          "string" &&
        value.trim().length > 0,
    ).length;

  const profileCompletion =
    Math.round(
      (
        completedFields /
        profileFields.length
      ) * 100,
    );

  const bioLength =
    watchedBio?.length || 0;

  const handleUpdateProfile =
    async (
      values:
        ProfileFormValues,
    ) => {
      setSuccessMessage("");
      clearErrors("root");

      try {
        const updatedUser =
          await userService
            .updateCurrentUser({
              name:
                values.name.trim(),

              phone:
                values.phone
                  ?.trim() || "",

              bio:
                values.bio
                  ?.trim() || "",
            });

        setCurrentUser(
          updatedUser,
        );

        reset({
          name:
            updatedUser.name ||
            "",

          phone:
            updatedUser.phone ||
            "",

          bio:
            updatedUser.bio ||
            "",
        });

        setSuccessMessage(
          "Profile updated successfully.",
        );
      } catch (error) {
        setError("root", {
          message:
            getErrorMessage(
              error,
              "Profile update failed. Please try again.",
            ),
        });
      }
    };

  return (
    <section className="profile-page">
      <header className="page-header">
        <span className="eyebrow">
          Account settings
        </span>

        <h2>
          Your profile
        </h2>

        <p>
          Manage your personal information
          and keep your account details up
          to date.
        </p>
      </header>

      <div className="profile-layout">
        <aside className="content-card profile-summary-card">
          <div className="profile-avatar">
            {avatarText}
          </div>

          <h3>
            {displayName}
          </h3>

          <p className="profile-email">
            {user?.email ||
              "Email not available"}
          </p>

          <div className="profile-completion">
            <div className="profile-completion-header">
              <span>
                Profile completion
              </span>

              <strong>
                {profileCompletion}%
              </strong>
            </div>

            <div className="profile-progress-track">
              <div
                className="profile-progress-value"
                style={{
                  width:
                    `${profileCompletion}%`,
                }}
              />
            </div>
          </div>

          <dl className="profile-details">
            <div>
              <dt>
                Account status
              </dt>

              <dd>
                Active
              </dd>
            </div>

            <div>
              <dt>
                Account role
              </dt>

              <dd>
                {displayedRole}
              </dd>
            </div>

            <div>
              <dt>
                Member since
              </dt>

              <dd>
                {formatMemberSince(
                  user?.createdAt,
                )}
              </dd>
            </div>
          </dl>
        </aside>

        <article className="content-card profile-form-card">
          <div className="profile-form-header">
            <h3>
              Personal information
            </h3>

            <p>
              Changes will be saved directly
              to your SelfB account.
            </p>
          </div>

          <AlertMessage
            type="error"
            message={
              errors.root?.message
            }
          />

          <AlertMessage
            type="success"
            message={
              successMessage
            }
          />

          <form
            className="form profile-form"
            onSubmit={
              handleSubmit(
                handleUpdateProfile,
              )
            }
            noValidate
          >
            <FormField
              id="profileName"
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              error={
                errors.name
                  ?.message
              }
              {...register("name")}
            />

            <FormField
              id="profileEmail"
              label="Email address"
              type="email"
              value={
                user?.email ||
                ""
              }
              disabled
              readOnly
            />

            <FormField
              id="profilePhone"
              label="Phone number"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              error={
                errors.phone
                  ?.message
              }
              {...register("phone")}
            />

            <div className="form-field">
              <label htmlFor="profileBio">
                Bio
              </label>

              <textarea
                id="profileBio"
                rows={6}
                placeholder="Write something about yourself"
                aria-invalid={
                  Boolean(
                    errors.bio,
                  )
                }
                {...register("bio")}
              />

              <div className="profile-bio-footer">
                <span>
                  {errors.bio
                    ?.message || ""}
                </span>

                <small>
                  {bioLength}/500
                </small>
              </div>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={
                isSubmitting ||
                !isDirty
              }
            >
              {isSubmitting
                ? "Saving changes..."
                : isDirty
                  ? "Save changes"
                  : "No changes to save"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}