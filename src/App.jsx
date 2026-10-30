import Header from './components/Header'
import Hero from './components/Hero'
import Highlights from './components/Highlights'
import About from './components/About'
import Values from './components/Values'
import Stats from './components/Stats'
import Objectives from './components/Objectives'
import Activities from './components/Activities'
import Achievements from './components/Achievements'
import Team from './components/Team'
import CallToAction from './components/CallToAction'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollUI from './components/ScrollUI'
import useReveal from './components/useReveal'
import { ContentProvider } from './ContentContext'

function Site() {
  useReveal()

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Highlights />
        <About />
        <Values />
        <Stats />
        <Objectives />
        <Activities />
        <Achievements />
        <Team />
        <CallToAction />
        <Contact />
      </main>
      <Footer />
      <ScrollUI />
    </>
  )
}

export default function App() {
  return (
    <ContentProvider>
      <Site />
    </ContentProvider>
  )
}
