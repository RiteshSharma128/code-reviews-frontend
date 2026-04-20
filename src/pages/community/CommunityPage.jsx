import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import { Users, Plus, ThumbsUp, MessageCircle, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CAT_COLORS = { experience:'bg-blue-900/30 text-blue-400',doubt:'bg-yellow-900/30 text-yellow-400',discussion:'bg-indigo-900/30 text-indigo-400',resource:'bg-green-900/30 text-green-400',job_ref:'bg-purple-900/30 text-purple-400' };

export default function CommunityPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title:'', content:'', category:'discussion', tags:'' });
  const [category, setCategory] = useState('');

  const { data } = useQuery({ queryKey: ['posts', category], queryFn: () => communityAPI.getPosts({ limit:20, ...(category&&{category}) }).then(r=>r.data) });

  const { mutate: create, isLoading: creating } = useMutation({
    mutationFn: () => communityAPI.createPost({ ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) }),
    onSuccess: () => { toast.success('Post created!'); setShowCreate(false); setForm({title:'',content:'',category:'discussion',tags:''}); qc.invalidateQueries(['posts']); },
    onError: () => toast.error('Failed to create post'),
  });

  const { mutate: upvote } = useMutation({
    mutationFn: (id) => communityAPI.upvotePost(id),
    onSuccess: () => qc.invalidateQueries(['posts']),
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="w-6 h-6 text-indigo-400"/>Community</h1>
        <button onClick={()=>setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4"/>New Post
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['','experience','doubt','discussion','resource','job_ref'].map(c=>(
          <button key={c} onClick={()=>setCategory(c)}
            className={`px-3 py-1.5 rounded-xl text-sm border transition-all capitalize ${category===c?'bg-indigo-600 border-indigo-500 text-white':'bg-indigo-900/20 border-indigo-700/40 text-indigo-300 hover:border-indigo-600'}`}>
            {c||'All'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {data?.posts?.map(post=>(
          <div key={post._id} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5 hover:border-indigo-700/50 transition-all cursor-pointer" onClick={()=>navigate(`/community/${post._id}`)}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-indigo-600/20 border border-indigo-700/30 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {post.userName?.[0]?.toUpperCase()||'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-lg capitalize ${CAT_COLORS[post.category]||CAT_COLORS.discussion}`}>{post.category}</span>
                  <span className="text-indigo-500 text-xs">{post.userName} · {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-white font-semibold">{post.title}</p>
                <p className="text-indigo-300 text-sm mt-1 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 mt-3">
                  <button onClick={e=>{e.stopPropagation();upvote(post._id);}} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs">
                    <ThumbsUp className="w-3.5 h-3.5"/>{post.upvotes||0}
                  </button>
                  <span className="flex items-center gap-1 text-indigo-500 text-xs"><MessageCircle className="w-3.5 h-3.5"/>{post.comments?.length||0}</span>
                  <span className="flex items-center gap-1 text-indigo-500 text-xs"><Eye className="w-3.5 h-3.5"/>{post.views||0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0e2a] border border-indigo-700/50 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Create Post</h3>
              <button onClick={()=>setShowCreate(false)}><X className="w-5 h-5 text-indigo-400 hover:text-white"/></button>
            </div>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
              {['discussion','experience','doubt','resource','job_ref'].map(c=><option key={c} value={c} className="bg-[#1e1b4b] capitalize">{c.replace('_',' ')}</option>)}
            </select>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Post title..."
              className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white placeholder-indigo-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} rows={5} placeholder="Share your experience, question, or resource..."
              className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white placeholder-indigo-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/>
            <input value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="Tags (comma separated): google, system-design"
              className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white placeholder-indigo-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <div className="flex gap-3">
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 border border-indigo-700/50 text-indigo-300 rounded-xl text-sm hover:bg-indigo-900/30">Cancel</button>
              <button onClick={()=>create()} disabled={creating||!form.title||!form.content}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                {creating&&<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
