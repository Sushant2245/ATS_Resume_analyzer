import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import resumeService from '../services/resume.service';
import HistoryChart from '../components/HistoryChart';
import { CardSkeleton } from '../components/LoadingSkeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await resumeService.getHistory();
      setHistory(response.data || []);
    } catch (err) {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const avgScore = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.atsScore, 0) / history.length)
    : 0;

  const bestScore = history.length ? Math.max(...history.map((h) => h.atsScore)) : 0;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-dark-400">Here's an overview of your resume analysis history.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 animate-slide-up">
            <p className="text-sm text-dark-400 mb-1">Total Analyses</p>
            <p className="text-3xl font-bold text-white">{history.length}</p>
          </div>
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-sm text-dark-400 mb-1">Average Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
          </div>
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm text-dark-400 mb-1">Best Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(bestScore)}`}>{bestScore}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No analyses yet</h2>
            <p className="text-dark-400 mb-6">Upload your first resume and get an ATS score.</p>
            <Link to="/upload" className="btn-primary">
              Analyze Resume →
            </Link>
          </div>
        ) : (
          <>
            {/* Score Trend Chart */}
            {history.length >= 2 && (
              <div className="glass-card p-6 mb-8 animate-fade-in">
                <h2 className="text-lg font-semibold text-white mb-4">Score Trend</h2>
                <HistoryChart history={history} />
              </div>
            )}

            {/* History List */}
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Analysis History</h2>
                <Link to="/upload" className="btn-secondary text-sm !px-4 !py-2">
                  + New Analysis
                </Link>
              </div>

              <div className="space-y-3">
                {history.map((item, i) => (
                  <Link
                    key={item.id}
                    to={`/results/${item.id}`}
                    className="glass-card-hover p-5 flex items-center justify-between group block"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate mb-1">{item.fileName}</p>
                      <p className="text-sm text-dark-400 truncate">{item.jobDescriptionSnippet}</p>
                      <p className="text-xs text-dark-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getScoreColor(item.atsScore)}`}>
                        {item.atsScore}
                      </span>
                      <svg
                        className="w-5 h-5 text-dark-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
