import { join } from 'path';

export function infrastructureFilePath(fileName: string) {
  return join(__dirname, '../../infrastructure', fileName);
}
