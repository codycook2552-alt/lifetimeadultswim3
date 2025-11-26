import React from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CLASS_TYPES } from '../constants';
import { Timer, CheckCircle, Award } from 'lucide-react';

interface LandingProps {
  onStartBooking: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStartBooking }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative bg-zinc-900 text-white py-32 px-6 md:px-12 overflow-hidden flex items-center justify-center">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-40"></div>

        <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-sm md:text-base font-bold tracking-[0.2em] text-zinc-300 uppercase mb-4">
            The Ultimate Swim Experience
          </h2>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            MASTER THE WATER
          </h1>
          <p className="text-lg md:text-xl text-zinc-200 max-w-2xl mb-12 font-light leading-relaxed">
            Premium instruction tailored to your goals. Experience the Life Time difference with small class sizes and expert coaching.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Button variant="secondary" size="lg" onClick={onStartBooking} className="text-base min-w-[200px] bg-white text-black hover:bg-zinc-200 border-none">
              Book a Lesson
            </Button>
            <Button variant="outline-white" size="lg" className="text-base min-w-[200px]">
              Explore Packages
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                <Award size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-zinc-900 uppercase tracking-wide">Expert Coaching</h3>
              <p className="text-zinc-600 leading-relaxed">Certified instructors specializing in adult learning methodologies and aquatic psychology.</p>
            </div>
            <div className="text-center group">
              <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                <CheckCircle size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-zinc-900 uppercase tracking-wide">Small Groups</h3>
              <p className="text-zinc-600 leading-relaxed">Limited to 4 students per instructor to guarantee personalized attention and faster progress.</p>
            </div>
            <div className="text-center group">
              <div className="bg-zinc-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                <Timer size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-zinc-900 uppercase tracking-wide">Premium Flexibility</h3>
              <p className="text-zinc-600 leading-relaxed">Book lessons that fit your lifestyle with our easy-to-use digital scheduling platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Preview */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 uppercase tracking-tight mb-4">Our Programs</h2>
            <div className="h-1 w-20 bg-zinc-900 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {CLASS_TYPES.map((cls) => (
              <Card key={cls.id} className="p-8 flex flex-col h-full hover:shadow-xl transition-all border-none shadow-sm">
                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${cls.difficulty === 'Beginner' ? 'border-zinc-800 text-zinc-800' :
                      cls.difficulty === 'Intermediate' ? 'border-zinc-500 text-zinc-600' :
                        'border-black text-black bg-zinc-100'
                    }`}>
                    {cls.difficulty}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-zinc-900">{cls.name}</h3>
                <p className="text-zinc-600 mb-8 flex-grow font-light">{cls.description}</p>
                <div className="border-t border-zinc-100 pt-6 mt-auto">
                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-zinc-500 text-sm font-medium uppercase tracking-wide">Per Session</span>
                    <span className="font-bold text-2xl text-zinc-900">${cls.priceSingle}</span>
                  </div>
                  <Button onClick={onStartBooking} className="w-full bg-zinc-900 text-white hover:bg-black">Select Program</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};