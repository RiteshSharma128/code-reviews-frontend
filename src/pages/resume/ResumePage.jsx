import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeAPI, aiResumeAPI } from '../../services/api';
import { FileText, Save, Zap, Plus, Trash2, CheckCircle, Brain, Link, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const emptyResume = { name: '', email: '', phone: '', summary: '', skills: [], experience: [], education: [], projects: [] };

function TagInput({ label, values = [], onChange }) {
  const [input, setInput] = useState('');
  const add = () => { if (!input.trim()) return; onChange([...values, input.trim()]); setInput(''); };
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-indigo-200">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1 bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 text-xs px-2.5 py-1 rounded-lg">
            {v}
            <button onClick={() => remove(i)} className="ml-1 text-indigo-400 hover:text-red-400 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="flex-1 bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-3 py-2 text-white placeholder-indigo-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button onClick={add} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, placeholder = '', type = 'text' }) {
  const cls = "w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-indigo-200">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls + ' resize-none'} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </div>
  );
}

const TABS = [
  { id: 'builder', label: '📝 Builder', icon: FileText },
  { id: 'ats', label: '✅ ATS Check', icon: CheckCircle },
  { id: 'ai', label: '🤖 AI Analysis', icon: Brain },
  { id: 'jd', label: '🎯 JD Match', icon: Link },
  { id: 'cover', label: '📄 Cover Letter', icon: TrendingUp },
];

const SECTIONS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'summary', label: 'Summary' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
];

export default function ResumePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [resume, setResume] = useState(emptyResume);
  const [atsResult, setAtsResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdResult, setJdResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverForm, setCoverForm] = useState({ jobTitle: '', company: '', jobDescription: '' });
  const [checking, setChecking] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [jdChecking, setJdChecking] = useState(false);
  const [coverGenerating, setCoverGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [activeTab, setActiveTab] = useState('builder');

  useQuery({
    queryKey: ['resume'],
    queryFn: () => resumeAPI.getResume().then(r => r.data.resume),
    onSuccess: r => { if (r) setResume(r); },
  });

  const { mutate: save, isLoading: saving } = useMutation({
    mutationFn: () => resumeAPI.saveResume(resume),
    onSuccess: (res) => {
      toast.success('Resume saved!');
      setAtsResult({ score: res.data.atsScore, feedback: res.data.atsFeedback, grade: res.data.grade });
      qc.invalidateQueries(['resume']);
    },
    onError: () => toast.error('Failed to save resume'),
  });

  const handleAtsCheck = async () => {
    setChecking(true);
    try {
      const res = await resumeAPI.checkAts(resume);
      setAtsResult(res.data);
      toast.success(`ATS Score: ${res.data.score}%`);
    } catch { toast.error('ATS check failed'); }
    finally { setChecking(false); }
  };

  const handleAiAnalysis = async () => {
    setAiAnalyzing(true);
    try {
      // First save, then analyze
      await resumeAPI.saveResume(resume);
      const res = await aiResumeAPI.analyze();
      setAiAnalysis(res.data.analysis);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed');
    } finally { setAiAnalyzing(false); }
  };

  const handleJdMatch = async () => {
    if (!jdText.trim()) { toast.error('Paste a job description first'); return; }
    setJdChecking(true);
    try {
      const res = await aiResumeAPI.matchJD(jdText);
      setJdResult(res.data);
    } catch { toast.error('JD matching failed'); }
    finally { setJdChecking(false); }
  };

  const handleGenerateCover = async () => {
    if (!coverForm.jobTitle || !coverForm.company) { toast.error('Enter job title and company name'); return; }
    setCoverGenerating(true);
    try {
      const res = await resumeAPI.generateCoverLetter(coverForm);
      setCoverLetter(res.data.coverLetter);
    } catch { toast.error('Cover letter generation failed'); }
    finally { setCoverGenerating(false); }
  };

  const setStr = f => v => setResume(p => ({ ...p, [f]: v }));
  const addExp = () => setResume(p => ({ ...p, experience: [...p.experience, { title: '', company: '', duration: '', description: '' }] }));
  const setExp = (i, f, v) => setResume(p => ({ ...p, experience: p.experience.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const removeExp = i => setResume(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));
  const addEdu = () => setResume(p => ({ ...p, education: [...p.education, { degree: '', institution: '', year: '' }] }));
  const setEdu = (i, f, v) => setResume(p => ({ ...p, education: p.education.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const addProj = () => setResume(p => ({ ...p, projects: [...p.projects, { name: '', description: '', tech: [], url: '' }] }));
  const setProj = (i, f, v) => setResume(p => ({ ...p, projects: p.projects.map((pr, idx) => idx === i ? { ...pr, [f]: v } : pr) }));

  const scoreColor = (s) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = (s) => s >= 80 ? 'bg-green-900/10 border-green-700/30' : s >= 60 ? 'bg-yellow-900/10 border-yellow-700/30' : 'bg-red-900/10 border-red-700/30';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" /> Resume Tools
          </h1>
          <p className="text-indigo-300 text-sm mt-1">Build, optimize, and match your resume</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAtsCheck} disabled={checking}
            className="flex items-center gap-2 bg-yellow-600/20 border border-yellow-700/40 text-yellow-400 px-4 py-2 rounded-xl text-sm hover:bg-yellow-600/30 transition-all disabled:opacity-50">
            {checking ? <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
            ATS Check
          </button>
          <button onClick={() => save()} disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
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

      {/* ── BUILDER TAB ── */}
      {activeTab === 'builder' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Section Nav */}
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-3 h-fit">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === s.id ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-indigo-900/40 hover:text-white'}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6 space-y-5">
            {activeSection === 'basic' && (
              <>
                <Field label="Full Name" value={resume.name || ''} onChange={setStr('name')} placeholder="John Doe" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email" value={resume.email || ''} onChange={setStr('email')} placeholder="john@email.com" type="email" />
                  <Field label="Phone" value={resume.phone || ''} onChange={setStr('phone')} placeholder="+91 9999999999" />
                </div>
              </>
            )}
            {activeSection === 'summary' && (
              <Field label="Professional Summary" value={resume.summary || ''} onChange={setStr('summary')} multiline
                placeholder="Write a concise professional summary (3-5 sentences)..." />
            )}
            {activeSection === 'skills' && (
              <TagInput label="Skills" values={resume.skills || []} onChange={v => setResume(p => ({ ...p, skills: v }))} />
            )}
            {activeSection === 'experience' && (
              <div className="space-y-4">
                {(resume.experience || []).map((exp, i) => (
                  <div key={i} className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium">Experience {i + 1}</p>
                      <button onClick={() => removeExp(i)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Job Title" value={exp.title} onChange={v => setExp(i, 'title', v)} placeholder="Software Engineer" />
                      <Field label="Company" value={exp.company} onChange={v => setExp(i, 'company', v)} placeholder="Google" />
                    </div>
                    <Field label="Duration" value={exp.duration} onChange={v => setExp(i, 'duration', v)} placeholder="Jan 2022 - Present" />
                    <Field label="Description" value={exp.description} onChange={v => setExp(i, 'description', v)} multiline
                      placeholder="• Reduced API response time by 60% via Redis caching&#10;• Led team of 4 to ship feature used by 100K+ users" />
                  </div>
                ))}
                <button onClick={addExp}
                  className="flex items-center gap-2 bg-indigo-900/30 border border-indigo-700/40 border-dashed text-indigo-300 px-4 py-3 rounded-xl text-sm hover:border-indigo-500 transition-all w-full justify-center">
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
            )}
            {activeSection === 'education' && (
              <div className="space-y-4">
                {(resume.education || []).map((edu, i) => (
                  <div key={i} className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Degree" value={edu.degree} onChange={v => setEdu(i, 'degree', v)} placeholder="B.Tech Computer Science" />
                      <Field label="Institution" value={edu.institution} onChange={v => setEdu(i, 'institution', v)} placeholder="IIT Delhi" />
                    </div>
                    <Field label="Year" value={edu.year} onChange={v => setEdu(i, 'year', v)} placeholder="2020 - 2024" />
                  </div>
                ))}
                <button onClick={addEdu}
                  className="flex items-center gap-2 bg-indigo-900/30 border border-indigo-700/40 border-dashed text-indigo-300 px-4 py-3 rounded-xl text-sm hover:border-indigo-500 transition-all w-full justify-center">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
            )}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                {(resume.projects || []).map((proj, i) => (
                  <div key={i} className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Project Name" value={proj.name} onChange={v => setProj(i, 'name', v)} placeholder="E-commerce Platform" />
                      <Field label="URL" value={proj.url} onChange={v => setProj(i, 'url', v)} placeholder="https://github.com/..." />
                    </div>
                    <Field label="Description" value={proj.description} onChange={v => setProj(i, 'description', v)} multiline
                      placeholder="What did you build, what impact did it have?" />
                    <TagInput label="Technologies" values={proj.tech || []} onChange={v => setProj(i, 'tech', v)} />
                  </div>
                ))}
                <button onClick={addProj}
                  className="flex items-center gap-2 bg-indigo-900/30 border border-indigo-700/40 border-dashed text-indigo-300 px-4 py-3 rounded-xl text-sm hover:border-indigo-500 transition-all w-full justify-center">
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ATS CHECK TAB ── */}
      {activeTab === 'ats' && (
        <div className="space-y-5">
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2">ATS (Applicant Tracking System) Score</h2>
            <p className="text-indigo-300 text-sm mb-4">Check how well your resume passes automated screening systems used by companies.</p>
            <button onClick={handleAtsCheck} disabled={checking}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
              {checking ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
              Run ATS Check
            </button>
          </div>
          {atsResult && (
            <div className={`border rounded-2xl p-6 ${scoreBg(atsResult.score)}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-indigo-300 text-sm">ATS Score</p>
                  <p className={`text-5xl font-bold mt-1 ${scoreColor(atsResult.score)}`}>{atsResult.score}%</p>
                </div>
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-2xl font-bold ${scoreBg(atsResult.score)} ${scoreColor(atsResult.score)}`}>
                  {atsResult.grade || (atsResult.score >= 80 ? 'A' : atsResult.score >= 60 ? 'B' : 'C')}
                </div>
              </div>
              {atsResult.feedback?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-indigo-300 text-xs font-medium uppercase">Improvements Needed</p>
                  {atsResult.feedback.map((f, i) => (
                    <p key={i} className="text-yellow-300 text-sm flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">→</span>{f}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* ATS Tips */}
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3">💡 ATS Optimization Tips</h3>
            <div className="space-y-2">
              {[
                'Use standard section headings: Experience, Education, Skills',
                'Avoid tables, images, headers/footers — ATS can\'t parse them',
                'Include keywords from the job description verbatim',
                'Use standard fonts: Arial, Calibri, Times New Roman',
                'Save as .docx or .pdf — never .jpg or .png',
                'Spell out acronyms at least once (e.g., "ML (Machine Learning)")',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 bg-indigo-900/20 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-indigo-200 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI ANALYSIS TAB ── */}
      {activeTab === 'ai' && (
        <div className="space-y-5">
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" /> AI Resume Strength Analysis
            </h2>
            <p className="text-indigo-300 text-sm mb-2">
              Comprehensive AI-powered analysis of your resume.
            </p>
          
            <button onClick={handleAiAnalysis} disabled={aiAnalyzing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
              {aiAnalyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Brain className="w-4 h-4" />}
              {aiAnalyzing ? 'Analyzing...' : 'Analyze My Resume'}
            </button>
          </div>

          {aiAnalysis && (
            <div className="space-y-4">
              {/* Score */}
              <div className={`border rounded-2xl p-6 ${scoreBg(aiAnalysis.overallScore)}`}>
                <div className="flex items-center gap-5">
                  <div>
                    <p className={`text-6xl font-bold ${scoreColor(aiAnalysis.overallScore)}`}>{aiAnalysis.overallScore}</p>
                    <p className="text-indigo-300 text-sm mt-1">Overall Score</p>
                  </div>
                  <div className="flex-1">
                    <p className={`text-xl font-bold ${scoreColor(aiAnalysis.overallScore)}`}>Grade: {aiAnalysis.grade}</p>
                    <p className="text-indigo-200 text-sm mt-2 leading-relaxed">{aiAnalysis.summary}</p>
                    {aiAnalysis.provider && (
                      <p className="text-indigo-500 text-xs mt-2">
                        Analysis by: {aiAnalysis.provider === 'rule-based' ? '⚙️ Rule-based (set API key for AI)' : `🤖 ${aiAnalysis.provider}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Scores */}
              {aiAnalysis.sectionScores && (
                <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-4">Section Scores</h3>
                  <div className="space-y-3">
                    {Object.entries(aiAnalysis.sectionScores).map(([section, score]) => (
                      <div key={section}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-indigo-300 capitalize">{section}</span>
                          <span className={`font-medium ${scoreColor(score)}`}>{score}%</span>
                        </div>
                        <div className="h-2 bg-indigo-900/50 rounded-full">
                          <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#0f0e2a]/80 border border-green-900/40 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Strengths
                  </h3>
                  {aiAnalysis.strengths?.map((s, i) => (
                    <p key={i} className="text-green-300 text-sm mb-2 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>{s}
                    </p>
                  ))}
                </div>
                <div className="bg-[#0f0e2a]/80 border border-yellow-900/40 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3">⚠️ Weaknesses</h3>
                  {aiAnalysis.weaknesses?.map((w, i) => (
                    <p key={i} className="text-yellow-300 text-sm mb-2 flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">→</span>{w}
                    </p>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              {aiAnalysis.actionableImprovements?.length > 0 && (
                <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3">🎯 Action Items</h3>
                  <div className="space-y-2">
                    {aiAnalysis.actionableImprovements.map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${item.priority === 'high' ? 'bg-red-900/10 border-red-700/30 text-red-200' : item.priority === 'medium' ? 'bg-yellow-900/10 border-yellow-700/30 text-yellow-200' : 'bg-indigo-900/20 border-indigo-700/30 text-indigo-200'}`}>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 mt-0.5 ${item.priority === 'high' ? 'bg-red-900/40 text-red-400' : item.priority === 'medium' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-indigo-900/40 text-indigo-400'}`}>
                          {item.priority}
                        </span>
                        <span>{item.suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {aiAnalysis.missingKeywords?.length > 0 && (
                <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3">🔑 Consider Adding These Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.missingKeywords.map(kw => (
                      <span key={kw} className="text-xs bg-indigo-900/40 border border-indigo-700/40 text-indigo-300 px-3 py-1.5 rounded-xl">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── JD MATCH TAB ── */}
      {activeTab === 'jd' && (
        <div className="space-y-5">
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
              <Link className="w-5 h-5 text-indigo-400" /> Job Description Matching
            </h2>
            <p className="text-indigo-300 text-sm mb-4">Paste a job description to see how well your resume matches it.</p>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={8}
              placeholder="Paste the full job description here..."
              className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-3 text-white placeholder-indigo-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4" />
            <button onClick={handleJdMatch} disabled={jdChecking || !jdText.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
              {jdChecking ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              Check Match
            </button>
          </div>

          {jdResult && (
            <div className="space-y-4">
              <div className={`border rounded-2xl p-6 ${scoreBg(jdResult.matchScore)}`}>
                <div className="flex items-center gap-5">
                  <p className={`text-6xl font-bold ${scoreColor(jdResult.matchScore)}`}>{jdResult.matchScore}%</p>
                  <div>
                    <p className="text-white font-bold text-lg">Match Score</p>
                    <p className="text-indigo-200 text-sm mt-1">{jdResult.recommendation}</p>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {jdResult.matchedSkills?.length > 0 && (
                  <div className="bg-[#0f0e2a]/80 border border-green-900/40 rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-3 text-sm">✅ Matched Skills ({jdResult.matchedSkills.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {jdResult.matchedSkills.map(s => (
                        <span key={s} className="text-xs bg-green-900/30 border border-green-700/30 text-green-300 px-2.5 py-1 rounded-lg">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {jdResult.missingSkills?.length > 0 && (
                  <div className="bg-[#0f0e2a]/80 border border-red-900/40 rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-3 text-sm">❌ Missing Skills ({jdResult.missingSkills.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {jdResult.missingSkills.map(s => (
                        <span key={s} className="text-xs bg-red-900/30 border border-red-700/30 text-red-300 px-2.5 py-1 rounded-lg">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── COVER LETTER TAB ── */}
      {activeTab === 'cover' && (
        <div className="space-y-5">
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Cover Letter Generator
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Job Title" value={coverForm.jobTitle} onChange={v => setCoverForm(p => ({ ...p, jobTitle: v }))} placeholder="Software Engineer" />
              <Field label="Company Name" value={coverForm.company} onChange={v => setCoverForm(p => ({ ...p, company: v }))} placeholder="Google" />
            </div>
            <Field label="Job Description (optional)" value={coverForm.jobDescription}
              onChange={v => setCoverForm(p => ({ ...p, jobDescription: v }))} multiline
              placeholder="Paste job description for a more tailored letter..." />
            <button onClick={handleGenerateCover} disabled={coverGenerating || !coverForm.jobTitle || !coverForm.company}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
              {coverGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              Generate Cover Letter
            </button>
          </div>

          {coverLetter && (
            <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Generated Cover Letter</h3>
                <button onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success('Copied!'); }}
                  className="text-indigo-400 hover:text-white text-sm px-3 py-1.5 border border-indigo-700/40 rounded-xl hover:bg-indigo-900/30 transition-all">
                  Copy
                </button>
              </div>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={15}
                className="w-full bg-transparent text-indigo-100 text-sm leading-relaxed focus:outline-none resize-none" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
