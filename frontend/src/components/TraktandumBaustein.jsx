import { useCallback, useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Stack from "react-bootstrap/Stack";
import { getUsers } from "../services/userService";
import {
  createAgendaItem,
  updateAgendaItem,
} from "../services/agendaItemService";
import { getDecisionsByAgendaItem } from "../services/decisionService";
import { getInformationsByAgendaItem } from "../services/informationService";
import { getTasksByAgendaItem } from "../services/taskService";
import PendenzBaustein from "./PendenzBaustein";
import EntscheidBaustein from "./EntscheidBaustein";
import InformationBaustein from "./InformationBaustein";

function TraktandumBaustein({
  agendaItem,
  meetingId,
  meetingCategory,
  meetingStartsAt,
  onSaved,
}) {
  const isNew = !agendaItem;

  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(agendaItem?.title || "");
  const [responsibleUser, setResponsibleUser] = useState(
    agendaItem?.responsibleUser?._id || "",
  );
  const [plannedFrom, setPlannedFrom] = useState(
    agendaItem?.plannedFrom || "",
  );
  const [plannedTo, setPlannedTo] = useState(agendaItem?.plannedTo || "");
  const [actualFrom, setActualFrom] = useState(agendaItem?.actualFrom || "");
  const [actualTo, setActualTo] = useState(agendaItem?.actualTo || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [activeForm, setActiveForm] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [informations, setInformations] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("Fehler beim Laden der Benutzer:", err));
  }, []);

  const loadNested = useCallback(async () => {
    if (!agendaItem) return;
    try {
      const [decisionsData, informationsData, tasksData] = await Promise.all([
        getDecisionsByAgendaItem(agendaItem._id),
        getInformationsByAgendaItem(agendaItem._id),
        getTasksByAgendaItem(agendaItem._id),
      ]);
      setDecisions(decisionsData);
      setInformations(informationsData);
      setTasks(tasksData);
    } catch (err) {
      console.error("Fehler beim Laden der Traktandum-Inhalte:", err);
    }
  }, [agendaItem]);

  useEffect(() => {
    loadNested();
  }, [loadNested]);

  const resetForm = () => {
    setTitle(agendaItem?.title || "");
    setResponsibleUser(agendaItem?.responsibleUser?._id || "");
    setPlannedFrom(agendaItem?.plannedFrom || "");
    setPlannedTo(agendaItem?.plannedTo || "");
    setActualFrom(agendaItem?.actualFrom || "");
    setActualTo(agendaItem?.actualTo || "");
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

    const payload = {
      title,
      responsibleUser: responsibleUser || null,
      plannedFrom,
      plannedTo,
      actualFrom,
      actualTo,
      meetingId,
    };

    try {
      if (isNew) {
        await createAgendaItem(payload);
        resetForm();
      } else {
        await updateAgendaItem(agendaItem._id, payload);
      }
      setIsEditing(false);
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Traktandum konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  };

  if (isNew && !isEditing) {
    return (
      <Button variant="primary" onClick={() => setIsEditing(true)}>
        Traktandum hinzufügen
      </Button>
    );
  }

  return (
    <Card className="mb-3">
      <Card.Body className="bg-light rounded">
        <div className="mb-3">
          {isEditing ? (
            <Form onSubmit={handleSave}>
              <Form.Group className="mb-3">
                <Form.Label>Traktandum</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titel des Traktandums"
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Verantwortlich</Form.Label>
                    <Form.Select
                      value={responsibleUser}
                      onChange={(e) => setResponsibleUser(e.target.value)}
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
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Geplante Zeit</Form.Label>
                    <Stack direction="horizontal" gap={2}>
                      <Form.Control
                        type="time"
                        value={plannedFrom}
                        onChange={(e) => setPlannedFrom(e.target.value)}
                      />
                      <span>bis</span>
                      <Form.Control
                        type="time"
                        value={plannedTo}
                        onChange={(e) => setPlannedTo(e.target.value)}
                      />
                    </Stack>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Effektive Zeit</Form.Label>
                    <Stack direction="horizontal" gap={2}>
                      <Form.Control
                        type="time"
                        value={actualFrom}
                        onChange={(e) => setActualFrom(e.target.value)}
                      />
                      <span>bis</span>
                      <Form.Control
                        type="time"
                        value={actualTo}
                        onChange={(e) => setActualTo(e.target.value)}
                      />
                    </Stack>
                  </Form.Group>
                </Col>
              </Row>

              {error && <div className="text-danger mb-2">{error}</div>}

              <Stack direction="horizontal" gap={2}>
                <Button type="submit" variant="primary" disabled={saving}>
                  {isNew ? "Traktandum hinzufügen" : "Speichern"}
                </Button>

                <Button variant="outline-secondary" onClick={handleCancel}>
                  Abbrechen
                </Button>
              </Stack>
            </Form>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <Card.Title className="mb-0">{agendaItem.title}</Card.Title>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Bearbeiten
                </Button>
              </div>

              <Card.Text className="text-muted mb-0">
                <small>
                  Verantwortlich: {agendaItem.responsibleUser?.name || "–"} ·
                  Geplant:{" "}
                  {agendaItem.plannedFrom || agendaItem.plannedTo
                    ? `${agendaItem.plannedFrom || "–"}–${agendaItem.plannedTo || "–"}`
                    : "–"}{" "}
                  · Effektiv:{" "}
                  {agendaItem.actualFrom || agendaItem.actualTo
                    ? `${agendaItem.actualFrom || "–"}–${agendaItem.actualTo || "–"}`
                    : "–"}
                </small>
              </Card.Text>
            </>
          )}
        </div>

        {!isNew && (
          <>
            {decisions.map((decision) => (
              <EntscheidBaustein
                key={decision._id}
                decision={decision}
                onSaved={loadNested}
              />
            ))}

            {informations.map((information) => (
              <InformationBaustein
                key={information._id}
                information={information}
                onSaved={loadNested}
              />
            ))}

            {tasks.map((task) => (
              <PendenzBaustein
                key={task._id}
                task={task}
                meetingCategory={meetingCategory}
                meetingStartsAt={meetingStartsAt}
                onSaved={loadNested}
              />
            ))}

            {activeForm === null && (
              <Stack direction="horizontal" gap={2}>
                <Button
                  variant="outline-primary"
                  onClick={() => setActiveForm("entscheid")}
                >
                  Entscheid hinzufügen
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => setActiveForm("information")}
                >
                  Information hinzufügen
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setActiveForm("pendenz")}
                >
                  Pendenz hinzufügen
                </Button>
              </Stack>
            )}

            {activeForm === "entscheid" && (
              <EntscheidBaustein
                meetingId={meetingId}
                agendaItemId={agendaItem._id}
                onSaved={loadNested}
                onCancelNew={() => setActiveForm(null)}
              />
            )}

            {activeForm === "information" && (
              <InformationBaustein
                meetingId={meetingId}
                agendaItemId={agendaItem._id}
                onSaved={loadNested}
                onCancelNew={() => setActiveForm(null)}
              />
            )}

            {activeForm === "pendenz" && (
              <PendenzBaustein
                meetingCategory={meetingCategory}
                meetingStartsAt={meetingStartsAt}
                agendaItemId={agendaItem._id}
                onSaved={loadNested}
                onCancelNew={() => setActiveForm(null)}
              />
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default TraktandumBaustein;
