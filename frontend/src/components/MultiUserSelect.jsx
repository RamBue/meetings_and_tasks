import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";

function MultiUserSelect({ idPrefix, users, selectedIds, onChange }) {
  const toggle = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const summary =
    selectedIds.length > 0
      ? users
          .filter((u) => selectedIds.includes(u._id))
          .map((u) => u.name)
          .join(", ")
      : "Bitte wählen...";

  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle
        variant="outline-secondary"
        className="w-100 text-start text-truncate"
      >
        {summary}
      </Dropdown.Toggle>
      <Dropdown.Menu className="w-100 px-2">
        {users.map((u) => (
          <Form.Check
            key={u._id}
            type="checkbox"
            id={`${idPrefix}-${u._id}`}
            label={u.name}
            checked={selectedIds.includes(u._id)}
            onChange={() => toggle(u._id)}
            className="py-1"
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default MultiUserSelect;
