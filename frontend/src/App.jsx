import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// User pages
import Home from './pages/users/Home';
import BookClubList from './pages/users/BookClubList';
import AddBookClub from './pages/users/AddBookClub';
import EditBookClub from './pages/users/EditBookClub';
import BookList from './pages/users/BookList';
import BookDetails from './pages/users/BookDetails';
import AddBook from './pages/users/AddBook';
import EditBook from './pages/users/EditBook';
import MyBooks from './pages/users/MyBooks';
import LogIn from './pages/users/LogIn';
import ScheduleMeeting from './pages/users/ScheduleMeeting';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBooks from './pages/admin/AdminBooks';
import AdminBookClubs from './pages/admin/AdminBookClubs';
import AdminSchedules from './pages/admin/AdminSchedules';

// Layout
import Sidebar
 from './components/Sidebar';
import BookClubDetails from './pages/users/BookClubDetails';
 const AdminLayout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <div style={{ flex: 1, padding: '20px', marginLeft: '20px' }}>
      {children}
    </div>
  </div>
);


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/log-in" element={<LogIn />} />
        <Route path="/bookclubs" element={<BookClubList />} />
        <Route path="/add-bookclub" element={<AddBookClub />} />
        <Route path="/edit-bookclub/:id" element={<EditBookClub />} />
        <Route path ="/bookclub/:id" element={<BookClubDetails />} />
        <Route path="/bookclub/:id/schedule-meeting" element={<ScheduleMeeting />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/books/:id/edit-book" element={<EditBook />} />
        <Route path="/my-books" element={<MyBooks />} />

        {/* Admin Routes with Layout */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/books"
          element={
            <AdminLayout>
              <AdminBooks />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/bookclubs"
          element={
            <AdminLayout>
              <AdminBookClubs />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <AdminLayout>
              <AdminSchedules />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
