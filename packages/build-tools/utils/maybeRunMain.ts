import { parse } from 'path';
import { bigMessage } from './bigMessage';

export async function maybeRunMain(
  maybeMainModule: NodeModule,
  mainFilePath: string,
  mainFunction: (...args: any[]) => Promise<number>
) {
  if (require.main !== maybeMainModule) {
    return;
  }

  const mainFileNameOnly = parse(mainFilePath).name;
  const mainFileArgIndex = process.argv.findIndex(arg => arg.includes(mainFileNameOnly));
  const restOfArgs = process.argv.slice(mainFileArgIndex + 1);

  mainFunction(...restOfArgs)
    .then(result => (process.exitCode = result))
    .catch(error => {
      process.exitCode = 1;
      if ('stack' in error) {
        bigMessage(error.stack.split('\n'));
      } else {
        bigMessage(String(error));
      }
    });
}
