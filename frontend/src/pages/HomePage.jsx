import { useEffect, useState } from "react";
import MeetingOverview from "../components/MeetingOverview";
import { getMeetings } from "../services/meetingService";

const HomePage = () => {
  console.log("HomePage rendered");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  useEffect(() => {
    console.log("useEffect gestartet");

    const loadMeetings = async () => {
      try {
        setLoading(true);
        const data = await getMeetings();

        console.log("API RESULT:", data);

        setMeetings(data);
        console.log("Meetings gesetzt:", data);
      } catch (error) {
        console.error("Fehler beim Laden der Meetings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, []);

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
    <div className="container mt-4">
      <h2 className="mb-4">Meetings</h2>
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
      <MeetingOverview meetings={filteredMeetings} />
    </div>
  );
};

export default HomePage;
