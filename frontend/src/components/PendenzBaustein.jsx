import { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Badge from "react-bootstrap/Badge";
import { createTask, updateTask } from "../services/taskService";

function toInputDate(date) {
  return date ? new Date(date).toISOString().split("T")[0] : "";
}

function PendenzBaustein({
  task,
  meetingCategory,
  meetingStartsAt,
  agendaItemId,
  onSaved,
  onCancelNew,
}) {
  const isNew = !task;
  const defaultDueDate = toInputDate(meetingStartsAt);

  const [isEditing, setIsEditing] = useState(isNew);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedUser, setAssignedUser] = useState(task?.assignedUser || "");
  const [dueDate, setDueDate] = useState(
    isNew ? defaultDueDate : toInputDate(task.dueDate),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setAssignedUser(task?.assignedUser || "");
    setDueDate(isNew ? defaultDueDate : toInputDate(task.dueDate));
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

    const payload = {
      title,
      description,
      assignedUser,
      dueDate,
      category: task?.category || meetingCategory,
      status: task?.status || "open",
      agendaItemId: task?.agendaItemId || agendaItemId,
    };

    try {
      if (isNew) {
        await createTask(payload);
        resetForm();
        onCancelNew?.();
      } else {
        await updateTask(task._id, payload);
        setIsEditing(false);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Pendenz konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = async () => {
    try {
      await updateTask(task._id, {
        status: task.status === "done" ? "open" : "done",
      });
      onSaved();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isEditing) {
    return (
      <Card className="mb-3">
        <Card.Body>
          <Stack direction="horizontal" gap={3} className="align-items-start">
            <Form.Check
              type="checkbox"
              checked={task.status === "done"}
              onChange={toggleDone}
              title="Als erledigt markieren"
              className="mt-1"
            />

            <div className="flex-grow-1">
              <Badge bg="secondary" className="mb-1">
                Pendenz
              </Badge>
              <Card.Title
                className={
                  task.status === "done"
                    ? "text-decoration-line-through text-muted"
                    : ""
                }
              >
                {task.title}
              </Card.Title>

              {task.description && <Card.Text>{task.description}</Card.Text>}

              <Card.Text className="text-muted mb-0">
                <small>
                  Wer: {task.assignedUser} · Erstellt am:{" "}
                  {new Date(task.createdAt).toLocaleDateString("de-CH")} ·
                  Fällig am:{" "}
                  {new Date(task.dueDate).toLocaleDateString("de-CH")}
                </small>
              </Card.Text>
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
        <Badge bg="secondary" className="mb-2">
          Pendenz
        </Badge>
        <Form onSubmit={handleSave}>
          <Form.Group className="mb-2">
            <Form.Label>Titel</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Beschreibung</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Wer</Form.Label>
            <Form.Control
              type="text"
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fällig am</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </Form.Group>

          {error && <div className="text-danger mb-2">{error}</div>}

          <Stack direction="horizontal" gap={2}>
            <Button type="submit" variant="primary" disabled={saving}>
              {isNew ? "Pendenz hinzufügen" : "Speichern"}
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

export default PendenzBaustein;
