// ================================================================
// LINKEDIN PROFILE OPTIMIZATION
// ================================================================
// HOW TO ENABLE:
// 1. Go to https://www.linkedin.com/developers/apps
// 2. Create new app → Request permissions: r_liteprofile, r_emailaddress
// 3. Add OAuth redirect: http://localhost:4000/api/auth/linkedin/callback
// 4. Set in .env:
//    LINKEDIN_CLIENT_ID=your_client_id
//    LINKEDIN_CLIENT_SECRET=your_client_secret
// ================================================================

import React, { useState } from 'react';
import { Linkedin, CheckCircle, AlertCircle, ArrowRight, ExternalLink, User, Briefcase, Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const LINKEDIN_ENABLED = !!process.env.REACT_APP_LINKEDIN_CLIENT_ID;

// LinkedIn profile tips (rule-based, always available)
const PROFILE_TIPS = [
  {
    section: 'Headline',
    icon: '📝',
    importance: 'Critical',
    color: 'red',
    tips: [
      'Include your current role + target role (e.g., "SDE @ XYZ | Seeking Senior SDE roles")',
      'Add key skills in headline (React | Node.js | System Design)',
      'Avoid generic titles like "Student" — use "CS Student | Aspiring SDE | DSA Enthusiast"',
    ],
    example: 'Software Engineer @ Company | React | Node.js | Open to SDE-2 roles',
  },
  {
    section: 'About / Summary',
    icon: '💼',
    importance: 'High',
    color: 'orange',
    tips: [
      'First 2 lines must be impactful — they show without "See more"',
      'Include: your expertise + what you build + what you\'re looking for',
      'Add measurable achievements (Built X that improved Y by Z%)',
      'End with a call-to-action',
    ],
    example: 'Full-stack developer with 3+ years building scalable web apps serving 100K+ users. Passionate about clean code, system design, and developer experience. Open to senior SDE roles at product companies.',
  },
  {
    section: 'Experience',
    icon: '🏢',
    importance: 'Critical',
    color: 'red',
    tips: [
      'Use bullet points with ACTION + IMPACT format',
      'Quantify everything: users, revenue, performance, time saved',
      'Start each bullet with a strong verb (Built, Led, Reduced, Improved)',
      'Include tech stack in each role description',
    ],
    example: '• Reduced API response time by 60% by implementing Redis caching, serving 50K+ daily requests',
  },
  {
    section: 'Skills Section',
    icon: '⚡',
    importance: 'High',
    color: 'orange',
    tips: [
      'Add top 5 skills to pin at top of skills section',
      'Get endorsements from colleagues for key skills',
      'Include both technical (React, AWS) and soft skills (Leadership)',
      'LinkedIn uses skills for search ranking — add all relevant ones',
    ],
  },
  {
    section: 'Education',
    icon: '🎓',
    importance: 'Medium',
    color: 'yellow',
    tips: [
      'Add relevant coursework and activities',
      'Include GPA if it\'s 7.5+/10 or 3.5+/4',
      'List hackathons, competitions, and relevant projects',
    ],
  },
  {
    section: 'Projects & Featured',
    icon: '🚀',
    importance: 'High',
    color: 'orange',
    tips: [
      'Pin 2-3 best projects in Featured section',
      'Link to GitHub repos or live demos',
      'Describe impact and tech stack used',
      'Include screenshots or demo videos',
    ],
  },
  {
    section: 'Open to Work',
    icon: '🟢',
    importance: 'Medium',
    color: 'yellow',
    tips: [
      'Enable "Open to Work" frame if actively looking',
      'Set job preferences precisely (role, location, type)',
      'Recruiters filter by these preferences',
    ],
  },
  {
    section: 'Network & Activity',
    icon: '🌐',
    importance: 'Medium',
    color: 'yellow',
    tips: [
      '500+ connections significantly boosts profile visibility',
      'Post at least 1-2 technical articles per month',
      'Comment on industry posts for visibility',
      'Share your projects and learning journey',
    ],
  },
];

const ImportanceTag = ({ level, color }) => {
  const colors = {
    red: 'bg-red-900/30 text-red-400 border-red-700/30',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-700/30',
    yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${colors[color]}`}>
      {level}
    </span>
  );
};

// Manual profile analyzer (no API needed)
const analyzeManualProfile = (data) => {
  let score = 0;
  const issues = [];
  const strengths = [];

  if (data.headline?.length > 50) { score += 20; strengths.push('Strong headline length'); }
  else { issues.push('Headline too short — add role + skills'); }

  if (data.summary?.length > 200) { score += 15; strengths.push('Detailed About section'); }
  else { issues.push('About section needs more detail (200+ words)'); }

  if (data.experience > 0) { score += 20; strengths.push('Has work experience'); }
  else { issues.push('Add internships or projects as experience'); }

  if (data.skills >= 10) { score += 15; strengths.push('Good number of skills listed'); }
  else { issues.push(`Add more skills (currently ${data.skills}, target 15+)`); }

  if (data.connections >= 500) { score += 10; strengths.push('500+ connections'); }
  else { score += 5; issues.push(`Grow your network (currently ~${data.connections}, target 500+)`); }

  if (data.hasPhoto) { score += 10; strengths.push('Profile photo present'); }
  else { issues.push('Add a professional profile photo'); }

  if (data.hasProjects) { score += 10; strengths.push('Projects section present'); }
  else { issues.push('Add projects to showcase your work'); }

  return { score, issues, strengths };
};

export default function LinkedInPage() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState(null);
  const [manualData, setManualData] = useState({
    headline: '', summary: '', experience: 1, skills: 5, connections: 100, hasPhoto: true, hasProjects: false,
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const handleAnalyze = () => {
    const result = analyzeManualProfile(manualData);
    setAnalysisResult(result);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Linkedin className="w-6 h-6 text-blue-400" /> LinkedIn Optimization
          </h1>
          <p className="text-indigo-300 text-sm mt-1">Optimize your LinkedIn profile to attract recruiters</p>
        </div>

      </div>

      {/* Quick Score Analyzer */}
      <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /> Quick Profile Score
          </h2>
          <button onClick={() => setShowAnalyzer(!showAnalyzer)}
            className="text-indigo-400 hover:text-white text-sm transition-colors">
            {showAnalyzer ? 'Hide' : 'Analyze Profile'}
          </button>
        </div>

        {showAnalyzer && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-indigo-200 text-sm">Headline length (chars)</label>
                <input type="number" value={manualData.headline} onChange={e => setManualData(p => ({ ...p, headline: e.target.value }))}
                  placeholder="e.g., 80" className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-indigo-200 text-sm">About section length (chars)</label>
                <input type="number" value={manualData.summary} onChange={e => setManualData(p => ({ ...p, summary: e.target.value }))}
                  placeholder="e.g., 500" className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-indigo-200 text-sm">Number of skills listed</label>
                <input type="number" value={manualData.skills} onChange={e => setManualData(p => ({ ...p, skills: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-indigo-200 text-sm">Approx connections</label>
                <input type="number" value={manualData.connections} onChange={e => setManualData(p => ({ ...p, connections: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              {[['hasPhoto', 'Has profile photo?'], ['hasProjects', 'Has projects section?']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={manualData[key]} onChange={e => setManualData(p => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-indigo-500" />
                  <span className="text-indigo-200 text-sm">{label}</span>
                </label>
              ))}
            </div>
            <button onClick={handleAnalyze} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">
              Calculate Score
            </button>

            {analysisResult && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-indigo-900/20 border border-indigo-700/30 rounded-xl">
                  <div className={`text-5xl font-bold ${analysisResult.score >= 80 ? 'text-green-400' : analysisResult.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {analysisResult.score}
                  </div>
                  <div>
                    <p className="text-white font-semibold">Profile Score</p>
                    <p className="text-indigo-400 text-sm">
                      {analysisResult.score >= 80 ? 'Excellent — recruiter ready!' : analysisResult.score >= 60 ? 'Good — few improvements needed' : 'Needs work — follow tips below'}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-green-400 text-xs font-medium mb-2">✓ Strengths</p>
                    {analysisResult.strengths.map((s, i) => <p key={i} className="text-green-300 text-sm mb-1">• {s}</p>)}
                  </div>
                  <div>
                    <p className="text-yellow-400 text-xs font-medium mb-2">→ Improvements</p>
                    {analysisResult.issues.map((s, i) => <p key={i} className="text-yellow-300 text-sm mb-1">• {s}</p>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips by Section */}
      <div className="space-y-3">
        <h2 className="text-white font-semibold">Section-by-Section Tips</h2>
        {PROFILE_TIPS.map((section) => (
          <div key={section.section} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl overflow-hidden">
            <button
              onClick={() => setActiveSection(activeSection === section.section ? null : section.section)}
              className="w-full flex items-center gap-4 p-5 hover:bg-indigo-900/10 transition-all text-left">
              <span className="text-2xl">{section.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold">{section.section}</p>
                  <ImportanceTag level={section.importance} color={section.color} />
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 text-indigo-400 transition-transform ${activeSection === section.section ? 'rotate-90' : ''}`} />
            </button>

            {activeSection === section.section && (
              <div className="px-5 pb-5 space-y-4 border-t border-indigo-900/40">
                <div className="space-y-2 pt-4">
                  {section.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 px-4 py-2.5 bg-indigo-900/20 border border-indigo-800/30 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <p className="text-indigo-200 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
                {section.example && (
                  <div className="bg-green-900/10 border border-green-700/30 rounded-xl p-4">
                    <p className="text-green-400 text-xs font-medium mb-2">✨ Example</p>
                    <p className="text-green-200 text-sm italic">"{section.example}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* External Resources */}
      <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-3">📚 Useful Resources</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: 'LinkedIn Profile Checklist', url: 'https://www.linkedin.com/help/linkedin/answer/a554351', desc: 'Official LinkedIn guide' },
            { label: 'Resume Worded (Free)', url: 'https://resumeworded.com/linkedin-review', desc: 'AI LinkedIn profile review' },
            { label: 'LinkedIn Learning', url: 'https://www.linkedin.com/learning', desc: 'Free courses for skill badges' },
            { label: 'GitHub Profile README', url: 'https://github.com/abhisheknaiidu/awesome-github-profile-readme', desc: 'Stand out with a great README' },
          ].map(r => (
            <a key={r.label} href={r.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-indigo-900/20 border border-indigo-800/30 rounded-xl hover:border-indigo-700/50 transition-all">
              <ExternalLink className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">{r.label}</p>
                <p className="text-indigo-400 text-xs">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}




// import React from 'react';
// import { Linkedin, TrendingUp, Users, Award, ExternalLink } from 'lucide-react';

// export default function LinkedInPage() {
//   return (
//     <div className="p-6 max-w-3xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-white flex items-center gap-2">
//           <Linkedin className="w-6 h-6 text-blue-400" /> LinkedIn Score Analyzer
//         </h1>
//         <p className="text-indigo-300 text-sm mt-1">Optimize your LinkedIn profile for maximum visibility</p>
//       </div>

//       <div className="grid md:grid-cols-3 gap-4">
//         {[
//           { icon: TrendingUp, label: 'Profile Strength', value: 'All-Star', color: 'text-green-400' },
//           { icon: Users, label: 'Network Size', value: '500+', color: 'text-blue-400' },
//           { icon: Award, label: 'Profile Views', value: '120/week', color: 'text-purple-400' },
//         ].map(({ icon: Icon, label, value, color }) => (
//           <div key={label} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
//             <Icon className={`w-6 h-6 ${color} mb-3`} />
//             <p className={`text-2xl font-bold ${color}`}>{value}</p>
//             <p className="text-indigo-300 text-sm mt-1">{label}</p>
//           </div>
//         ))}
//       </div>

//       <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6 space-y-4">
//         <h2 className="text-white font-semibold">LinkedIn Optimization Tips</h2>
//         {[
//           { tip: 'Use a professional headshot — profiles with photos get 21x more views', done: true },
//           { tip: 'Write a compelling headline beyond just your job title', done: true },
//           { tip: 'Add at least 5 relevant skills to appear in recruiter searches', done: false },
//           { tip: 'Get at least 3 recommendations from colleagues or managers', done: false },
//           { tip: 'Post content weekly to increase profile visibility by 10x', done: false },
//           { tip: 'Connect with 50+ people in your target industry', done: true },
//           { tip: 'Complete your About section with keywords recruiters search for', done: false },
//         ].map(({ tip, done }, i) => (
//           <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${done ? 'bg-green-900/10 border-green-700/30' : 'bg-indigo-900/10 border-indigo-800/30'}`}>
//             <span className={`text-lg flex-shrink-0`}>{done ? '✅' : '⭕'}</span>
//             <p className={`text-sm ${done ? 'text-green-200' : 'text-indigo-200'}`}>{tip}</p>
//           </div>
//         ))}
//       </div>

//       <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
//         <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
//         <div className="space-y-3">
//           {[
//             { label: 'Open LinkedIn Profile', url: 'https://linkedin.com' },
//             { label: 'LinkedIn Skill Assessment', url: 'https://www.linkedin.com/skill-assessments' },
//             { label: 'LinkedIn Learning', url: 'https://www.linkedin.com/learning' },
//           ].map(({ label, url }) => (
//             <a key={label} href={url} target="_blank" rel="noreferrer"
//               className="flex items-center justify-between p-3 bg-indigo-900/20 border border-indigo-800/30 rounded-xl hover:border-indigo-600/50 transition-all group">
//               <span className="text-indigo-200 text-sm">{label}</span>
//               <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
//             </a>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
