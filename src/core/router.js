const routes = new Map();

export function defineRoute(path, handler) {
  routes.set(path, handler);
}

export function currentRoute() {
  const hash = location.hash || "#/";
  const path = hash.replace(/^#/, "") || "/";
  const [route, query = ""] = path.split("?");
  return { route, query: new URLSearchParams(query) };
}

export function navigate(path) {
  location.hash = path;
}

export function startRouter(context) {
  const render = () => {
    const { route, query } = currentRoute();
    const handler = routes.get(route) || routes.get("/");
    handler(context, query);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  window.addEventListener("hashchange", render);
  window.addEventListener("bytewerk:state", render);
  render();
}
