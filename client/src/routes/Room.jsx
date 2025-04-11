import { Link } from "../router/Router";

/**
 *
 * @param {Object} props
 * @param {Object<string, string>} props.params
 * @returns {JSX.Element}
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
