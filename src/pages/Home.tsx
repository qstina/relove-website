import React, { useState, useEffect } from "react";
import { BookOpen, Heart, Users, ShieldCheck, Recycle, Star} from "lucide-react";
import type { Page } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const MissionSection: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center min-h-screen overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(177,156,217,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(160,135,199,0.1) 0%, transparent 50%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5a19ad]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#A087C7]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5a19ad]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#5a19ad]/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-[#A087C7]/5 rounded-full blur-2xl animate-float delay-500"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 text-center max-w-4xl relative z-10">
        {user && user.email && (
          <div className={`mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="font-secondary text-xl text-[#5a19ad] font-medium">
              Hello, {user.email}! 👋
            </p>
          </div>
        )}
        <p className={`font-secondary text-lg text-gray-600 mb-4 tracking-widest uppercase transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          buy, sell, begin again.
        </p>
        <h2 className={`font-primary text-5xl md:text-6xl font-extrabold text-[#333333] tracking-tight transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ textShadow: '0 0 15px rgba(177,156,217,0.5)' }}>
          some things still deserve another chance.
        </h2>
        <p className={`font-secondary text-xl md:text-xl mt-8 text-gray-700 max-w-3xl mx-auto transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          At <strong className="text-[#5a19ad] font-bold shine">re;love</strong>, we help USM students pass on items they no longer use and discover something new from someone else. Because every good ending can become the start of someone else’s story.
        </p>
        <div className={`mt-12 flex justify-center space-x-4 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => onNavigate("Products")}
            className="bg-[#5a19ad] text-white font-secondary text-lg px-10 py-4 rounded-xl shadow-xl hover:bg-[#A087C7] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl animate-bounce hover:animate-none"
          >
            Start Browsing
          </button>
          <button
            onClick={() => onNavigate("Listing")}
            className="bg-white text-[#5a19ad] font-secondary text-lg px-10 py-4 rounded-xl border-2 border-[#5a19ad] shadow-lg hover:bg-[#5a19ad] hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
          >
            Sell an Item
          </button>
        </div>
      </div>
    </section>
  );
};

const StatsSection: React.FC = () => {
  const [counters, setCounters] = useState({ items: 0, students: 0, stories: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => ({
        items: prev.items < 2500 ? prev.items + 25 : 2500,
        students: prev.students < 1200 ? prev.students + 12 : 1200,
        stories: prev.stories < 850 ? prev.stories + 8 : 850,
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-[#5a19ad]/10 to-[#A087C7]/10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Recycle className="w-12 h-12 text-[#5a19ad] mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="font-primary text-4xl font-bold text-[#333333] mb-2">{counters.items.toLocaleString()}+</div>
            <p className="font-secondary text-gray-600">Items Reloved</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Users className="w-12 h-12 text-[#5a19ad] mx-auto mb-4 animate-pulse" />
            <div className="font-primary text-4xl font-bold text-[#333333] mb-2">{counters.students.toLocaleString()}+</div>
            <p className="font-secondary text-gray-600">Happy Students</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Star className="w-12 h-12 text-[#5a19ad] mx-auto mb-4 animate-bounce" />
            <div className="font-primary text-4xl font-bold text-[#333333] mb-2">{counters.stories.toLocaleString()}+</div>
            <p className="font-secondary text-gray-600">Stories Continued</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutSection: React.FC = () => (
  <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
    {/* Floating elements */}
    <div className="absolute top-10 left-10 w-20 h-20 bg-[#5a19ad]/20 rounded-full animate-float"></div>
    <div className="absolute bottom-10 right-10 w-16 h-16 bg-[#A087C7]/20 rounded-full animate-float delay-1000"></div>

    <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative flex items-center justify-center">
          <img src="/assets/logo.png" alt="Logo" className="w-48 h-48 lg:w-64 lg:h-64 animate-pulse transform hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="transform hover:translate-x-2 transition-transform duration-300">
          <h3 className="font-primary text-5xl font-semibold text-[#333333] tracking-tight mb-6 w-min whitespace-nowrap pb-2">
            About Us
          </h3>
          <p className="font-secondary text-lg text-gray-700 leading-relaxed space-y-4">
            <span className="block transform hover:translate-x-1 transition-transform duration-200">
              <strong className="text-[#5a19ad]">re;love</strong> is a small, thoughtful space made for USM students — a place to let go of things you no longer need, and find something that fits into your life next.
            </span>
            <span className="block transform hover:translate-x-1 transition-transform duration-200 delay-100">
              Every item has its own little story — the lamp that kept you awake before finals, the chair that became your loyal nap spot, the gadget that followed you across campus. Here, those stories don’t end. They simply get passed on to another USM student who needs them more.
            </span> 
            <span className="block transform hover:translate-x-1 transition-transform duration-200 delay-200">
              re;love isn’t just about selling things. It’s about <strong className="text-[#5a19ad]">slowing down, sharing what we have, and giving old
              things a quiet new start.</strong>
            </span>
          </p>
        </div>
      </div>
    </div>
  </section>
);

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({
  icon: Icon,
  title,
  description
}) => (
  <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-2 hover:rotate-1 group">
    <Icon className="w-8 h-8 text-[#5a19ad] mb-4 group-hover:animate-bounce" />
    <h4 className="font-secondary text-xl font-bold text-[#333333] mb-3 group-hover:text-[#5a19ad] transition-colors duration-300">{title}</h4>
    <p className="font-secondary text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{description}</p>
  </div>
);

const WhyUsSection: React.FC = () => (
  <section className="py-20 lg:py-28 bg-gray-50">
    <div className="container mx-auto px-4 lg:px-8">
      <h3 className="font-primary text-5xl font-bold text-[#333333] text-center mb-12" style={{ textShadow: '0 0 15px rgba(90,26,173,0.5)' }}>🔍 Why Us?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard icon={Users} title="Made for students, by students." description="Affordable, simple, and built with campus life in mind." />
        <FeatureCard icon={Heart} title="A kinder way to shop." description="Every item finds a new purpose — less waste, more meaning." />
        <FeatureCard icon={BookOpen} title="Honest connections." description="Real people, real stories — each exchange means something." />
        <FeatureCard icon={ShieldCheck} title="Easy, safe, and community-based." description="Buying secondhand should feel as warm as giving." />
      </div>
    </div>
  </section>
);

const Home: React.FC<HomeProps> = ({ onNavigate }) => (
  <>
    <MissionSection onNavigate={onNavigate} />
    <StatsSection />
    <AboutSection />
    <WhyUsSection />
  </>
);

export default Home;
