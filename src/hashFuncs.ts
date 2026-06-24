import { createHash } from "node:crypto";
import { PathLike } from "node:fs";
import { createReadStream } from "node:fs";

// returned hash if file exists, null otherwise.
// this doesn't check getHashes or the encoding cause that's already checked in index.ts
export async function hashFromFile(filePath:PathLike, algorithm:string = 'sha256', encoding:BufferEncoding|undefined = 'base64') {
  const hash = createHash(algorithm)
  let fileStream;

  fileStream = createReadStream(filePath)
  
  try {
    for await (const chunk of fileStream) {
      hash.update(chunk)
    }
  } catch(error) {
    const err = error as NodeJS.ErrnoException
    if (err.code == 'ENOENT') {
      console.error('Error: File', filePath, 'does not exist.')
      return null;
    } else {
      throw err
    }
  }

  return hash.digest(encoding)
}