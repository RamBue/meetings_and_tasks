import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getUsers } from "../services/userService";
import { updateMeeting } from "../services/meetingService";

function names(users) {
  return users && users.length > 0 ? users.map((u) => u.name).join(", ") : "–";
}

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

function MeetingRollenBaustein({ meeting, onSaved }) {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [chair, setChair] = useState(meeting.chair?._id || "");
  const [businessUnitLeads, setBusinessUnitLeads] = useState(
    (meeting.businessUnitLeads || []).map((u) => u._id),
  );
  const [excusedUsers, setExcusedUsers] = useState(
    (meeting.excusedUsers || []).map((u) => u._id),
  );
  const [guests, setGuests] = useState(meeting.guests || "");
  const [minutesBy, setMinutesBy] = useState(meeting.minutesBy?._id || "");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("Fehler beim Laden der Benutzer:", err));
  }, []);

  const resetForm = () => {
    setChair(meeting.chair?._id || "");
    setBusinessUnitLeads((meeting.businessUnitLeads || []).map((u) => u._id));
    setExcusedUsers((meeting.excusedUsers || []).map((u) => u._id));
    setGuests(meeting.guests || "");
    setMinutesBy(meeting.minutesBy?._id || "");
    setError("");
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateMeeting(meeting._id, {
        chair: chair || null,
        businessUnitLeads,
        excusedUsers,
        guests,
        minutesBy: minutesBy || null,
      });
      setIsEditing(false);
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Angaben konnten nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="mb-0">Besetzung</h5>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Bearbeiten
            </Button>
          </div>

          <Row className="gy-2">
            <Col md={6}>
              <strong>Leitung:</strong> {meeting.chair?.name || "–"}
            </Col>
            <Col md={6}>
              <strong>Bereichsleitung:</strong>{" "}
              {names(meeting.businessUnitLeads)}
            </Col>
            <Col md={6}>
              <strong>Entschuldigt:</strong> {names(meeting.excusedUsers)}
            </Col>
            <Col md={6}>
              <strong>Gäste:</strong> {meeting.guests || "–"}
            </Col>
            <Col md={6}>
              <strong>Protokoll:</strong> {meeting.minutesBy?.name || "–"}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <h5 className="mb-3">Besetzung</h5>

        <Form onSubmit={handleSave}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Leitung</Form.Label>
                <Form.Select
                  value={chair}
                  onChange={(e) => setChair(e.target.value)}
                >
                  <option value="">Bitte wählen...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Protokoll</Form.Label>
                <Form.Select
                  value={minutesBy}
                  onChange={(e) => setMinutesBy(e.target.value)}
                >
                  <option value="">Bitte wählen...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Bereichsleitung</Form.Label>
                <MultiUserSelect
                  idPrefix="bl"
                  users={users}
                  selectedIds={businessUnitLeads}
                  onChange={setBusinessUnitLeads}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Entschuldigt</Form.Label>
                <MultiUserSelect
                  idPrefix="ex"
                  users={users}
                  selectedIds={excusedUsers}
                  onChange={setExcusedUsers}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Gäste</Form.Label>
                <Form.Control
                  type="text"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="Namen der Gäste"
                />
              </Form.Group>
            </Col>
          </Row>

          {error && <div className="text-danger mb-2">{error}</div>}

          <div className="d-flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              Speichern
            </Button>
            <Button variant="outline-secondary" onClick={handleCancel}>
              Abbrechen
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default MeetingRollenBaustein;
