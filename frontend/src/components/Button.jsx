import Button from "react-bootstrap/Button";
import { Link } from "react-router";

function ActiveButton({ text, to, disabled = false }) {
  return (
    <Button
      as={disabled ? undefined : Link}
      to={disabled ? undefined : to}
      disabled={disabled}
      style={{
        color: disabled ? "#6c757d" : "black",
        backgroundColor: disabled ? "#e9ecef" : "#A8CF44",
        borderColor: disabled ? "#6c757d" : "#A8CF44",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {text}
    </Button>
  );
}

export default ActiveButton;
