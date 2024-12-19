import Hotjar from '@hotjar/browser';
import { builtEnvironment } from '.';

const prodSiteId = 5232453;
const devSiteId = 5232444;
const hotjarVersion = 6;

export function hotJarInit() {
  switch (builtEnvironment) {
    case 'prod':
      Hotjar.init(prodSiteId, hotjarVersion);
      break;
    case 'dev':
      Hotjar.init(devSiteId, hotjarVersion);
      break;
    default:
      break;
  }
}
