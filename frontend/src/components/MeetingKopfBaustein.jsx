import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { deleteMeeting, updateMeeting } from "../services/meetingService";

function formatDateTime(date) {
  return new Date(date).toLocaleString("de-CH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// datetime-local erwartet "JJJJ-MM-TTThh:mm" in der lokalen Zeit
function toDateTimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function MeetingKopfBaustein({ meeting, agendaItemCount, onSaved }) {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const handleEdit = () => {
    setStartsAt(toDateTimeLocal(meeting.startsAt));
    setEndsAt(toDateTimeLocal(meeting.endsAt));
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setError("");
    setIsEditing(false);
  };

  // Beim Verschieben des Beginns wandert das Ende mit, die Dauer bleibt gleich
  const handleStartChange = (value) => {
    if (value && startsAt && endsAt) {
      const duration = new Date(endsAt) - new Date(startsAt);
      if (duration > 0) {
        setEndsAt(toDateTimeLocal(new Date(value).getTime() + duration));
      }
    }
    setStartsAt(value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("Das Ende muss nach dem Beginn liegen");
      return;
    }

    setSaving(true);

    try {
      await updateMeeting(meeting._id, {
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      setIsEditing(false);
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Meeting konnte nicht verschoben werden");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setSaving(true);

    try {
      await deleteMeeting(meeting._id);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Meeting konnte nicht gelöscht werden");
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h2>{meeting.title}</h2>

          {!isEditing && (
            <p className="text-white mb-1">
              {formatDateTime(meeting.startsAt)} &ndash;{" "}
              {formatDateTime(meeting.endsAt)}
            </p>
          )}

          <p className="text-white mb-0">
            {meeting.location || "Kein Ort erfasst"}
          </p>
        </div>

        {!isEditing && (
          <Button
            variant="light"
            className="btn-soft btn-kopf-edit"
            size="sm"
            onClick={handleEdit}
          >
            Bearbeiten
          </Button>
        )}
      </div>

      {isEditing && (
        <Form onSubmit={handleSave} className="mt-3">
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Neuer Beginn</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => handleStartChange(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Neues Ende</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={endsAt}
                  min={startsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <small className="text-white d-block mb-3">
            Die Dauer bleibt gleich, wenn Sie nur den Beginn ändern. Die
            fälligen Pendenzen richten sich nach dem neuen Datum.
          </small>

          {error && (
            <div className="bg-white text-danger rounded px-2 py-1 mb-3 d-inline-block">
              {error}
            </div>
          )}

          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div className="d-flex gap-2">
              <Button type="submit" variant="light" disabled={saving}>
                Speichern
              </Button>
              <Button variant="outline-light" onClick={handleCancel}>
                Abbrechen
              </Button>
            </div>

            <Button
              variant="outline-light"
              onClick={() => {
                setError("");
                setShowDelete(true);
              }}
            >
              Meeting löschen
            </Button>
          </div>
        </Form>
      )}

      <Modal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        centered
        className="text-body"
      >
        <Modal.Header closeButton>
          <Modal.Title>Meeting löschen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Möchten Sie das Meeting <strong>{meeting.title}</strong> wirklich
            löschen?
          </p>
          <p className="mb-0">
            Folgendes wird endgültig gelöscht: {agendaItemCount}{" "}
            {agendaItemCount === 1 ? "Traktandum" : "Traktanden"} mit allen
            Entscheiden und Informationen sowie das hochgeladene Protokoll.
            Pendenzen bleiben erhalten.
          </p>

          {error && <div className="text-danger mt-3">{error}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            Endgültig löschen
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDelete(false)}
          >
            Abbrechen
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MeetingKopfBaustein;
