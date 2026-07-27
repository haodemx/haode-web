(function attachHaodeAnalytics(global) {
  const MEASUREMENT_ID = "G-22TCLJDXYS";
  const dataLayer = global.dataLayer = global.dataLayer || [];
  const hasConfig = dataLayer.some((entry) => {
    const values = Array.from(entry || []);
    return values[0] === "config" && values[1] === MEASUREMENT_ID;
  });

  if (typeof global.gtag !== "function") {
    global.gtag = function gtag() {
      dataLayer.push(arguments);
    };
  }

  if (!global.document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`)) {
    const loader = global.document.createElement("script");
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    loader.setAttribute("data-haode-analytics-loader", "");
    global.document.head.appendChild(loader);
  }

  if (!hasConfig) {
    global.gtag("js", new Date());
    global.gtag("config", MEASUREMENT_ID);
  }

  global.HaodeAnalytics = Object.freeze({
    measurementId: MEASUREMENT_ID,
    event(name, parameters = {}) {
      global.gtag("event", name, parameters);
    }
  });
})(window);
