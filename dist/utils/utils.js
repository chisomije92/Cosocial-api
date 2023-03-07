import { join } from 'path';
import { unlink } from 'fs';
export const clearImage = (imagePath, dirname) => {
    imagePath = join(dirname, imagePath);
    unlink(imagePath, (err) => {
        if (err)
            throw err;
    });
};
//# sourceMappingURL=utils.js.map