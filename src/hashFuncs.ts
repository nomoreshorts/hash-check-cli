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

if (import.meta.main) {
  const [{ createInterface }, 
    { getHashes }, 
    readlineUtils,
    { existsSync }] = await Promise.all([
    import("node:readline/promises"),
    import("node:crypto"),
    import("./readlineUtils.js"),
    import("node:fs")
  ])

  let filePath
  if (process.argv[2]) {
    if (existsSync(process.argv[2])) {
      filePath = process.argv[2]
    } else {
      console.warn(process.argv[2], "is not a valid file. Ignoring...")
    }
  }

  const rlInterface = createInterface(process.stdin, process.stdout)
  if (filePath == undefined) {
    filePath = await readlineUtils.autoCheckQuestion(rlInterface, "Input file to get the hash of: ", {
      rejectIfInputEmpty: true,
      test: input => existsSync(input),
      testFailedMessage: 'File not found. Please try again.'
    })
  }
  
  let hashAlgo = await readlineUtils.autoCheckQuestion(rlInterface, "Input the desired hash algorithm? (sha256):", {
    placeholderIfInputEmpty: 'sha256',
    test: input => getHashes().includes(input),
    testFailedMessage: 'Invalid/Unsupported algorithm. Please try again.'
  })
  
  let hashEncoding = await readlineUtils.autoCheckQuestion(rlInterface, "Input the desired hash encoding? (base64):", {
    placeholderIfInputEmpty: 'base64',
    test: input => Buffer.isEncoding(input),
    testFailedMessage: 'Invalid/Unsupported encoding. Please try again.'
  }) as BufferEncoding

  rlInterface.close()

  console.info("Output hash:", await hashFromFile(filePath, hashAlgo, hashEncoding))
}