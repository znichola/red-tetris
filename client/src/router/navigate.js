/**
 * navigate component for SPA navigation
 * @param {string} to
 */
function navigate(to) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export { navigate };
