import { createInterface } from "node:readline/promises";
import { hashFromFile } from "./hashFuncs.js";
import { getHashes } from "node:crypto";
import * as readlineUtils from "./readlineUtils.js"
import { existsSync } from "node:fs";

let filePath
if (process.argv[2]) {
  if (existsSync(process.argv[2])) {
    filePath = process.argv[2]
  } else {
    console.warn(process.argv[2], "is not a valid file. Ignoring...")
  }
}

const rlInterface = createInterface(process.stdin, process.stdout)

let refHash = await readlineUtils.autoCheckQuestion(rlInterface, "Input desired hash to check against: ", {
  rejectIfInputEmpty: true,
})

let hashAlgo = await readlineUtils.autoCheckQuestion(rlInterface, "What's the hash's algorithm? (sha256):", {
  placeholderIfInputEmpty: 'sha256',
  test: input => getHashes().includes(input),
  testFailedMessage: 'Invalid/Unsupported algorithm. Please try again.'
})

let hashEncoding = await readlineUtils.autoCheckQuestion(rlInterface, "What's the hash's encoding? (base64):", {
  placeholderIfInputEmpty: 'base64',
  test: input => Buffer.isEncoding(input),
  testFailedMessage: 'Invalid/Unsupported encoding. Please try again.'
}) as BufferEncoding

if (filePath == undefined) {
  filePath = await readlineUtils.autoCheckQuestion(rlInterface, "Input file to check the hash of: ", {
    rejectIfInputEmpty: true,
    test: existsSync,
    testFailedMessage: 'File not found. Please try again.'
  })
}
rlInterface.close()

const fileHash = await hashFromFile(filePath, hashAlgo, hashEncoding)

if (fileHash == null) {
  process.exit(1);
}

if (refHash == fileHash) {
  console.info('Hash matched.')
  console.info('File hash:', fileHash)
} else {
  console.warn('Warning: Hash did not match.')
  console.warn(`File hash: \x1b[1m${fileHash}\x1b[0m ≠ \x1b[1m${refHash}\x1b[0m`)
}