export const retrieveFromLocalStorage = (key: string) => {
  if (typeof localStorage !== "undefined") {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  }
  return null;
};

export const storeInLocalStorage = <T>(key: string, value: T): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const deleteFromLocalStorage = (key: string): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
  }
};
