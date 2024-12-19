
export function bigMessage(...lines: (string | string[])[]) {

  const flatLines = lines.flat();

  console.log();
  console.log('---')
  console.log(`--- ${flatLines[0]}`);
  console.log('---');

  flatLines.slice(1).forEach(line => {
    console.log(`--- ${line}`);
  });

  console.log('---');
  console.log();
}
