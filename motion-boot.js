/*
 * Render-blocking on purpose and tiny on purpose. It has to run before the first frame
 * so it can tell the incoming page-turn which way to go.
 */
(function () {
  var DIR_KEY = 'si.nav.dir';

  document.addEventListener(
    'click',
    function (e) {
      var link = e.target && e.target.closest ? e.target.closest('a[data-dir]') : null;
      if (!link) return;
      try {
        sessionStorage.setItem(DIR_KEY, link.getAttribute('data-dir'));
      } catch (err) {}
    },
    true
  );

  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    var dir = null;
    try {
      dir = sessionStorage.getItem(DIR_KEY);
      sessionStorage.removeItem(DIR_KEY);
    } catch (err) {}
    if (!dir && window.navigation && navigation.activation && navigation.activation.from) {
      var from = navigation.activation.from.index;
      var to = navigation.activation.entry.index;
      dir = to < from ? 'backward' : 'forward';
    }
    document.documentElement.classList.add('is-vt-arrival');
    e.viewTransition.types.add(dir || 'forward');
  });
})();
