import {Dict} from '../@types';
import {MagicSpaceComment} from '../common';

import {toCamelCase} from './convert-string';

function extractConfig(commentParts: string[]): string[] {
  let configs: string[][] = [];
  let currentIndex = -1;

  let forward = (part: string): void => {
    configs.push([part]);
    currentIndex++;
  };

  // 向注释里提取配置
  for (let part of commentParts) {
    if (part.trim() === '') {
      continue;
    }

    if (/^@/.test(part)) {
      forward(part);
    } else if (/^\$/.test(part)) {
      forward(part);
      configs.push([]);
      currentIndex++;
    } else if (currentIndex >= 0) {
      configs[currentIndex].push(part);
    }
  }

  return configs.map(config => config.join('\n'));
}

export function parse(comment: string): MagicSpaceComment {
  let commentParts = comment.slice(3, comment.length - 2).split('\n');
  let scanResult: Dict<string>[] = [];

  for (let part of extractConfig(commentParts)) {
    if (/^@/.test(part) || /^\$/.test(part)) {
      let configName = part.split(':')[0];

      scanResult.push(
        JSON.parse(
          `{"${toCamelCase(
            configName.slice(1, configName.length).split('-'),
            'lower',
          )}"${part.slice(configName.length, part.length)}}`,
        ),
      );
    } else {
      scanResult.push({template: part});
    }
  }

  return Object.assign({}, ...scanResult);
}
