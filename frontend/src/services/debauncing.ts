export function Debouncing(fn: any, limit: number) {
  let timer;
  return function (...args) {
    clearInterval(timer);
    timer = setInterval(() => {
      fn.apply(this, args);
    }, limit);
  };
}
