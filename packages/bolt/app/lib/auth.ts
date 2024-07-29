export function forgetAuth() {
  // FIXME: use dedicated method
  localStorage.removeItem('__wc_api_tokens__');
}
