declare type Result<T, E> = [T, null] | [null, E];

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: `${number}`;
    NODE_ENV: 'development' | 'production';

    GEMINI_API_KEY: string;
  }
}
