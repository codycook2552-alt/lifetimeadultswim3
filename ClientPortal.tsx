
import React, { useMemo } from 'react';
import { User } from '../types';
import { useClasses, useUserData } from '../hooks/useQueries';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Clock, CreditCard, MapPin, ShoppingBag } from 'lucide-react';

interface ClientPortalProps {
  user: User;
  onBookClick: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ user, onBookClick }) => {
  const { data: classes = [], isLoading: loadingClasses } = useClasses();
  const { data: userData, isLoading: loadingUserData } = useUserData(user.id);

  const { upcomingSessions, pastSessions } = useMemo(() => {
    if (!userData?.sessions) return { upcomingSessions: [], pastSessions: [] };

    const now = new Date();
    const all = userData.sessions;

    const upcoming = all.filter(s => new Date(s.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const past = all.filter(s => new Date(s.startTime) <= now)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return { upcomingSessions: upcoming, pastSessions: past };
  }, [userData?.sessions]);

  const purchases = userData?.purchases || [];

  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || 'Swim Lesson';

  if (loadingClasses || loadingUserData) {
    return <div className="p-10 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 uppercase tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-zinc-500 mt-1">Your swimming journey continues here.</p>
        </div>
        <Button size="lg" onClick={onBookClick} className="shadow-lg">
          Book New Lesson
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Credits Card */}
        <Card className="p-8 bg-zinc-900 text-white border-zinc-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold opacity-80 uppercase tracking-widest text-xs">Class Credits</h3>
            <CreditCard className="opacity-60" size={20} />
          </div>
          <div className="text-5xl font-extrabold mb-2">{user.packageCredits || 0}</div>
          <p className="text-sm text-zinc-400">Available sessions remaining</p>
          {(!user.packageCredits || user.packageCredits < 2) && (
            <Button size="sm" variant="secondary" className="mt-6 w-full bg-white text-black hover:bg-zinc-200" onClick={onBookClick}>Add Credits</Button>
          )}
        </Card>

        {/* Next Lesson Card */}
        <Card className="p-8 md:col-span-2 border-l-4 border-l-zinc-900">
          <h3 className="font-bold text-zinc-400 mb-6 uppercase text-xs tracking-widest">Upcoming Session</h3>
          {upcomingSessions.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="bg-zinc-100 p-5 rounded text-center min-w-[100px]">
                <div className="text-zinc-900 font-extrabold text-3xl leading-none">
                  {new Date(upcomingSessions[0].startTime).getDate()}
                </div>
                <div className="text-zinc-500 text-sm uppercase font-bold mt-1">
                  {new Date(upcomingSessions[0].startTime).toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>
              <div className="flex-grow">
                <h4 className="text-2xl font-bold text-zinc-900 mb-2">
                  {getClassName(upcomingSessions[0].classTypeId)}
                </h4>
                <div className="flex flex-wrap gap-6 text-zinc-600 text-sm font-medium">
                  <span className="flex items-center"><Clock size={16} className="mr-2 text-zinc-400" />
                    {new Date(upcomingSessions[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center"><MapPin size={16} className="mr-2 text-zinc-400" /> Lane 4, Main Pool</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-200 hover:border-zinc-900">Reschedule</Button>
            </div>
          ) : (
            <div className="text-zinc-400 italic">No upcoming lessons scheduled. Book your next session today.</div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Package History */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900 mb-6 uppercase tracking-wide flex items-center">
            <ShoppingBag size={18} className="mr-2 text-zinc-500" /> Package History
          </h2>
          <Card className="overflow-hidden border-zinc-200">
            <div className="divide-y divide-zinc-100">
              {purchases.map(purchase => (
                <div key={purchase.id} className="p-5 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                  <div>
                    <div className="font-bold text-zinc-900">{purchase.packageName}</div>
                    <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{new Date(purchase.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-zinc-900">${purchase.price}</div>
                    <div className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full inline-block mt-1">
                      +{purchase.credits} Credits
                    </div>
                  </div>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="p-8 text-center text-zinc-500 italic text-sm">No packages purchased yet.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Lesson History */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900 mb-6 uppercase tracking-wide flex items-center">
            <Clock size={18} className="mr-2 text-zinc-500" /> Lesson History
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {pastSessions.slice(0, 5).map(session => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 text-sm text-zinc-600 font-medium">
                      {new Date(session.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900">
                      {getClassName(session.classTypeId)}
                    </td>
                    <td className="px-6 py-4 text-sm"><span className="px-3 py-1 bg-zinc-100 text-zinc-800 rounded-full text-xs font-bold uppercase tracking-wide">Completed</span></td>
                  </tr>
                ))}
                {pastSessions.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-zinc-500 italic text-sm">No history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
