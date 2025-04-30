import React from 'react'
import Navbar from '../../components/Navbar'
import BookListSection from '../../components/BookListSection'
import HeroSection from '../../components/HeroSection'
import BooksSection from '../../components/BooksSection'
import Footer from '../../components/Footer'

const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <BookListSection />
      <BooksSection />
      <Footer />
    </div>
  )
}

export default Home
