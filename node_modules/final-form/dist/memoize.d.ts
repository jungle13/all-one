declare const memoize: <T extends (...args: any[]) => any>(fn: T) => T;
export default memoize;
