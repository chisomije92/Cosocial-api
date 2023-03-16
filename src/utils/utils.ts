import { join } from 'path';
import { unlink } from 'fs';



export const clearImage = (imagePath: string, dirname: string) => {
  imagePath = join(dirname, imagePath);
  if (imagePath.includes("transparent-avatar.png")) {
    return
  }
  unlink(imagePath, (err) => {
    if (err)
      throw err
  });
};