// ================================================================
// FACIAL EXPRESSION ANALYSIS — face-api.js (TensorFlow.js)
// ================================================================
// HOW TO ENABLE:
// 1. In frontend/.env: set REACT_APP_ENABLE_FACE_ANALYSIS=true
// 2. face-api.js loads models from CDN automatically (~6MB total)
//    Models: tinyFaceDetector + faceExpressionNet
// 3. NO API KEY NEEDED — runs fully in browser
//
// face-api.js GitHub: https://github.com/justadudewhohacks/face-api.js
// ================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
const MODELS_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';

const EXPRESSION_LABELS = {
  happy: { label: 'Happy', icon: '😊', color: 'text-green-400' },
  neutral: { label: 'Neutral', icon: '😐', color: 'text-indigo-300' },
  sad: { label: 'Sad', icon: '😢', color: 'text-blue-400' },
  angry: { label: 'Angry', icon: '😠', color: 'text-red-400' },
  fearful: { label: 'Nervous', icon: '😰', color: 'text-yellow-400' },
  disgusted: { label: 'Disgusted', icon: '😒', color: 'text-orange-400' },
  surprised: { label: 'Surprised', icon: '😮', color: 'text-purple-400' },
};

// Confidence score from expressions
const getConfidenceFromExpressions = (expressions) => {
  if (!expressions) return 0;
  const positive = (expressions.happy || 0) + (expressions.neutral || 0) * 0.7;
  const negative = (expressions.fearful || 0) + (expressions.sad || 0) + (expressions.angry || 0);
  return Math.round(Math.max(0, Math.min(100, (positive - negative * 0.5) * 100)));
};

export default function FaceAnalysis({ videoRef, onAnalysisUpdate, isActive }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnabled] = useState(process.env.REACT_APP_ENABLE_FACE_ANALYSIS === 'true');
  const [currentExpression, setCurrentExpression] = useState(null);
  const [expressionHistory, setExpressionHistory] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const intervalRef = useRef(null);
  const faceApiRef = useRef(null);

  // Load face-api.js from CDN
  const loadFaceApi = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.faceapi) { faceApiRef.current = window.faceapi; resolve(); return; }

      const script = document.createElement('script');
      script.src = FACE_API_CDN;
      script.onload = async () => {
        try {
          faceApiRef.current = window.faceapi;
          // Load only lightweight models
          await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
            window.faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL),
          ]);
          resolve();
        } catch (err) {
          reject(new Error(`Model load failed: ${err.message}`));
        }
      };
      script.onerror = () => reject(new Error('Failed to load face-api.js from CDN'));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (!isEnabled || !isActive) return;

    loadFaceApi()
      .then(() => setIsLoaded(true))
      .catch(err => {
        console.warn('FaceAnalysis:', err.message);
        setLoadError(err.message);
      });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isEnabled, isActive, loadFaceApi]);

  useEffect(() => {
    if (!isLoaded || !videoRef?.current || !faceApiRef.current) return;

    intervalRef.current = setInterval(async () => {
      try {
        const detections = await faceApiRef.current
          .detectAllFaces(videoRef.current, new faceApiRef.current.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (!detections || detections.length === 0) return;

        const expressions = detections[0]?.expressions;
        if (!expressions) return;

        // Find dominant expression
        const dominant = Object.entries(expressions)
          .sort(([, a], [, b]) => b - a)[0];

        const result = {
          dominant: dominant[0],
          score: Math.round(dominant[1] * 100),
          all: Object.fromEntries(
            Object.entries(expressions).map(([k, v]) => [k, Math.round(v * 100)])
          ),
          confidenceScore: getConfidenceFromExpressions(expressions),
          timestamp: Date.now(),
        };

        setCurrentExpression(result);
        setExpressionHistory(prev => [...prev.slice(-29), result]); // Keep last 30

        if (onAnalysisUpdate) onAnalysisUpdate(result);
      } catch (err) {
        // Silent fail — face not detected is normal
      }
    }, 2000); // Analyze every 2 seconds

    return () => clearInterval(intervalRef.current);
  }, [isLoaded, videoRef, onAnalysisUpdate]);

  // Not enabled
  if (!isEnabled) {
    return (
      <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-xl p-3 text-xs">
        <p className="text-yellow-400 font-medium mb-1">😶 Face Analysis Disabled</p>
        <p className="text-yellow-300/70">
          To enable: set <code className="bg-yellow-900/30 px-1 rounded">REACT_APP_ENABLE_FACE_ANALYSIS=true</code> in frontend/.env
        </p>
        <p className="text-yellow-500 mt-1">No API key needed — runs in browser using face-api.js</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-900/10 border border-red-700/30 rounded-xl p-3 text-xs">
        <p className="text-red-400 font-medium">Face Analysis Error</p>
        <p className="text-red-300/70 mt-1">{loadError}</p>
        <p className="text-red-500 mt-1">Check internet connection (CDN required for model download)</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-3 text-xs flex items-center gap-2">
        <div className="w-3 h-3 border border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />
        <p className="text-indigo-300">Loading face analysis models (~6MB)...</p>
      </div>
    );
  }

  const exprInfo = currentExpression ? EXPRESSION_LABELS[currentExpression.dominant] : null;

  // Calculate average expressions from history
  const avgExpressions = expressionHistory.length > 0
    ? Object.keys(EXPRESSION_LABELS).reduce((acc, key) => {
        const vals = expressionHistory.map(h => h.all?.[key] || 0);
        acc[key] = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
        return acc;
      }, {})
    : null;

  return (
    <div className="space-y-3">
      {/* Current expression */}
      <div className="bg-[#0f0e2a] border border-indigo-900/40 rounded-xl p-3">
        <p className="text-indigo-400 text-xs font-medium mb-2">😊 Live Expression</p>
        {exprInfo ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{exprInfo.icon}</span>
            <div className="flex-1">
              <p className={`text-sm font-bold ${exprInfo.color}`}>{exprInfo.label}</p>
              <p className="text-indigo-500 text-xs">{currentExpression.score}% confidence</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">{currentExpression.confidenceScore}</p>
              <p className="text-indigo-400 text-xs">poise score</p>
            </div>
          </div>
        ) : (
          <p className="text-indigo-500 text-xs">Scanning for face...</p>
        )}
      </div>

      {/* Expression bars */}
      {avgExpressions && (
        <div className="bg-[#0f0e2a] border border-indigo-900/40 rounded-xl p-3">
          <p className="text-indigo-400 text-xs font-medium mb-2">📊 Session Average</p>
          <div className="space-y-1.5">
            {Object.entries(EXPRESSION_LABELS).map(([key, info]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-16 text-indigo-400">{info.label}</span>
                <div className="flex-1 h-1.5 bg-indigo-900/50 rounded-full">
                  <div className={`h-full rounded-full transition-all ${key === 'happy' ? 'bg-green-500' : key === 'neutral' ? 'bg-indigo-500' : key === 'fearful' ? 'bg-yellow-500' : 'bg-red-500/60'}`}
                    style={{ width: `${avgExpressions[key] || 0}%` }} />
                </div>
                <span className="text-xs text-indigo-500 w-8 text-right">{avgExpressions[key] || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for collecting face data across a session
export const useFaceAnalysisSession = () => {
  const [sessionData, setSessionData] = useState([]);

  const recordExpression = useCallback((expressionData) => {
    setSessionData(prev => [...prev, expressionData]);
  }, []);

  const getSessionSummary = useCallback(() => {
    if (!sessionData.length) return null;

    const avgConfidence = Math.round(
      sessionData.reduce((s, d) => s + d.confidenceScore, 0) / sessionData.length
    );

    const expressionCounts = sessionData.reduce((acc, d) => {
      acc[d.dominant] = (acc[d.dominant] || 0) + 1;
      return acc;
    }, {});

    const dominant = Object.entries(expressionCounts).sort(([, a], [, b]) => b - a)[0]?.[0];

    return {
      avgConfidenceScore: avgConfidence,
      dominantExpression: dominant,
      expressionDistribution: expressionCounts,
      totalFrames: sessionData.length,
      grade: avgConfidence >= 80 ? 'Excellent' : avgConfidence >= 60 ? 'Good' : avgConfidence >= 40 ? 'Average' : 'Needs Work',
    };
  }, [sessionData]);

  return { recordExpression, getSessionSummary, sessionData };
};
