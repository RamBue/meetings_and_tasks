import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import { getMeetingById } from "../services/meetingService";
import { CATEGORIES } from "../config/categories";
import PendenzBaustein from "../components/PendenzBaustein";
import MeetingRollenBaustein from "../components/MeetingRollenBaustein";
import ProtokollBaustein from "../components/ProtokollBaustein";

function formatDateTime(date) {
  return new Date(date).toLocaleString("de-CH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MeetingDetailPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMeeting = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMeetingById(id);
      setMeeting(data.meeting);
      setTasks(data.tasks);
    } catch (err) {
      console.error("Fehler beim Laden des Meetings:", err);
      setError("Meeting konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  if (loading) {
    return <Container className="mt-4">Lade Meeting...</Container>;
  }

  if (error || !meeting) {
    return (
      <Container className="mt-4">{error || "Meeting nicht gefunden"}</Container>
    );
  }

  const categoryColor =
    CATEGORIES.find((c) => c.value === meeting.category)?.color ||
    "secondary";

  return (
    <Container className="mt-4">
      <Link to="/">&larr; Zurück zur Übersicht</Link>

      <Card className="mt-3 mb-4">
        <Card.Body>
          <Badge bg={categoryColor} className="mb-2">
            {meeting.category}
          </Badge>
          <h2>{meeting.title}</h2>
          <p className="text-muted mb-1">
            {formatDateTime(meeting.startsAt)} &ndash;{" "}
            {formatDateTime(meeting.endsAt)}
          </p>
          <p className="mb-0">{meeting.location || "Kein Ort erfasst"}</p>
        </Card.Body>
      </Card>

      <MeetingRollenBaustein meeting={meeting} onSaved={loadMeeting} />

      <ProtokollBaustein meeting={meeting} onSaved={loadMeeting} />

      <Card>
        <Card.Body>
          <h4 className="mb-3">Pendenzen</h4>

          {tasks.map((task) => (
            <PendenzBaustein
              key={task._id}
              task={task}
              meetingCategory={meeting.category}
              meetingStartsAt={meeting.startsAt}
              onSaved={loadMeeting}
            />
          ))}

          <PendenzBaustein
            meetingCategory={meeting.category}
            meetingStartsAt={meeting.startsAt}
            onSaved={loadMeeting}
          />
        </Card.Body>
      </Card>
    </Container>
  );
}

export default MeetingDetailPage;
