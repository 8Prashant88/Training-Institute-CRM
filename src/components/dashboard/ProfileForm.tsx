"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";

import {
  removeProfileAvatarAction,
  updateProfileAvatarAction,
  updateProfileNameAction,
} from "@/actions/update-profile";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;

type ProfileUser = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: "ADMIN" | "COUNSELOR";
};

export default function ProfileForm({
  currentUser,
}: {
  currentUser: ProfileUser;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [fullName, setFullName] = useState(currentUser.fullName);

  const [isSavingName, startSavingName] = useTransition();
  const [isUploadingAvatar, startUploadingAvatar] = useTransition();
  const [isRemovingAvatar, startRemovingAvatar] = useTransition();

  const roleLabel = currentUser.role === "ADMIN" ? "Administrator" : "Counselor";

  const nameChanged = fullName.trim() !== currentUser.fullName;

  function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingName || !nameChanged) {
      return;
    }

    startSavingName(async () => {
      const result = await updateProfileNameAction({ fullName });

      if (!result.success) {
        toast({
          variant: "error",
          title: "Name not updated",
          description: result.message,
        });

        return;
      }

      setFullName(result.data.fullName);

      toast({
        variant: "success",
        title: "Profile updated",
        description: result.message,
      });

      router.refresh();
    });
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast({
        variant: "error",
        title: "Unsupported image",
        description: "Please upload a PNG, JPEG, or WEBP image.",
      });

      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      toast({
        variant: "error",
        title: "Image too large",
        description: "Images must be 3MB or smaller.",
      });

      return;
    }

    const formData = new FormData();
    formData.set("avatar", file);

    startUploadingAvatar(async () => {
      const result = await updateProfileAvatarAction(formData);

      if (!result.success) {
        toast({
          variant: "error",
          title: "Photo not updated",
          description: result.message,
        });

        return;
      }

      setAvatarUrl(result.data.avatarUrl);

      toast({
        variant: "success",
        title: "Profile updated",
        description: result.message,
      });

      router.refresh();
    });
  }

  function handleRemoveAvatar() {
    if (isRemovingAvatar || !avatarUrl) {
      return;
    }

    startRemovingAvatar(async () => {
      const result = await removeProfileAvatarAction();

      if (!result.success) {
        toast({
          variant: "error",
          title: "Photo not removed",
          description: result.message,
        });

        return;
      }

      setAvatarUrl(null);

      toast({
        variant: "success",
        title: "Profile updated",
        description: result.message,
      });

      router.refresh();
    });
  }

  const avatarBusy = isUploadingAvatar || isRemovingAvatar;

  return (
    <div className="grid gap-6 sm:max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={fullName} imageUrl={avatarUrl} size="lg" />

            <button
              type="button"
              aria-label="Change profile photo"
              disabled={avatarBusy}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary-900 text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Camera aria-hidden="true" className="size-3.5" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isUploadingAvatar}
                disabled={avatarBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                Change photo
              </Button>

              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  isLoading={isRemovingAvatar}
                  disabled={avatarBusy}
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Remove
                </Button>
              )}
            </div>

            <p className="text-xs leading-5 text-slate-500">
              PNG, JPEG, or WEBP. Up to 3MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5">
          <form onSubmit={handleNameSubmit} className="grid gap-4">
            <Field id="profile-full-name" label="Full name" required>
              <Input
                id="profile-full-name"
                value={fullName}
                maxLength={120}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </Field>

            <div>
              <Button
                type="submit"
                size="sm"
                isLoading={isSavingName}
                disabled={!nameChanged || isSavingName}
              >
                Save name
              </Button>
            </div>
          </form>

          <Field id="profile-email" label="Email">
            <Input id="profile-email" value={currentUser.email} disabled readOnly />
          </Field>

          <Field id="profile-role" label="Role" helpText="Managed by your administrator.">
            <Input id="profile-role" value={roleLabel} disabled readOnly />
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}
