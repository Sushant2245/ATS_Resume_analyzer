import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'ATS Score',
    description: 'Get an instant 0–100 compatibility score powered by AI analysis.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: 'Keyword Analysis',
    description: 'Discover missing keywords and match percentage against the job description.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Skill Matching',
    description: 'See exactly which skills match and which ones you need to add.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Smart Tips',
    description: 'Receive actionable recommendations to boost your resume score.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Format Check',
    description: 'Ensure your resume layout is ATS-friendly with structure analysis.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'History Tracking',
    description: 'Track your improvement over time with detailed analysis history.',
  },
];

const stats = [
  { value: '10K+', label: 'Resumes Analyzed' },
  { value: '85%', label: 'Avg Score Improvement' },
  { value: '50+', label: 'Supported Formats' },
  { value: '99.9%', label: 'Uptime' },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px]" />
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-accent-500/15 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-primary-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            AI-Powered Resume Analysis
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
            Beat the{' '}
            <span className="gradient-text">ATS</span>
            <br />
            Land More Interviews
          </h1>

          <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Upload your resume, paste a job description, and get an instant AI-powered
            compatibility score with actionable tips to improve.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to={isAuthenticated ? '/upload' : '/signup'}
              className="btn-primary text-lg !px-8 !py-4"
            >
              Analyze Your Resume →
            </Link>
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn-secondary text-lg !px-8 !py-4">
              {isAuthenticated ? 'View Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-dark-800/50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-dark-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Optimize</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Our AI examines your resume from every angle an ATS system would,
              giving you the edge you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card-hover p-6 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4 group-hover:bg-primary-500/20 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-accent-500/10 pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Boost Your Resume?
            </h2>
            <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of job seekers who improved their interview callback rate with our ATS analyzer.
            </p>
            <Link
              to={isAuthenticated ? '/upload' : '/signup'}
              className="btn-primary text-lg !px-10 !py-4"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="text-sm font-medium text-dark-400">
              ATS Resume Analyzer &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-dark-500">
            <span>Built with React + Express</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
