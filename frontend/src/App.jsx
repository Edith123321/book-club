import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/users/Home';
import BookClubList from './pages/users/BookClubList';
import AddBookClub from './pages/users/AddBookClub';
import EditBookClub from './pages/users/EditBookClub';
import BookClubDetails from './pages/users/BookClubDetails';
import BookList from './pages/users/BookList';
import BookDetails from './pages/users/BookDetails';
import AddBook from './pages/users/AddBook';
import EditBook from './pages/users/EditBook';
import MyBooks from './pages/users/MyBooks';
import LogIn from './pages/users/LogIn';
import ScheduleMeeting from './pages/users/ScheduleMeeting';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBook from './pages/admin/AdminBook';
import AdminScheduleMeetings from './pages/admin/AdminScheduleMeetings';


const App = () => {
  return (
    <BrowserRouter>
       <Routes>
         <Route path='/log-in' element ={<LogIn />} />
         <Route path='/' element = {<Home />} />
         <Route path='/bookclubs' element= {<BookClubList />} />
         <Route path='/add-bookclub' element = {<AddBookClub />}/>
         <Route path='/edit-bookclub/:id' element ={<EditBookClub />} />
         <Route path='/bookclub/:id' element ={<BookClubDetails />} />
         <Route path='/bookclub/:id/schedule-meeting' element = {<ScheduleMeeting />} />
         <Route path='/books' element ={<BookList />} />
         <Route path='/book/:id' element ={<BookDetails />}/>
         <Route path='/add-book' element={<AddBook />} />
         <Route path='/edit-book' element = {<EditBook />}/>
         <Route path='/my-books' element = {<MyBooks />} />

         
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/users' element = {<AdminUsers />} />
          <Route path='/books' element = {<AdminBook />} />
          <Route path='/meetings' element ={<AdminScheduleMeetings />} />
         
       </Routes>
    </BrowserRouter>
  )
}

export default App
