import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, feedbackAPI, jobAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Brain, Target, TrendingUp, BookOpen, Mic, Code2, ArrowRight, Calendar, CheckCircle, Clock, Star, Zap, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEARNING_PATHS = {
  'Software Engineer': {
    weeks: [
      { week: 1, title: 'DSA Fundamentals', topics: ['Arrays & Strings', 'HashMaps', 'Two Pointers'], resources: ['LeetCode Easy 10 problems'] },
      { week: 2, title: 'Advanced DSA', topics: ['Trees & Graphs', 'Dynamic Programming', 'Recursion'], resources: ['LeetCode Medium 10 problems'] },
      { week: 3, title: 'System Design Basics', topics: ['Load Balancers', 'Databases', 'Caching'], resources: ['Grokking System Design'] },
      { week: 4, title: 'Mock Interviews', topics: ['Behavioral (STAR)', 'Technical Mock x5', 'System Design Mock x2'], resources: ['Platform mock interviews'] },
    ],
  },
  'Product Manager': {
    weeks: [
      { week: 1, title: 'Product Sense', topics: ['Product Teardowns', 'User Empathy', 'Metrics'], resources: ['Decode & Conquer book'] },
      { week: 2, title: 'Analytical Skills', topics: ['A/B Testing', 'Data Analysis', 'KPIs'], resources: ['SQL practice', 'Case studies'] },
      { week: 3, title: 'Strategy', topics: ['Prioritization', 'Roadmapping', 'Go-to-Market'], resources: ['Inspired book'] },
      { week: 4, title: 'Mock Interviews', topics: ['Product Design x5', 'Analytical x3', 'Behavioral x3'], resources: ['Platform mock interviews'] },
    ],
  },
  'Data Analyst': {
    weeks: [
      { week: 1, title: 'SQL Mastery', topics: ['Joins', 'Window Functions', 'CTEs', 'Subqueries'], resources: ['Mode SQL tutorial', 'HackerRank SQL'] },
      { week: 2, title: 'Statistics & Python', topics: ['Descriptive Stats', 'Hypothesis Testing', 'Pandas/NumPy'], resources: ['Kaggle Learn'] },
      { week: 3, title: 'Data Visualization', topics: ['Tableau/Power BI', 'Storytelling with data', 'Dashboards'], resources: ['Storytelling with Data book'] },
      { week: 4, title: 'Mock Interviews', topics: ['SQL Mock x5', 'Case Study x3', 'Behavioral x3'], resources: ['Platform mock interviews'] },
    ],
  },
};

const DEFAULT_PATH = {
  weeks: [
    { week: 1, title: 'Foundation', topics: ['Resume Polish', 'LinkedIn Optimization', 'Target Company Research'], resources: ['Resume Builder on platform'] },
    { week: 2, title: 'Technical Practice', topics: ['DSA Basics', 'Coding Problems', 'Language Fundamentals'], resources: ['DSA section on platform'] },
    { week: 3, title: 'Interview Skills', topics: ['Behavioral Stories', 'STAR Method', 'Communication'], resources: ['Question Bank on platform'] },
    { week: 4, title: 'Mock Interviews', topics: ['Full Mock x5', 'Record & Review', 'Feedback Analysis'], resources: ['Mock Interview section'] },
  ],
};

const DAILY_PLAN = [
  { time: '7:00 AM', task: 'Solve 1 DSA problem', duration: '30 min', icon: Code2, color: 'bg-purple-600' },
  { time: '8:00 AM', task: 'Review yesterday\'s feedback', duration: '15 min', icon: TrendingUp, color: 'bg-blue-600' },
  { time: '12:00 PM', task: 'Read 1 technical concept', duration: '20 min', icon: BookOpen, color: 'bg-indigo-600' },
  { time: '7:00 PM', task: 'Mock interview (3 questions)', duration: '30 min', icon: Mic, color: 'bg-green-600' },
  { time: '9:00 PM', task: 'Review question bank', duration: '15 min', icon: Star, color: 'bg-yellow-600' },
];

export default function CoachPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWeek, setSelectedWeek] = useState(1);

  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsAPI.getDashboard().then(r => r.data),
  });

  const { data: trends } = useQuery({
    queryKey: ['feedback-trends'],
    queryFn: () => feedbackAPI.getTrends(30).then(r => r.data),
  });

  const targetRole = user?.target_role || 'Software Engineer';
  const learningPath = LEARNING_PATHS[targetRole] || DEFAULT_PATH;

  // Calculate weak areas from data
  const avgScore = parseFloat(dash?.overview?.avg_score || 0);
  const totalInterviews = parseInt(dash?.overview?.total_interviews || 0);
  const totalProblems = parseInt(dash?.overview?.total_problems || 0);

  const weakAreas = [];
  if (avgScore < 60 || totalInterviews === 0) weakAreas.push({ area: 'Mock Interview Practice', priority: 'High', action: 'Start Interview', to: '/interview', icon: Mic });
  if (totalProblems < 15) weakAreas.push({ area: 'DSA Problem Solving', priority: 'High', action: 'Solve Problems', to: '/dsa', icon: Code2 });
  if (totalInterviews < 5) weakAreas.push({ area: 'Interview Consistency', priority: 'Medium', action: 'Build Habit', to: '/interview', icon: Calendar });

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'path', label: 'Learning Path' },
    { id: 'daily', label: 'Daily Plan' },
    { id: 'company', label: 'Company Tracks' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Brain className="w-6 h-6 text-indigo-400" /> AI Coach</h1>
        <p className="text-indigo-300 text-sm mt-1">Personalized guidance for {targetRole}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Welcome */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/20 border border-indigo-700/40 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-2">Hey {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              You've completed <strong className="text-white">{totalInterviews} mock interviews</strong> and solved <strong className="text-white">{totalProblems} DSA problems</strong>.
              {avgScore > 0 && <> Your avg interview score is <strong className={`${avgScore >= 70 ? 'text-green-400' : avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{avgScore}%</strong>.</>}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Mock Interviews', val: totalInterviews, target: 20, color: 'indigo' },
              { label: 'Problems Solved', val: totalProblems, target: 50, color: 'purple' },
              { label: 'Avg Score', val: `${avgScore}%`, target: '80%', color: avgScore >= 70 ? 'green' : avgScore >= 50 ? 'yellow' : 'red' },
            ].map(s => (
              <div key={s.label} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-4 text-center">
                <p className={`text-2xl font-bold text-${s.color}-400`}>{s.val}</p>
                <p className="text-indigo-400 text-xs mt-0.5">{s.label}</p>
                <p className="text-indigo-600 text-xs">Target: {s.target}</p>
              </div>
            ))}
          </div>

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <div>
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-red-400" /> Focus Areas</h2>
              <div className="space-y-3">
                {weakAreas.map((w, i) => (
                  <div key={i} className="bg-[#0f0e2a]/80 border border-red-900/30 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <w.icon className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">{w.area}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-lg border ${w.priority === 'High' ? 'bg-red-900/30 border-red-700/30 text-red-400' : 'bg-yellow-900/30 border-yellow-700/30 text-yellow-400'}`}>{w.priority}</span>
                      </div>
                    </div>
                    <button onClick={() => navigate(w.to)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0">
                      {w.action}<ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Today's Practice</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: Mic, label: 'Mock Interview', desc: 'AI-powered practice', color: 'bg-indigo-600', to: '/interview' },
                { icon: Code2, label: 'DSA Problem', desc: 'Solve 1 problem', color: 'bg-purple-600', to: '/dsa' },
                { icon: BookOpen, label: 'Question Bank', desc: 'HR & Technical', color: 'bg-blue-600', to: '/practice' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.to)}
                  className={`${a.color} rounded-2xl p-4 text-left text-white hover:opacity-90 transition-all hover:scale-[1.02]`}>
                  <a.icon className="w-5 h-5 mb-2 opacity-90" />
                  <p className="font-semibold text-sm">{a.label}</p>
                  <p className="text-white/70 text-xs mt-0.5">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learning Path Tab */}
      {activeTab === 'path' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Map className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-white font-semibold">4-Week Learning Path</p>
              <p className="text-indigo-400 text-sm">Customized for {targetRole}</p>
            </div>
          </div>

          {/* Week selector */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(w => (
              <button key={w} onClick={() => setSelectedWeek(w)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${selectedWeek === w ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-300 hover:border-indigo-600'}`}>
                Week {w}
              </button>
            ))}
          </div>

          {/* Selected week details */}
          {learningPath.weeks.filter(w => w.week === selectedWeek).map(week => (
            <div key={week.week} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-white font-bold text-lg">Week {week.week}: {week.title}</h3>
              </div>

              <div>
                <p className="text-indigo-400 text-xs font-medium uppercase tracking-wide mb-3">Topics to Cover</p>
                <div className="space-y-2">
                  {week.topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-indigo-900/20 border border-indigo-800/30 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <p className="text-white text-sm">{topic}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-indigo-400 text-xs font-medium uppercase tracking-wide mb-3">Resources</p>
                {week.resources.map((res, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-green-900/10 border border-green-700/20 rounded-xl mb-2">
                    <BookOpen className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-green-300 text-sm">{res}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/interview')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all">
                Start Week {week.week} Practice <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Progress bar */}
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
            <p className="text-white font-medium mb-4 text-sm">Overall Path Progress</p>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(w => {
                const weekData = learningPath.weeks.find(wk => wk.week === w);
                const done = w < selectedWeek;
                const current = w === selectedWeek;
                return (
                  <div key={w} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-green-600 text-white' : current ? 'bg-indigo-600 text-white' : 'bg-indigo-900/40 border border-indigo-700/40 text-indigo-400'}`}>
                      {done ? '✓' : w}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${done ? 'text-green-400' : current ? 'text-white' : 'text-indigo-400'}`}>
                        Week {w}: {weekData?.title}
                      </p>
                    </div>
                    {current && <span className="text-xs bg-indigo-600/20 border border-indigo-600/40 text-indigo-300 px-2 py-0.5 rounded-lg">Current</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Daily Plan Tab */}
      {activeTab === 'daily' && (
        <div className="space-y-5">
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400" /> Today's Schedule</h2>
            <p className="text-indigo-400 text-sm mb-5">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

            <div className="space-y-3">
              {DAILY_PLAN.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-indigo-900/20 border border-indigo-800/30 rounded-xl hover:border-indigo-700/50 transition-all">
                  <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.task}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-indigo-400 text-xs">{item.time}</span>
                      <span className="text-indigo-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-indigo-900/40">
              <p className="text-indigo-300 text-sm font-medium mb-2">⏱ Total daily commitment: ~1.5 hours</p>
              <p className="text-indigo-500 text-xs">Consistent daily practice is more effective than long irregular sessions.</p>
            </div>
          </div>

          {/* Weekly overview */}
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">📅 Weekly Schedule</h3>
            <div className="space-y-2">
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day, i) => {
                const plans = [
                  'Mock Interview + DSA (Medium)',
                  'DSA Practice (2 problems) + Question Bank',
                  'Mock Interview + System Design reading',
                  'DSA Practice + Behavioral questions',
                  'Full Mock Interview + Review feedback',
                  'DSA Sprint (3 problems) + Resume polish',
                  'Rest + Light review only',
                ];
                const colors = ['bg-indigo-600','bg-purple-600','bg-blue-600','bg-indigo-600','bg-green-600','bg-yellow-600','bg-gray-600'];
                return (
                  <div key={day} className="flex items-center gap-4">
                    <span className="text-indigo-400 text-sm w-24 flex-shrink-0 font-medium">{day}</span>
                    <div className={`flex-1 ${colors[i]} rounded-xl px-4 py-2 text-white text-xs font-medium`}>
                      {plans[i]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Company Tracks Tab */}
      {activeTab === 'company' && (
        <div className="space-y-4">
          <p className="text-indigo-300 text-sm">Preparation tracks for top companies</p>
          {['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Meta', 'Apple'].map(company => (
            <div key={company} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5 hover:border-indigo-700/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-700/30 rounded-xl flex items-center justify-center text-white font-bold text-sm">{company[0]}</div>
                  <p className="text-white font-semibold">{company}</p>
                </div>
                <button onClick={() => navigate('/interview', { state: { company } })}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-xl transition-all">
                  Practice <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Focus', items: ['DSA', 'System Design', 'Behavioral'].slice(0, company === 'Amazon' ? 3 : 2) },
                  { label: 'Rounds', items: ['Technical x3', company === 'Google' ? 'Googliness' : company === 'Amazon' ? 'Bar Raiser' : 'System Design'] },
                ].map(col => (
                  <div key={col.label}>
                    <p className="text-indigo-400 font-medium mb-1">{col.label}</p>
                    {col.items.map((item, i) => <p key={i} className="text-indigo-200">• {item}</p>)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
