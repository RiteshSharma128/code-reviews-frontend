import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import { ArrowLeft, ThumbsUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommunityPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: post, isLoading } = useQuery({ queryKey: ['post', postId], queryFn: () => communityAPI.getPost(postId).then(r => r.data.post) });

  const { mutate: addComment, isLoading: posting } = useMutation({
    mutationFn: () => communityAPI.addComment(postId, comment),
    onSuccess: () => { toast.success('Comment added!'); setComment(''); qc.invalidateQueries(['post', postId]); },
    onError: () => toast.error('Failed to add comment'),
  });

  if (isLoading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>;
  if (!post) return <div className="p-6 text-center text-indigo-400">Post not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/community')} className="flex items-center gap-2 text-indigo-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4"/> Back to community
      </button>
      <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-indigo-900/40 border border-indigo-700/30 text-indigo-300 px-2 py-0.5 rounded-lg capitalize">{post.category}</span>
          <span className="text-indigo-500 text-xs">{post.userName} · {new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="text-white text-xl font-bold mb-4">{post.title}</h1>
        <p className="text-indigo-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(t => <span key={t} className="text-xs text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded-lg">#{t}</span>)}
          </div>
        )}
        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-indigo-900/40">
          <button onClick={() => communityAPI.upvotePost(postId).then(() => qc.invalidateQueries(['post', postId]))}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm">
            <ThumbsUp className="w-4 h-4"/>{post.upvotes} Upvotes
          </button>
        </div>
      </div>

      <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Comments ({post.comments?.length || 0})</h2>
        <div className="space-y-4 mb-6">
          {post.comments?.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-700/30 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.userName?.[0]?.toUpperCase()||'U'}</div>
              <div className="flex-1 bg-indigo-900/20 rounded-xl p-3">
                <p className="text-indigo-300 text-xs font-medium mb-1">{c.userName} · {new Date(c.createdAt).toLocaleDateString()}</p>
                <p className="text-white text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Write a comment..."
            className="flex-1 bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-3 text-white placeholder-indigo-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/>
          <button onClick={() => addComment()} disabled={posting || !comment.trim()}
            className="self-end bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-all">
            <Send className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
}
