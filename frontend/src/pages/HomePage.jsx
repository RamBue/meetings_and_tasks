import { useEffect, useState } from "react";
import MeetingOverview from "../components/MeetingOverview";
import { getMeetings } from "../services/meetingService";
import { useDataChanged } from "../hooks/useDataChanged";
import { errorMessage } from "../services/apiError";

const HomePage = () => {
  console.log("HomePage rendered");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  useEffect(() => {
    console.log("useEffect gestartet");

    const loadMeetings = async () => {
      try {
        setLoading(true);
        const data = await getMeetings();

        console.log("API RESULT:", data);

        setMeetings(data);
        setLoadError("");
        console.log("Meetings gesetzt:", data);
      } catch (error) {
        console.error("Fehler beim Laden der Meetings:", error);
        setLoadError(errorMessage(error, "Meetings konnten nicht geladen werden"));
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, []);

  // Echtzeit-Update: lädt im Hintergrund nach, ohne "Lade Meetings..." einzublenden
  useDataChanged(async () => {
    try {
      setMeetings(await getMeetings());
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Meetings:", error);
    }
  });

  const categories = [
    "Alle",
    ...new Set(meetings.map((meeting) => meeting.category).filter(Boolean)),
  ];
  const filteredMeetings =
    selectedCategory === "Alle"
      ? meetings
      : meetings.filter((meeting) => meeting.category === selectedCategory);

  if (loading) {
    return <div className="container mt-4">Lade Meetings...</div>;
  }

  return (
    <div className="container">
      <h2 className="page-title h2">Meetings</h2>
      <div className="mb-3">
        <label className="form-label">Kategorie auswählen</label>

        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {loadError && (
        <div className="text-danger mb-3" role="alert">
          {loadError}
        </div>
      )}
      {/* Bei einem Ladefehler nicht "Keine Meetings vorhanden" anzeigen */}
      {(!loadError || meetings.length > 0) && (
        <MeetingOverview meetings={filteredMeetings} />
      )}
    </div>
  );
};

export default HomePage;
