import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MeetingDetailPage from "./pages/MeetingDetailPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import EditTaskPage from "./pages/EditTaskPage";
import TasksPage from "./pages/TasksPage";
import MyNavbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <MyNavbar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/meeting/:id" element={<MeetingDetailPage />} />
          <Route path="/createTask" element={<CreateTaskPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
