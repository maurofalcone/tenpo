import * as FileSystem from "expo-file-system/legacy";

const FAVORITE_IMAGES_DIR = `${FileSystem.documentDirectory}favorite-images/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(FAVORITE_IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(FAVORITE_IMAGES_DIR, {
      intermediates: true,
    });
  }
}

function localPathFor(id: number) {
  return `${FAVORITE_IMAGES_DIR}${id}.jpg`;
}

/** Descarga la imagen para poder ver el favorito offline. */
export async function cacheFavoriteImage(
  id: number,
  remoteUrl: string | null | undefined,
): Promise<string | null> {
  if (!remoteUrl) {
    return null;
  }

  try {
    await ensureDir();
    const path = localPathFor(id);
    const existing = await FileSystem.getInfoAsync(path);
    if (existing.exists) {
      return path;
    }
    const result = await FileSystem.downloadAsync(remoteUrl, path);
    return result.uri;
  } catch {
    return null;
  }
}

export async function deleteCachedFavoriteImage(id: number): Promise<void> {
  try {
    const path = localPathFor(id);
    const existing = await FileSystem.getInfoAsync(path);
    if (existing.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }
  } catch {
    // ignore
  }
}

export async function deleteCachedFavoriteImages(ids: number[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteCachedFavoriteImage(id)));
}
