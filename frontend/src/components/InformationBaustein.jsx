import { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Badge from "react-bootstrap/Badge";
import {
  createInformation,
  updateInformation,
} from "../services/informationService";

function InformationBaustein({
  information,
  meetingId,
  agendaItemId,
  onSaved,
  onCancelNew,
}) {
  const isNew = !information;

  const [isEditing, setIsEditing] = useState(isNew);
  const [topic, setTopic] = useState(information?.topic || "");
  const [description, setDescription] = useState(
    information?.description || "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTopic(information?.topic || "");
    setDescription(information?.description || "");
    setError("");
  };

  const handleCancel = () => {
    resetForm();
    if (isNew) {
      onCancelNew?.();
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isNew) {
        await createInformation({
          topic,
          description,
          meetingId,
          agendaItemId,
        });
        resetForm();
        onCancelNew?.();
      } else {
        await updateInformation(information._id, { topic, description });
        setIsEditing(false);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Information konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <Card className="mb-3">
        <Card.Body>
          <Stack direction="horizontal" gap={3} className="align-items-start">
            <div className="flex-grow-1">
              <Badge bg="info" text="dark" className="mb-1">
                Information
              </Badge>
              <Card.Title>{information.topic}</Card.Title>

              {information.description && (
                <Card.Text>{information.description}</Card.Text>
              )}
            </div>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Bearbeiten
            </Button>
          </Stack>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-3">
      <Card.Body>
        <Badge bg="info" text="dark" className="mb-2">
          Information
        </Badge>
        <Form onSubmit={handleSave}>
          <Form.Group className="mb-2">
            <Form.Label>Thema</Form.Label>
            <Form.Control
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Beschreibung</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          {error && <div className="text-danger mb-2">{error}</div>}

          <Stack direction="horizontal" gap={2}>
            <Button type="submit" variant="primary" disabled={saving}>
              {isNew ? "Information hinzufügen" : "Speichern"}
            </Button>

            <Button variant="outline-secondary" onClick={handleCancel}>
              Abbrechen
            </Button>
          </Stack>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default InformationBaustein;
