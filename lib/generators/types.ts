export interface BaseGeneratorParams {
  count: number;
}

export interface BaseGeneratorConfig {
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

export interface GeneratorResponse {
  names: string[];
}

export interface Generator<T extends BaseGeneratorParams> {
  config: BaseGeneratorConfig;
  generatePrompt: (params: T) => string;
  systemPrompt: string;
  temperature: number;
  examples?: string[];
}
