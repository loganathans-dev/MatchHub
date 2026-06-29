import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminSignIn from './pages/Admin/AdminSignIn';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CollegeList from './pages/Students/CollegeList';
import CollegeDashboard from './pages/Students/CollegeDashboard';
import StudentEventList from './pages/Students/StudentEventList';
import SignIn from './pages/Management/SignIn';
import ForgotPassword from './pages/Management/ForgotPassword';
import Registration from './pages/Management/Registration';
import SportsDayEvent from './pages/Management/SportsDayEvent';
import DepartmentRegistration from './pages/Management/DepartmentRegistration';
import MatchSchedule from './pages/Management/MatchSchedule';
import MatchResult from './pages/Management/MatchResult';
import ScheduledMatchesList from './pages/Management/ScheduledMatchesList';
import PointsTable from './pages/Management/PointsTable';
import ManagementHome from './pages/Management/ManagementHome';
import EventList from './pages/Management/EventList';

function App() {
  return (
    <Router>
      <Routes>
        {/* Student Portal Routes */}
        <Route path="/students/colleges" element={<CollegeList />} />
        <Route path="/students/colleges/:id" element={<StudentEventList />} />
        <Route path="/students/colleges/:collegeId/events/:eventId" element={<CollegeDashboard />} />

        {/* Admin Auth Routes */}
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Management Auth Routes */}
        <Route path="/management/signin" element={<SignIn />} />
        <Route path="/management/forgot-password" element={<ForgotPassword />} />
        <Route path="/management/registration" element={<Registration />} />
        
        {/* Management Dashboard/Settings Routes */}
        <Route path="/management/home" element={<ManagementHome />} />
        <Route path="/management/event-list" element={<EventList />} />
        <Route path="/management/sports-day-event" element={<SportsDayEvent />} />
        <Route path="/management/department-registration" element={<DepartmentRegistration />} />
        <Route path="/management/match-schedule" element={<MatchSchedule />} />
        <Route path="/management/scheduled-matches" element={<ScheduledMatchesList />} />
        <Route path="/management/match-result" element={<MatchResult />} />
        <Route path="/management/points-table" element={<PointsTable />} />

        {/* Default route redirects to students portal */}
        <Route path="*" element={<Navigate to="/students/colleges" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
