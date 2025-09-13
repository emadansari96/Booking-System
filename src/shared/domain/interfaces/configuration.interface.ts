// ✅ Interface کوچک و متمرکز
export interface Configuration {
    get<T>(key: string): T;
    get<T>(key: string, defaultValue: T): T;
    set<T>(key: string, value: T): void;
    has(key: string): boolean;
  }
  