import { stat } from 'fs/promises';

export async function fileExists(filePath: string) {
  try {
    stat(filePath);
    return true;
  } catch {
    return false;
  }
}
