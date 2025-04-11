import { useState } from "react";
import { useEffect } from "react";
import { navigate } from "./navigate";

/**
 * @param {Object} props
 * @param {Object.<string, React.ComponentType>[]} props.routes
 * @returns {React.JSX.Element}
 */
function Router({ routes }) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [Component, setComponent] = useState(<NotFound />);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", onLocationChange);

    return () => {
      window.removeEventListener("popstate", onLocationChange);
    };
  }, []);

  useEffect(() => {
    for (const routeObj of routes) {
      const [path, Comp] = Object.entries(routeObj)[0];
      const params = matchParams(path, currentPath);
      const isMatch = params !== null;
      if (isMatch) {
        setComponent(<Comp params={params} />);
        return;
      }
    }
    setComponent(<NotFound />);
  }, [currentPath, routes]);

  return Component;
}

/**
 * Link compnent for SPA style navigation
 * @param {Object} props
 * @param {string} props.to
 * @param {React.ReactNode} props.children
 * @returns {React.JSX.Element}
 */
function Link({ to, href, children, ...props }) {
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to || href);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

function NotFound() {
  return (
    <div>
      Not found <Link to="/">return Home</Link>
    </div>
  );
}

/**
 *
 * @param {string} routePattern
 * @param {string} browserPath
 * @returns {Object<string, string> | null} - a key value map or the seach params.
 */
function matchParams(routePattern, browserPath) {
  const routePathParts = routePattern.split("/").filter((v) => v != "");
  const currentPathParts = browserPath.split("/").filter((v) => v != "");

  var res = {};
  if (routePattern === browserPath) return res;
  if (routePathParts.length != currentPathParts.length) return null;

  const goodMatches = routePathParts.map((id, i) => {
    const match = currentPathParts.at(i);

    if (match == undefined) {
      return false;
    } else if (id.startsWith(":")) {
      res[id.slice(1)] = match;
      return true;
    } else if (id == currentPathParts[i]) {
      return true;
    }
    return false;
  });

  if (goodMatches.filter((v) => v == false).length != 0) return null;

  return res;
}

export { Router, Link, NotFound };
