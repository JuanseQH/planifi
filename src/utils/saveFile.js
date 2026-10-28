// Saves a text file. Browsers get a normal download; the Android app can't download from a
// WebView, so it writes the file to the app cache and opens the system share sheet instead.
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const isCancel = (error) => /cancel/i.test(error?.message || '');

/**
 * @returns {Promise<boolean>} true when the file was downloaded or shared, false if the person cancelled
 */
export const saveFile = async ({ filename, content, mimeType, dialogTitle = 'Guardar o compartir' }) => {
  if (!Capacitor.isNativePlatform()) {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return true;
  }

  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: content,
    directory: Directory.Cache,
    encoding: Encoding.UTF8
  });

  try {
    await Share.share({ title: filename, files: [uri], dialogTitle });
    return true;
  } catch (error) {
    if (isCancel(error)) return false;
    throw error;
  }
};
