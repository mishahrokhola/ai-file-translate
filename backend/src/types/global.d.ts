declare type Result<T, E> = [T, null] | [null, E];

declare type UserDto = {
  id: number;
  name: string;
};

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: `${number}`;
    NODE_ENV: 'development' | 'production';

    GEMINI_API_KEY: string;
  }
}

declare namespace Express {
  interface Request {
    user?: UserDto;
  }
}
