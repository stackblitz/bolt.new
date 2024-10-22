declare global {
  interface Window {
    ENV: {
      OSS_HOST: string;
    };
  }
}

export const env = {
  get OSS_HOST() {
    return window.ENV?.OSS_HOST ?? '';
  },
};
