import { Interface } from "node:readline/promises";
import { moveCursor, clearScreenDown } from "node:readline";

// TODO: clear lines on wrong input
export async function clearLines(stream: NodeJS.WritableStream, lineCount:number) {
  await new Promise<void>(resolve => moveCursor(stream, 0, lineCount, resolve))
  await new Promise<void>(resolve => clearScreenDown(stream, resolve))
}

type BaseOptions = {
  test?: (input: string) => boolean | Promise<boolean>;
  testFailedMessage?: string;
};

type RejectOptions = {
  rejectIfInputEmpty: boolean;
  placeholderIfInputEmpty?: never;
};

type PlaceholderOptions = {
  placeholderIfInputEmpty: string;
  rejectIfInputEmpty?: never;
};

type AutoCheckQuestionOptions = BaseOptions & (RejectOptions | PlaceholderOptions);

export async function autoCheckQuestion(rlInterface:Interface, question:string, options?:AutoCheckQuestionOptions) {
  let input
  while (true) {
    input = (await rlInterface.question(question)).trim()
    if (input == '') {
      if (options?.rejectIfInputEmpty) {
        console.error("Input is empty. Please try again.")
        continue;
      } else if (options?.placeholderIfInputEmpty) {
        input = options.placeholderIfInputEmpty
        break;
      } else {
        break;
      }
    } else {
      if (options?.test == undefined) {
        break;
      }

      if (await options.test(input)) {
        break;
      } else {
        if (options.testFailedMessage != undefined) {
          console.error(options.testFailedMessage)
          continue;
        }
        console.error('Test failed. Please try again.')
        continue;
      }
    }
  }
  return input
}