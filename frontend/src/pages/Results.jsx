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

  useEffect(() => {
    if (!data && id) {
      fetchReport();
    }
  }, [id]);

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
      });
    } catch (err) {
      setError('Failed to load analysis report.');
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
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
          <div className="glass-card p-6 mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
          <div className="glass-card p-6 mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
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
          <div className="glass-card p-6 mt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
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
    </div>
  );
};

export default Results;
