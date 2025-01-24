import { BaseGeneratorParams, Generator } from './types';
import {
  fantasyFootballGenerator,
  FantasyFootballParams,
} from './fantasy-football';
import { babyNameGenerator, BabyNameParams } from './baby-names';

export type GeneratorType = 'fantasy-football' | 'baby-names';

export type GeneratorParams = {
  'fantasy-football': FantasyFootballParams;
  'baby-names': BabyNameParams;
};

const generators: {
  [K in GeneratorType]: Generator<GeneratorParams[K]>;
} = {
  'fantasy-football': fantasyFootballGenerator,
  'baby-names': babyNameGenerator,
};

export function getGenerator<T extends GeneratorType>(
  type: T
): Generator<GeneratorParams[T]> {
  return generators[type];
}

export function getAllGenerators(): Array<{
  type: GeneratorType;
  config: Generator<BaseGeneratorParams>['config'];
}> {
  return Object.entries(generators).map(([type, generator]) => ({
    type: type as GeneratorType,
    config: generator.config,
  }));
}
