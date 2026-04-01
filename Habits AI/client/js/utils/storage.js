// client/js/utils/storage.js
export const storage = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};