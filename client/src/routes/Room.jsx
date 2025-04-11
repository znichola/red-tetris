import { Link } from "../router/Router.jsx";

/**
 *
 * @param {Object} props
 * @param {Object<string, string>} props.params
 * @returns {React.JSX.Element}
 */
function Room({ params }) {
  return (
    <div>
      <h2>ROOM</h2>
      <div>
        {params.room} + {params.player}
      </div>
      <Link to="/">home</Link>
    </div>
  );
}

export { Room };
