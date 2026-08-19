import { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import {
  updateMeeting,
  uploadProtocol,
  getProtocolDownloadUrl,
} from "../services/meetingService";

function ProtokollBaustein({ meeting, onSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [corrections, setCorrections] = useState(
    meeting.protocolCorrections || "",
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setCorrections(meeting.protocolCorrections || "");
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
      await updateMeeting(meeting._id, { protocolCorrections: corrections });
      setIsEditing(false);
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Angaben konnten nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  };

  const toggleApproved = async () => {
    try {
      await updateMeeting(meeting._id, {
        protocolApproved: !meeting.protocolApproved,
      });
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Genehmigung konnte nicht gespeichert werden");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      await uploadProtocol(meeting._id, file);
      onSaved();
    } catch (err) {
      console.error(err);
      setError("PDF konnte nicht hochgeladen werden");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!isEditing) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="mb-0">Protokoll</h5>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Bearbeiten
            </Button>
          </div>

          <Stack gap={3}>
            <div>
              <strong>Dokument:</strong>{" "}
              {meeting.protocolOriginalName ? (
                <a
                  href={getProtocolDownloadUrl(meeting._id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {meeting.protocolOriginalName}
                </a>
              ) : (
                "–"
              )}
            </div>

            <Form.Group>
              <Form.Label className="mb-1">
                {meeting.protocolOriginalName
                  ? "PDF ersetzen"
                  : "PDF hochladen"}
              </Form.Label>
              <Form.Control
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              id={`protokoll-genehmigt-${meeting._id}`}
              label="Protokoll genehmigt"
              checked={!!meeting.protocolApproved}
              onChange={toggleApproved}
            />

            <div>
              <strong>Korrekturen / Präzisierungen:</strong>
              <div>{meeting.protocolCorrections || "–"}</div>
            </div>
          </Stack>

          {error && <div className="text-danger mt-2">{error}</div>}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <h5 className="mb-3">Protokoll</h5>

        <Form onSubmit={handleSave}>
          <Form.Group className="mb-3">
            <Form.Label>Korrekturen / Präzisierungen</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={corrections}
              onChange={(e) => setCorrections(e.target.value)}
            />
          </Form.Group>

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

export default ProtokollBaustein;
