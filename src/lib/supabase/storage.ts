import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const AVATAR_BUCKET = "avatars";

let avatarBucketReady: Promise<void> | null = null;

async function ensureAvatarBucket() {
  if (!avatarBucketReady) {
    avatarBucketReady = (async () => {
      const supabase = createAdminClient();

      const { data: existing } = await supabase.storage.getBucket(AVATAR_BUCKET);

      if (existing) {
        return;
      }

      const { error } = await supabase.storage.createBucket(AVATAR_BUCKET, {
        public: true,
        fileSizeLimit: "3MB",
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
      });

      if (error && !error.message.toLowerCase().includes("already exists")) {
        throw error;
      }
    })();
  }

  return avatarBucketReady;
}

export async function uploadUserAvatar(
  userId: string,
  file: File,
): Promise<string> {
  await ensureAvatarBucket();

  const supabase = createAdminClient();

  const path = `${userId}/avatar`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  return `${publicUrl}?v=${Date.now()}`;
}

export async function deleteUserAvatar(userId: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase.storage.from(AVATAR_BUCKET).remove([`${userId}/avatar`]);
}
