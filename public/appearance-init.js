// Runs before styles so a saved theme is applied before the first paint.
(function () {
  var value = {};
  try { value = JSON.parse(localStorage.getItem('mynaa.appearance') || '{}') || {}; } catch (_) {}
  var theme = ['system','light','dark'].includes(value.theme) ? value.theme : 'system';
  var motion = ['off','subtle','standard'].includes(value.motion) ? value.motion : 'subtle';
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.motion = motion;
  document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
})();
