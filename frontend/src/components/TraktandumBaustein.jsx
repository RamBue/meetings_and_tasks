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
  deleteAgendaItem,
  updateAgendaItem,
} from "../services/agendaItemService";
import { getMeetings } from "../services/meetingService";
import { toLocalDateInput } from "../utils/dates";
import { getDecisionsByAgendaItem } from "../services/decisionService";
import { getInformationsByAgendaItem } from "../services/informationService";
import { getTasksByAgendaItem } from "../services/taskService";
import PendenzBaustein from "./PendenzBaustein";
import EntscheidBaustein from "./EntscheidBaustein";
import InformationBaustein from "./InformationBaustein";
import { errorMessage } from "../services/apiError";

const LOCKED_MESSAGE =
  "Das Traktandum enthält Entscheide, Informationen oder Pendenzen und kann nicht gelöscht oder verschoben werden.";

function formatInputDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

// Sucht das Meeting, das am gewählten Tag stattfindet (ausser dem aktuellen).
// Gibt es mehrere, gilt dasjenige mit derselben Kategorie.
function findTargetMeeting(meetings, date, currentMeetingId, category) {
  const onDay = meetings.filter(
    (m) => m._id !== currentMeetingId && toLocalDateInput(m.startsAt) === date,
  );

  if (onDay.length === 0) {
    return { error: `Am ${formatInputDate(date)} findet kein Meeting statt.` };
  }
  if (onDay.length === 1) {
    return { meeting: onDay[0] };
  }

  const sameCategory = onDay.filter((m) => m.category === category);
  if (sameCategory.length === 1) {
    return { meeting: sameCategory[0] };
  }
  return {
    error: `Am ${formatInputDate(date)} gibt es mehrere Meetings. Das Traktandum kann nicht eindeutig zugeordnet werden.`,
  };
}

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
  const currentDate = meetingStartsAt ? toLocalDateInput(meetingStartsAt) : "";
  const [meetingDate, setMeetingDate] = useState(currentDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [activeForm, setActiveForm] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [informations, setInformations] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Löschen und Verschieben sind nur möglich, solange noch nichts erfasst ist
  const hasContent =
    decisions.length > 0 || informations.length > 0 || tasks.length > 0;

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("Fehler beim Laden der Benutzer:", err));
  }, []);

  const [reloadKey, setReloadKey] = useState(0);

  // Löst ein erneutes Laden der Entscheide, Informationen und Pendenzen aus
  const loadNested = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!agendaItem) return;
    let cancelled = false;

    Promise.all([
      getDecisionsByAgendaItem(agendaItem._id),
      getInformationsByAgendaItem(agendaItem._id),
      getTasksByAgendaItem(agendaItem._id),
    ])
      .then(([decisionsData, informationsData, tasksData]) => {
        if (cancelled) return;
        setDecisions(decisionsData);
        setInformations(informationsData);
        setTasks(tasksData);
      })
      .catch((err) =>
        console.error("Fehler beim Laden der Traktandum-Inhalte:", err),
      );

    return () => {
      cancelled = true;
    };
  }, [agendaItem, reloadKey]);

  const resetForm = () => {
    setTitle(agendaItem?.title || "");
    setResponsibleUser(agendaItem?.responsibleUser?._id || "");
    setPlannedFrom(agendaItem?.plannedFrom || "");
    setPlannedTo(agendaItem?.plannedTo || "");
    setActualFrom(agendaItem?.actualFrom || "");
    setActualTo(agendaItem?.actualTo || "");
    setMeetingDate(currentDate);
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

    // Anderes Datum gewählt: Traktandum in das Meeting an diesem Tag verschieben
    let targetMeetingId = meetingId;
    if (!isNew && meetingDate && meetingDate !== currentDate) {
      try {
        const result = findTargetMeeting(
          await getMeetings(),
          meetingDate,
          meetingId,
          meetingCategory,
        );
        if (result.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
        targetMeetingId = result.meeting._id;
      } catch (err) {
        console.error(err);
        setError(errorMessage(err, "Meetings konnten nicht geladen werden"));
        setSaving(false);
        return;
      }
    }

    const payload = {
      title,
      responsibleUser: responsibleUser || null,
      plannedFrom,
      plannedTo,
      actualFrom,
      actualTo,
      meetingId: targetMeetingId,
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
      setError(err.conflict ? LOCKED_MESSAGE : errorMessage(err, "Traktandum konnte nicht gespeichert werden"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Traktandum «${agendaItem.title}» wirklich löschen?`,
    );
    if (!confirmed) return;

    setSaving(true);
    setError("");
    try {
      await deleteAgendaItem(agendaItem._id);
      onSaved();
    } catch (err) {
      console.error(err);
      setError(err.conflict ? LOCKED_MESSAGE : errorMessage(err, "Traktandum konnte nicht gelöscht werden"));
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
      <Card.Body className="bg-surface rounded">
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

                {!isNew && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Meeting-Datum</Form.Label>
                      <Form.Control
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        disabled={hasContent}
                      />
                      <Form.Text className="text-muted">
                        {hasContent
                          ? "Verschieben ist nicht mehr möglich: Das Traktandum enthält Entscheide, Informationen oder Pendenzen."
                          : "Ein anderes Datum verschiebt das Traktandum in das Meeting an diesem Tag."}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                )}
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
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant="light"
                    className="btn-soft"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant={saving || hasContent ? "outline-danger" : "danger"}
                    size="sm"
                    onClick={handleDelete}
                    disabled={saving || hasContent}
                    title={
                      hasContent
                        ? "Nicht möglich: Das Traktandum enthält Entscheide, Informationen oder Pendenzen."
                        : undefined
                    }
                  >
                    Löschen
                  </Button>
                </Stack>
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

              {error && <div className="text-danger mt-2">{error}</div>}
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
                  variant="light"
                  className="btn-soft"
                  onClick={() => setActiveForm("entscheid")}
                >
                  Entscheid hinzufügen
                </Button>
                <Button
                  variant="light"
                  className="btn-soft"
                  onClick={() => setActiveForm("information")}
                >
                  Information hinzufügen
                </Button>
                <Button
                  variant="success"
                  className="btn-accent"
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
