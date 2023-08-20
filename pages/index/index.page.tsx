import Hero from "../../components/hero";
import Navbar from "../../components/navbar";
import SectionTitle from "../../components/sectionTitle";

import { benefitOne, benefitTwo } from "../../components/data";
import Video from "../../components/video";
import Benefits from "../../components/benefits";
import Footer from "../../components/footer";
import Testimonials from "../../components/testimonials";
import Cta from "../../components/cta";
import Faq from "../../components/faq";
import PopupWidget from "../../components/popupWidget";

import { ChatBox } from "../../components/chatbot";

export const Page = () => {
  return (
    <div>
      <Navbar />
      <Hero />

      <ChatBox />

      <SectionTitle
        pretitle="Civic Quest"
        title="See your city in a new light">
        Explore your city in a whole new way with CivicQuest, the AI-powered itinerary app that turns urban adventures into an exciting game! CivicQuest utilizes advanced artificial intelligence to create custom sightseeing quests based on your interests, time, and location.
      </SectionTitle>

      <Benefits data={benefitOne} />
      <Cta />
      <Footer />
    </div>

  );
};
