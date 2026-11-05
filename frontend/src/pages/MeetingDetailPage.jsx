import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";
import { getMeetingById } from "../services/meetingService";
import { useDataChanged } from "../hooks/useDataChanged";
import { exportMeetingPdf } from "../utils/exportMeetingPdf";
import { CATEGORIES } from "../config/categories";
import PendenzBaustein from "../components/PendenzBaustein";
import MeetingRollenBaustein from "../components/MeetingRollenBaustein";
import MeetingKopfBaustein from "../components/MeetingKopfBaustein";
import ProtokollBaustein from "../components/ProtokollBaustein";
import TraktandumBaustein from "../components/TraktandumBaustein";

function MeetingDetailPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [agendaItems, setAgendaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const hasLoaded = useRef(false);

  // Löst ein erneutes Laden aus. Die Daten werden im Hintergrund nachgeladen,
  // ohne die Seite auf "Lade Meeting..." zu schalten (sonst gehen offene
  // Eingaben verloren).
  const loadMeeting = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;

    getMeetingById(id)
      .then((data) => {
        if (cancelled) return;
        setMeeting(data.meeting);
        setTasks(data.tasks);
        setAgendaItems(data.agendaItems);
        hasLoaded.current = true;
      })
      .catch((err) => {
        console.error("Fehler beim Laden des Meetings:", err);
        // Die Fehlermeldung erscheint nur, wenn das Meeting noch nie geladen werden konnte
        if (!cancelled && !hasLoaded.current) {
          setError("Meeting konnte nicht geladen werden");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  // Echtzeit-Update
  useDataChanged(loadMeeting);

  const handleExport = async (mode) => {
    try {
      setExporting(true);
      setExportError("");
      await exportMeetingPdf({ meeting, tasks, agendaItems, mode });
    } catch (err) {
      console.error("Fehler beim PDF-Export:", err);
      setExportError("PDF konnte nicht erstellt werden");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Container className="page-top">Lade Meeting...</Container>;
  }

  if (error || !meeting) {
    return (
      <Container className="page-top">{error || "Meeting nicht gefunden"}</Container>
    );
  }

  const categoryColor =
    CATEGORIES.find((c) => c.value === meeting.category)?.color || "#6c757d";

  return (
    <Container className="page-top">
      <div className="d-flex justify-content-between align-items-center">
        <Link to="/">&larr; Zurück zur Übersicht</Link>

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="btn-soft"
            disabled={exporting}
          >
            {exporting ? "PDF wird erstellt..." : "Als PDF exportieren"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleExport("invitation")}>
              Einladung
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleExport("minutes")}>
              Protokoll
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {exportError && <div className="text-danger mt-2">{exportError}</div>}

      <Card className="mt-3 mb-4">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: categoryColor }}
        >
          <MeetingKopfBaustein
            meeting={meeting}
            agendaItemCount={agendaItems.length}
            onSaved={loadMeeting}
          />
        </Card.Header>
        <Card.Body>
          <MeetingRollenBaustein meeting={meeting} onSaved={loadMeeting} />
        </Card.Body>
      </Card>

      <ProtokollBaustein meeting={meeting} onSaved={loadMeeting} />

      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-3">Pendenzen</h4>

          <Card className="mb-3">
            <Card.Body className="bg-surface rounded">
              <small className="text-muted d-block mb-3">
                Fällige Pendenzen aus vorherigen Meetings
              </small>

              {tasks.map((task) => (
                <PendenzBaustein
                  key={task._id}
                  task={task}
                  meetingCategory={meeting.category}
                  meetingStartsAt={meeting.startsAt}
                  onSaved={loadMeeting}
                />
              ))}
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h4 className="mb-3">Traktanden</h4>

          {agendaItems.map((agendaItem) => (
            <TraktandumBaustein
              key={agendaItem._id}
              agendaItem={agendaItem}
              meetingId={meeting._id}
              meetingCategory={meeting.category}
              meetingStartsAt={meeting.startsAt}
              onSaved={loadMeeting}
            />
          ))}

          <TraktandumBaustein
            meetingId={meeting._id}
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
