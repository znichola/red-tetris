import "./cliptext.css";

/**
 * @param {object} props
 * @param {string} props.text
 * @param {string} props.maxWidth --in valid css units
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 */
export default function ClipText({ text, maxWidth, className = "", children }) {
  return (
    <div style={{ maxWidth }} title={text} className={`clip-text ${className}`}>
      {children}
      {text}
    </div>
  );
}
