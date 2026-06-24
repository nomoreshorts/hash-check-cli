import { PathLike } from "node:fs";
import { stat } from "node:fs/promises";
export async function isFile(filePath:PathLike, nextAction:string = 'Please try again.') {
  try {
    const fileStat = await stat(filePath)

    if (fileStat.isFile()) {
      return true;
    } else {
      console.error(`"${filePath}"`, 'is not a file.', nextAction)
      return false;
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code == 'ENOENT') {
      console.error(`"${filePath}"`, 'not found.', nextAction)
      return false;
    } else {
      throw error
    }
  }
}