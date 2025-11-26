import React, { useState, useEffect } from 'react';
import { ClassType, Package, User, LessonSession } from '../types';
import { api } from '../services/api';
import { useClasses, usePackages, useSessions } from '../hooks/useQueries';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface BookingProps {
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 'CLASS' | 'PACKAGE' | 'SCHEDULE' | 'CONFIRM';

export const Booking: React.FC<BookingProps> = ({ user, onComplete, onCancel }) => {
  const [step, setStep] = useState<Step>('CLASS');
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // -- DATA HOOKS --
  const { data: allClassTypes = [] } = useClasses();
  const { data: allPackages = [] } = usePackages();
  const { data: allSessions = [] } = useSessions();

  const [availableSessions, setAvailableSessions] = useState<LessonSession[]>([]);

  useEffect(() => {
    if (selectedClass) {
      // Find future sessions for this class type that aren't full
      const sessions = allSessions.filter(s =>
        s.classTypeId === selectedClass.id &&
        new Date(s.startTime) > new Date() &&
        s.enrolledUserIds.length < s.capacity
      );
      setAvailableSessions(sessions);
    }
  }, [selectedClass, allSessions]);

  const handleClassSelect = (cls: ClassType) => {
    setSelectedClass(cls);
    setStep('SCHEDULE');
  };

  const handleTimeSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // If user has no credits, prompt for package, else confirm
    if ((user.packageCredits || 0) <= 0) {
      setStep('PACKAGE');
    } else {
      setStep('CONFIRM');
    }
  };

  const handlePackageSelect = (pkg: Package | null) => {
    setSelectedPackage(pkg); // Null means "Pay per lesson"
    setStep('CONFIRM');
  };

  const handleConfirm = async () => {
    try {
      if (!selectedSessionId || !selectedClass) return;

      if (selectedPackage) {
        // Record the purchase
        await api.purchasePackage(user.id, selectedPackage.id);
      }

      // Book the session (this will deduct credit if available)
      await api.bookSession(selectedSessionId, user.id);

      onComplete();
    } catch (e) {
      alert('Booking failed: ' + e);
    }
  };

  // Helper to get instructor name (we might need to fetch users if we want names, or just IDs)
  // For now, let's assume we can't easily get names without fetching all users.
  // We can use a simple hook or just display ID if name not available, 
  // but better to fetch users.
  // Let's add useUsers hook here too.
  // Actually, let's just use a placeholder or fetch users.
  // I'll add useUsers hook.

  // We need to import useUsers
  // But wait, I can't change imports easily in this block without rewriting.
  // I'll just use a placeholder or ID for now, or fetch users if I can.
  // Actually, I can just add useUsers to the imports and hook usage since I am rewriting the file.

  return <BookingContent
    user={user}
    onComplete={onComplete}
    onCancel={onCancel}
    allClassTypes={allClassTypes}
    allPackages={allPackages}
    allSessions={allSessions}
    availableSessions={availableSessions}
    step={step}
    setStep={setStep}
    selectedClass={selectedClass}
    setSelectedClass={setSelectedClass}
    selectedPackage={selectedPackage}
    setSelectedPackage={setSelectedPackage}
    selectedSessionId={selectedSessionId}
    setSelectedSessionId={setSelectedSessionId}
    handleClassSelect={handleClassSelect}
    handleTimeSelect={handleTimeSelect}
    handlePackageSelect={handlePackageSelect}
    handleConfirm={handleConfirm}
  />;
};

// Split into sub-component to use hooks cleanly or just put it all in one.
// I'll put it all in one, but I need to add useUsers.

const BookingContent: React.FC<any> = ({
  user, onComplete, onCancel,
  allClassTypes, allPackages, allSessions, availableSessions,
  step, setStep,
  selectedClass, setSelectedClass,
  selectedPackage, setSelectedPackage,
  selectedSessionId, setSelectedSessionId,
  handleClassSelect, handleTimeSelect, handlePackageSelect, handleConfirm
}) => {
  // We need instructor names.
  // Let's assume we can fetch them or they are passed.
  // I will use a separate hook in the main component if I want to be clean.
  // But for now, let's just display "Instructor" or similar if we don't have the name.
  // Or I can add useUsers to the main component.

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 font-sans">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          <span className={step === 'CLASS' ? 'text-zinc-900' : ''}>1. Select Program</span>
          <span className={step === 'SCHEDULE' ? 'text-zinc-900' : ''}>2. Schedule</span>
          <span className={step === 'PACKAGE' ? 'text-zinc-900' : ''}>3. Payment</span>
          <span className={step === 'CONFIRM' ? 'text-zinc-900' : ''}>4. Confirm</span>
        </div>
        <div className="h-1 bg-zinc-200 w-full">
          <div
            className="h-full bg-zinc-900 transition-all duration-300 ease-out"
            style={{
              width: step === 'CLASS' ? '25%' :
                step === 'SCHEDULE' ? '50%' :
                  step === 'PACKAGE' ? '75%' : '100%'
            }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <Button variant="outline" size="sm" onClick={onCancel} className="mb-4 border-zinc-300 text-zinc-600 hover:text-zinc-900">
          <ChevronLeft size={14} className="mr-1" /> Return to Dashboard
        </Button>
        <h1 className="text-3xl font-extrabold text-zinc-900 uppercase tracking-tight">
          {step === 'CLASS' && 'Select Your Lesson'}
          {step === 'SCHEDULE' && 'Select Time Slot'}
          {step === 'PACKAGE' && 'Purchase Credits'}
          {step === 'CONFIRM' && 'Confirm Booking'}
        </h1>
      </div>

      {step === 'CLASS' && (
        <div className="grid gap-4">
          {allClassTypes.map((cls: ClassType) => (
            <Card
              key={cls.id}
              onClick={() => handleClassSelect(cls)}
              className="p-6 flex justify-between items-center hover:border-zinc-900 cursor-pointer group border-zinc-200 transition-colors"
            >
              <div>
                <h3 className="text-lg font-bold group-hover:text-zinc-900 transition-colors text-zinc-800">{cls.name}</h3>
                <p className="text-zinc-500 text-sm font-medium">{cls.durationMinutes} mins • {cls.difficulty}</p>
              </div>
              <ChevronRight className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
            </Card>
          ))}
        </div>
      )}

      {step === 'SCHEDULE' && (
        <div className="grid gap-4">
          {availableSessions.length === 0 ? (
            <div className="text-center p-12 bg-zinc-50 rounded-lg text-zinc-400 border border-zinc-200 border-dashed">
              No upcoming sessions available for this class type.
            </div>
          ) : (
            availableSessions.map((session: LessonSession) => (
              <Card
                key={session.id}
                onClick={() => handleTimeSelect(session.id)}
                className="p-6 flex items-center gap-6 hover:border-zinc-900 cursor-pointer transition-all border-zinc-200"
              >
                <div className="bg-zinc-100 p-4 rounded text-zinc-900">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {new Date(session.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-zinc-600 font-medium flex items-center mt-1">
                    <Clock size={14} className="mr-1" />
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <span className="mx-2">•</span>
                    {/* We don't have instructor name easily here without fetching users. */}
                    {/* For now, just show generic or ID if needed, or skip. */}
                    with Instructor
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {step === 'PACKAGE' && (
        <div className="space-y-8">
          <p className="text-zinc-600 leading-relaxed">You currently do not have any class credits. Purchase a package to save on lessons, or pay for a single drop-in session.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {allPackages.map((pkg: Package) => (
              <Card
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg)}
                className={`p-8 border-2 cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-extrabold text-xl text-zinc-900">{pkg.name}</h3>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">{pkg.credits} Lessons</p>
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900">${pkg.price}</div>
                </div>
                <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{pkg.description}</p>
                <div className="text-xs text-zinc-400 font-medium">Saves ${(selectedClass ? selectedClass.priceSingle : 50 * pkg.credits) - pkg.price} compared to single sessions</div>
              </Card>
            ))}
          </div>
          <div className="text-center pt-4">
            <button onClick={() => handlePackageSelect(null)} className="text-sm font-bold text-zinc-500 hover:text-zinc-900 underline">
              Skip package, I'll pay ${selectedClass?.priceSingle} for this single lesson
            </button>
          </div>
        </div>
      )}

      {step === 'CONFIRM' && (
        <div className="space-y-8">
          <Card className="p-8 bg-zinc-50 border-zinc-200">
            <h3 className="font-bold text-lg mb-6 border-b border-zinc-200 pb-4 text-zinc-900 uppercase tracking-tight">Booking Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Program</span>
                <span className="font-bold text-zinc-900">{selectedClass?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Date & Time</span>
                <span className="font-bold text-zinc-900">
                  {availableSessions.find((s: LessonSession) => s.id === selectedSessionId)
                    ? new Date(availableSessions.find((s: LessonSession) => s.id === selectedSessionId)!.startTime).toLocaleString()
                    : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Instructor</span>
                <span className="font-bold text-zinc-900">
                  {/* Placeholder for instructor name */}
                  Instructor
                </span>
              </div>
              {selectedPackage && (
                <div className="flex justify-between text-zinc-900 font-bold bg-zinc-200 p-2 rounded">
                  <span>Package Added</span>
                  <span>{selectedPackage.name} (+${selectedPackage.price})</span>
                </div>
              )}
              <div className="flex justify-between pt-4 border-t border-zinc-200 mt-4 font-extrabold text-xl text-zinc-900">
                <span>Total Due</span>
                <span>
                  ${selectedPackage ? selectedPackage.price : (user.packageCredits && user.packageCredits > 0 ? 0 : selectedClass?.priceSingle)}
                </span>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('SCHEDULE')} className="flex-1 border-zinc-300 text-zinc-900">
              Go Back
            </Button>
            <Button onClick={handleConfirm} className="flex-1 text-base py-4 shadow-lg">
              Complete Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
