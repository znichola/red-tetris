import { useState } from "react";
import { useEffect } from "react";

/**
 * @param {Object} props
 * @param {Object.<string, React.ComponentType>} props.routes 
 * @returns {React.JSX.Element}
 */
function Router({routes}) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", onLocationChange);

    return () => {
      window.removeEventListener("popstate", onLocationChange);
    };
  }, []);

  const Component = routes[currentPath] || NotFound;

  return <Component />;
}

/**
 * Link compnent for SPA style navigation
 * @param {Object} props
 * @param {string} props.to
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function Link({ to, children, ...props }) {
  const handleClick = (e) => {
    e.preventDefault();
    window.history.pushState({}, "", to);
    const navEvent = new PopStateEvent("popstate");
    window.dispatchEvent(navEvent);
    console.log("Link clicked!");
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

function NotFound() {
  return <div>Not found <Link to="/">return Home</Link></div>;
}

export { Router, Link, NotFound };
