import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import resumeService from '../services/resume.service';
import ScoreChart from '../components/ScoreChart';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';

const Results = () => {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState('');

  // Interactive workspace states
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'optimizer'
  const [editedText, setEditedText] = useState('');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [tailorSuggestions, setTailorSuggestions] = useState([]);
  const [loadingTailor, setLoadingTailor] = useState(false);
  const [tailorError, setTailorError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!data && id) {
      fetchReport();
    }
  }, [id]);

  useEffect(() => {
    if (data?.extractedText) {
      setEditedText(data.extractedText);
    }
  }, [data]);

  useEffect(() => {
    if (activeTab === 'optimizer' && data && tailorSuggestions.length === 0) {
      fetchTailorSuggestions(data.extractedText, data.jobDescription, data.missingKeywords);
    }
  }, [activeTab, data]);

  const fetchReport = async () => {
    try {
      const response = await resumeService.getHistoryById(id);
      const report = response.data;
      setData({
        atsScore: report.atsScore,
        missingKeywords: report.analysisReport?.missingKeywords || [],
        matchPercentage: report.analysisReport?.matchPercentage || 0,
        skillMatch: report.analysisReport?.skillMatch || { found: [], missing: [] },
        formatSuggestions: report.analysisReport?.formatSuggestions || [],
        recommendations: report.analysisReport?.recommendations || [],
        fileName: report.fileName,
        createdAt: report.createdAt,
        extractedText: report.extractedText || '',
        jobDescription: report.jobDescription || '',
      });
    } catch (err) {
      setError('Failed to load analysis report.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTailorSuggestions = async (resumeText, jobDescription, missingKeywords) => {
    setLoadingTailor(true);
    setTailorError('');
    try {
      const response = await resumeService.tailor(jobDescription, resumeText, missingKeywords);
      setTailorSuggestions(response.data || []);
    } catch (err) {
      setTailorError('Failed to generate tailoring suggestions. Please try again.');
    } finally {
      setLoadingTailor(false);
    }
  };

  const handleReanalyze = async () => {
    if (!editedText.trim()) return;
    setReanalyzing(true);
    setError('');
    try {
      const response = await resumeService.analyze(data.jobDescription, editedText, data.fileName);
      const newReport = response.data;
      
      setData({
        atsScore: newReport.atsScore,
        missingKeywords: newReport.missingKeywords || [],
        matchPercentage: newReport.matchPercentage || 0,
        skillMatch: newReport.skillMatch || { found: [], missing: [] },
        formatSuggestions: newReport.formatSuggestions || [],
        recommendations: newReport.recommendations || [],
        fileName: newReport.fileName,
        createdAt: newReport.createdAt,
        extractedText: newReport.extractedText || '',
        jobDescription: newReport.jobDescription || '',
      });

      // Update URL silently in browser history to keep references consistent
      window.history.replaceState(null, '', `/results/${newReport.id}`);

      // Refresh tailoring suggestions based on the updated resume content
      fetchTailorSuggestions(newReport.extractedText, newReport.jobDescription, newReport.missingKeywords);
    } catch (err) {
      setError(err.response?.data?.message || 'Re-analysis failed. Please try again.');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <ChartSkeleton />
          <div className="md:col-span-2">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto glass-card p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getScoreBadge = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
    if (score >= 60) return { text: 'Good', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    if (score >= 40) return { text: 'Fair', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    return { text: 'Needs Improvement', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
  };

  const badge = getScoreBadge(data.atsScore);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Analysis Results</h1>
            {data.fileName && (
              <p className="text-dark-400 text-sm">{data.fileName}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link to="/upload" className="btn-primary text-sm !px-4 !py-2">New Analysis</Link>
            <Link to="/dashboard" className="btn-outline text-sm !px-4 !py-2">Dashboard</Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-dark-800/80 mb-8">
          <button
            onClick={() => setActiveTab('report')}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === 'report'
                ? 'border-primary-500 text-white font-semibold'
                : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            ATS Analysis Report
          </button>
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'optimizer'
                ? 'border-primary-500 text-white font-semibold'
                : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
            </span>
            AI Optimizer Workspace
          </button>
        </div>

        {/* Tab content 1: Original report metrics */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Score Card */}
              <div className="glass-card p-8 flex flex-col items-center justify-center animate-slide-up">
                <ScoreChart score={data.atsScore} size={180} />
                <div className={`mt-4 px-4 py-1.5 rounded-full border text-sm font-medium ${badge.color}`}>
                  {badge.text}
                </div>
                <p className="text-dark-400 text-sm mt-3">
                  Match: <span className="text-white font-medium">{data.matchPercentage}%</span>
                </p>
              </div>

              {/* Skills Match */}
              <div className="md:col-span-2 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Skill Match</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-accent-400 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Found ({data.skillMatch.found.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skillMatch.found.length > 0 ? (
                        data.skillMatch.found.map((skill, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg bg-accent-500/10 text-accent-400 text-sm border border-accent-500/20">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-dark-500 text-sm">No matching skills detected.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Missing ({data.skillMatch.missing.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skillMatch.missing.length > 0 ? (
                        data.skillMatch.missing.map((skill, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-dark-500 text-sm">All skills matched!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Keywords */}
            {data.missingKeywords?.length > 0 && (
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Missing Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {data.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm border border-yellow-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Format Suggestions */}
            {data.formatSuggestions?.length > 0 && (
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Formatting Suggestions</h2>
                <ul className="space-y-3">
                  {data.formatSuggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-500/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-primary-400 font-medium">{i + 1}</span>
                      </div>
                      <p className="text-dark-300 text-sm leading-relaxed">{suggestion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {data.recommendations?.length > 0 && (
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Recommendations
                </h2>
                <ul className="space-y-3">
                  {data.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-900/50 hover:bg-dark-900 transition-colors">
                      <div className="w-6 h-6 rounded-full gradient-bg flex-shrink-0 flex items-center justify-center mt-0.5">
                        <span className="text-xs text-white font-bold">{i + 1}</span>
                      </div>
                      <p className="text-dark-300 text-sm leading-relaxed">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab content 2: Split-screen AI Optimizer Workspace */}
        {activeTab === 'optimizer' && (
          <div className="grid md:grid-cols-2 gap-8 items-stretch animate-slide-up">
            {/* Left side: Live Resume Editor */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Resume Content Editor
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dark-400">Current Score:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        data.atsScore >= 80 ? 'bg-green-500/10 text-green-400' :
                        data.atsScore >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
                        data.atsScore >= 40 ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'
                      }`}>{data.atsScore}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-dark-500 mb-3">
                  This editor holds the parsed text of your resume. Copy suggestions from the right panel, paste them in, and recalculate your ATS score.
                </p>

                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Your resume text content..."
                  className="w-full h-[480px] p-4 bg-dark-900/60 text-dark-200 border border-dark-700 rounded-xl focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 font-mono text-sm leading-relaxed resize-none"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-dark-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-dark-500">
                  {editedText.split(/\s+/).filter(Boolean).length} words | {editedText.length} characters
                </span>
                <button
                  onClick={handleReanalyze}
                  disabled={reanalyzing || !editedText.trim()}
                  className="btn-primary text-sm !px-6 !py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {reanalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating score...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                      </svg>
                      Re-analyze & Update Score
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right side: AI suggestions */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI-Suggested Tailored Lines
                </h2>
                <p className="text-xs text-dark-500 mb-6">
                  Review these optimized suggestions designed to contextually match the job requirements, and copy them into your editor.
                </p>

                {loadingTailor ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="p-4 rounded-xl border border-dark-800 bg-dark-900/20 space-y-3">
                        <div className="h-4 bg-dark-800 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-dark-800 rounded animate-pulse w-5/6" />
                        <div className="h-3 bg-dark-800 rounded animate-pulse w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : tailorError ? (
                  <div className="text-center p-8 bg-dark-900/40 rounded-2xl border border-dark-700/50">
                    <p className="text-red-400 text-sm mb-4">{tailorError}</p>
                    <button
                      onClick={() => fetchTailorSuggestions(data.extractedText, data.jobDescription, data.missingKeywords)}
                      className="btn-secondary text-xs !px-4 !py-2"
                    >
                      Retry Generating
                    </button>
                  </div>
                ) : tailorSuggestions.length > 0 ? (
                  <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                    {tailorSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-dark-700/50 bg-dark-900/40 hover:bg-dark-900/70 transition-all group"
                      >
                        <div className="mb-2">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-red-400/80">Original line:</span>
                          <p className="text-xs text-dark-400 italic line-through mt-0.5">{suggestion.original}</p>
                        </div>
                        
                        <div className="mb-3 border-l-2 border-accent-500 pl-3 bg-accent-500/5 py-2 pr-2 rounded-r">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-400">Suggested Rewrite:</span>
                          <p className="text-sm text-white font-medium mt-0.5 leading-relaxed">{suggestion.suggestion}</p>
                        </div>

                        {suggestion.keywordsUsed?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center mb-3">
                            <span className="text-[10px] text-dark-500 font-medium">Keywords:</span>
                            {suggestion.keywordsUsed.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 text-[10px] border border-accent-500/20"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-dark-800/80">
                          <p className="text-[11px] text-dark-500 leading-normal max-w-[70%]">
                            <strong className="text-dark-400">Impact: </strong>
                            {suggestion.rationale}
                          </p>
                          <button
                            onClick={() => handleCopy(suggestion.suggestion, idx)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                              copiedId === idx
                                ? 'bg-accent-500/10 text-accent-400 border-accent-500/30'
                                : 'bg-dark-800 hover:bg-dark-700 text-dark-200 border-dark-700'
                            }`}
                          >
                            {copiedId === idx ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-4 8l-2-2m0 0l-2 2m2-2v6" />
                                </svg>
                                Copy suggestion
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-dark-900/40 rounded-2xl border border-dark-700/50">
                    <p className="text-dark-400 text-sm">No suggestions available. Try re-analyzing your resume with some changes.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-dark-800/80 flex items-center justify-between text-xs text-dark-500">
                <span>Recommendations match the current Job Description</span>
                <span className="flex h-2 w-2 rounded-full bg-accent-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;

