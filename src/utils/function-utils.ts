export function debounce(func, delay) {
  let timerId;
  return function (...args) {
      args[0].preventDefault();
      if (timerId) {
          clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
          func(...args);
          timerId = null;
      }, delay);
  }
}