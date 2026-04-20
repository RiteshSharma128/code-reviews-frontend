import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobAPI, api } from '../../services/api';
import { Briefcase, Search, ExternalLink, CheckCircle, Clock, Target, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  applied:'bg-blue-900/30 text-blue-400 border-blue-700/30',
  screening:'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
  interview:'bg-purple-900/30 text-purple-400 border-purple-700/30',
  offer:'bg-green-900/30 text-green-400 border-green-700/30',
  rejected:'bg-red-900/30 text-red-400 border-red-700/30',
  withdrawn:'bg-gray-900/30 text-gray-400 border-gray-700/30',
};
const DIFF_COLORS = {
  easy:'text-green-400 bg-green-900/20 border-green-700/30',
  medium:'text-yellow-400 bg-yellow-900/20 border-yellow-700/30',
  hard:'text-red-400 bg-red-900/20 border-red-700/30',
};

export default function JobsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [jdText, setJdText] = useState('');
  const [jdResult, setJdResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: jobsData } = useQuery({ queryKey:['jobs',search,jobType], queryFn:()=>jobAPI.getJobs({search,type:jobType,limit:20}).then(r=>r.data) });
  const { data: appsData } = useQuery({ queryKey:['applications'], queryFn:()=>jobAPI.getApplications().then(r=>r.data), enabled:tab==='applied'||tab==='placement' });
  const { data: placementStats } = useQuery({ queryKey:['placement-stats'], queryFn:()=>api.get('/api/jobs/placement/stats').then(r=>r.data.stats), enabled:tab==='placement' });
  const { data: companyTracks } = useQuery({ queryKey:['company-tracks'], queryFn:()=>api.get('/api/jobs/company-tracks').then(r=>r.data.tracks), enabled:tab==='tracks' });

  const { mutate: apply } = useMutation({
    mutationFn:(id)=>jobAPI.apply(id),
    onSuccess:()=>{ toast.success('Applied! 🎉'); qc.invalidateQueries(['applications']); },
    onError:(err)=>toast.error(err.response?.data?.message||'Already applied'),
  });

  const analyzeJD = async () => {
    if (!jdText.trim()) { toast.error('Paste a JD first'); return; }
    setAnalyzing(true);
    const techTerms = ['react','node','python','java','javascript','typescript','sql','mongodb','aws','docker','kubernetes','git','rest','api','microservices','agile','machine learning','tensorflow','data analysis','tableau','excel','power bi','figma','css','html','vue','angular','spring','django','flask','go','rust','redis','graphql'];
    const lower = jdText.toLowerCase();
    const keywords = techTerms.filter(t => lower.includes(t));
    const resumeRes = await api.get('/api/resume/').catch(()=>null);
    const resume = resumeRes?.data?.resume;
    if (!resume) { toast.error('Build your resume first'); setAnalyzing(false); return; }
    const resumeText = [...(resume.skills||[]),...(resume.experience?.map(e=>e.title+' '+(e.description||''))||[])].join(' ').toLowerCase();
    const matched = keywords.filter(k=>resumeText.includes(k));
    const missing = keywords.filter(k=>!resumeText.includes(k));
    setJdResult({ keywords, matched, missing, score: Math.round((matched.length/Math.max(keywords.length,1))*100) });
    setAnalyzing(false);
  };

  const TABS = [{id:'browse',label:'🔍 Browse'},{id:'applied',label:'📋 Applications'},{id:'placement',label:'📈 Tracker'},{id:'tracks',label:'🏢 Company Prep'},{id:'jd-match',label:'🎯 JD Match'}];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Briefcase className="w-6 h-6 text-indigo-400"/>Jobs & Placement</h1>
        <p className="text-indigo-300 text-sm mt-1">Find jobs, track applications, prepare for companies</p>
      </div>

      <div className="flex gap-1 flex-wrap bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-1">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab===t.id?'bg-indigo-600 text-white':'text-indigo-300 hover:text-white'}`}>{t.label}</button>
        ))}
      </div>

      {tab==='browse' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs..." className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"/>
            </div>
            <select value={jobType} onChange={e=>setJobType(e.target.value)} className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
              <option value="">All Types</option>
              {['full-time','internship','contract','part-time'].map(t=><option key={t} value={t} className="bg-[#1e1b4b]">{t}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {jobsData?.jobs?.map(job=>(
              <div key={job.id} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5 hover:border-indigo-700/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-700/30 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{job.company?.[0]||'C'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div><p className="text-white font-semibold">{job.title}</p><p className="text-indigo-300 text-sm">{job.company} · {job.location}</p></div>
                      <span className={`text-xs px-2 py-0.5 rounded-lg border capitalize flex-shrink-0 ${job.type==='internship'?'bg-green-900/30 text-green-400 border-green-700/30':'bg-blue-900/30 text-blue-400 border-blue-700/30'}`}>{job.type}</span>
                    </div>
                    {job.skills_required?.length>0&&<div className="flex flex-wrap gap-1.5 mt-2">{job.skills_required.slice(0,5).map(s=><span key={s} className="text-xs bg-indigo-900/30 text-indigo-300 border border-indigo-700/30 px-2 py-0.5 rounded-lg">{s}</span>)}</div>}
                    <div className="flex items-center gap-3 mt-3">
                      {job.apply_url&&<a href={job.apply_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs"><ExternalLink className="w-3 h-3"/>View</a>}
                      <button onClick={()=>apply(job.id)} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition-all"><CheckCircle className="w-3 h-3"/>Apply</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='applied' && (
        <div className="space-y-3">
          {!appsData?.applications?.length&&<div className="text-center py-12 text-indigo-400"><Briefcase className="w-10 h-10 mx-auto mb-3 opacity-50"/><p>No applications yet</p></div>}
          {appsData?.applications?.map(app=>(
            <div key={app.id} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1"><p className="text-white font-medium text-sm">{app.title}</p><p className="text-indigo-300 text-xs">{app.company}</p><p className="text-indigo-500 text-xs mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/>Applied {new Date(app.applied_at).toLocaleDateString()}</p></div>
              <select value={app.status} onChange={e=>jobAPI.updateStatus(app.id,e.target.value).then(()=>qc.invalidateQueries(['applications']))}
                className={`text-xs px-3 py-1.5 rounded-xl border focus:outline-none ${STATUS_COLORS[app.status]||''}`}>
                {['applied','screening','interview','offer','rejected','withdrawn'].map(s=><option key={s} value={s} className="bg-[#1e1b4b] text-white capitalize">{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {tab==='placement' && (
        <div className="space-y-5">
          {placementStats&&(
            <>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[['Total',placementStats.total_applications,'text-white'],['Applied',placementStats.applied,'text-blue-400'],['Screening',placementStats.screening,'text-yellow-400'],['Interview',placementStats.interview,'text-purple-400'],['Offers',placementStats.offer,'text-green-400'],['Rejected',placementStats.rejected,'text-red-400']].map(([label,val,color])=>(
                  <div key={label} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-3 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{val||0}</p>
                    <p className="text-indigo-400 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-indigo-400"/>Application Funnel</h3>
                {[['Applied',parseInt(placementStats.total_applications)||0,'bg-blue-500'],['Screening',parseInt(placementStats.screening)||0,'bg-yellow-500'],['Interview',parseInt(placementStats.interview)||0,'bg-purple-500'],['Offers',parseInt(placementStats.offer)||0,'bg-green-500']].map(([label,val,color])=>{
                  const total=parseInt(placementStats.total_applications)||1;
                  const pct=Math.round((val/total)*100);
                  return <div key={label} className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="text-indigo-300">{label}</span><span className="text-white">{val} ({pct}%)</span></div><div className="h-2 bg-indigo-900/50 rounded-full"><div className={`h-full ${color} rounded-full`} style={{width:`${pct}%`}}/></div></div>;
                })}
              </div>
            </>
          )}
        </div>
      )}

      {tab==='tracks' && (
        <div className="grid md:grid-cols-2 gap-4">
          {companyTracks?.map(track=>(
           <div key={track.company}
           onClick={() => window.open(`https://www.google.com/search?q=${track.company}+interview+preparation`, '_blank')}
           className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5 hover:border-indigo-700/50 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="text-white font-bold text-lg">{track.company}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-lg border capitalize ${DIFF_COLORS[track.difficulty]}`}>{track.difficulty}</span>
                    <span className="text-indigo-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/>{track.prepTime}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-700/30 rounded-xl flex items-center justify-center text-white font-bold text-xl">{track.company[0]}</div>
              </div>
              <div className="mb-3">
                <p className="text-indigo-400 text-xs font-medium mb-2">Interview Rounds:</p>
                <div className="flex flex-wrap gap-1.5">{track.rounds.map((r,i)=><span key={i} className="text-xs bg-indigo-900/30 border border-indigo-700/30 text-indigo-300 px-2 py-0.5 rounded-lg"><span className="text-indigo-500 mr-1">{i+1}.</span>{r}</span>)}</div>
              </div>
              <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-xl p-3">
                <p className="text-indigo-400 text-xs font-medium mb-1">💡 Tips:</p>
                <p className="text-indigo-200 text-xs leading-relaxed">{track.tips}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='jd-match' && (
        <div className="space-y-5">
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-400"/>Job Description Matcher</h2>
            <p className="text-indigo-400 text-sm mb-4">Paste a JD to see how well your resume matches it.</p>
            <textarea value={jdText} onChange={e=>setJdText(e.target.value)} rows={8} placeholder="Paste the full job description here..."
              className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-3 text-white placeholder-indigo-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/>
            <button onClick={analyzeJD} disabled={analyzing||!jdText.trim()} className="mt-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
              {analyzing?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Target className="w-4 h-4"/>} Analyze Match
            </button>
          </div>
          {jdResult&&(
            <div className="space-y-4">
              <div className={`border rounded-2xl p-6 flex items-center gap-6 ${jdResult.score>=70?'bg-green-900/10 border-green-700/30':jdResult.score>=40?'bg-yellow-900/10 border-yellow-700/30':'bg-red-900/10 border-red-700/30'}`}>
                <div className={`text-5xl font-bold ${jdResult.score>=70?'text-green-400':jdResult.score>=40?'text-yellow-400':'text-red-400'}`}>{jdResult.score}%</div>
                <div><p className="text-white font-semibold text-lg">{jdResult.score>=70?'Strong Match! 🎉':jdResult.score>=40?'Moderate Match':'Weak Match'}</p>
                  <p className="text-indigo-300 text-sm mt-1">{jdResult.matched.length}/{jdResult.keywords.length} skills matched</p></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#0f0e2a]/80 border border-green-900/30 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/>Matched ({jdResult.matched.length})</h3>
                  <div className="flex flex-wrap gap-2">{jdResult.matched.length?jdResult.matched.map(s=><span key={s} className="text-xs bg-green-900/20 border border-green-700/30 text-green-300 px-2.5 py-1 rounded-lg capitalize">{s}</span>):<p className="text-indigo-400 text-sm">None found</p>}</div>
                </div>
                <div className="bg-[#0f0e2a]/80 border border-red-900/30 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-red-400"/>Missing ({jdResult.missing.length})</h3>
                  <div className="flex flex-wrap gap-2">{jdResult.missing.length?jdResult.missing.map(s=><span key={s} className="text-xs bg-red-900/20 border border-red-700/30 text-red-300 px-2.5 py-1 rounded-lg capitalize">{s}</span>):<p className="text-green-400 text-sm">✓ All matched!</p>}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
