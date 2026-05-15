import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDrop from '../components/DragDrop';
import resumeService from '../services/resume.service';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState(1); // 1: upload, 2: uploading, 3: enter JD, 4: analyzing
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setStep(2);
    setError('');

    try {
      const response = await resumeService.upload(file);
      setExtractedText(response.data.extractedText);
      setFileName(response.data.fileName);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      setStep(1);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setError('Please enter a job description (at least 20 characters).');
      return;
    }

    setStep(4);
    setError('');

    try {
      const response = await resumeService.analyze(jobDescription, extractedText, fileName);
      navigate(`/results/${response.data.id}`, { state: { analysisData: response.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-3">
            Analyze Your <span className="gradient-text">Resume</span>
          </h1>
          <p className="text-dark-400">
            Upload your resume and paste the job description to get your ATS score.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { num: 1, label: 'Upload Resume' },
            { num: 2, label: 'Job Description' },
            { num: 3, label: 'Get Results' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= s.num + (s.num === 1 ? 0 : 1)
                    ? 'gradient-bg text-white shadow-lg shadow-primary-500/25'
                    : 'bg-dark-800 text-dark-400 border border-dark-700'
                }`}
              >
                {(step > s.num + (s.num === 1 ? 0 : 1)) ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.num
                )}
              </div>
              <span className={`text-sm hidden sm:block ${step >= s.num + (s.num === 1 ? 0 : 1) ? 'text-white font-medium' : 'text-dark-500'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-12 h-0.5 ${step >= s.num + 1 ? 'bg-primary-500' : 'bg-dark-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="glass-card p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Upload Your Resume</h2>
              <DragDrop onFileSelect={handleFileSelect} />
              <button
                onClick={handleUpload}
                disabled={!file}
                className="btn-primary w-full mt-6"
              >
                Upload & Extract Text →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Uploading */}
        {step === 2 && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-3 border-primary-500/30 border-t-primary-500 animate-spin" />
            <h2 className="text-xl font-semibold text-white mb-2">Extracting Text...</h2>
            <p className="text-dark-400">Parsing your resume file, please wait.</p>
          </div>
        )}

        {/* Step 3: Job Description */}
        {step === 3 && (
          <div className="animate-slide-up">
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Resume uploaded!</h2>
                  <p className="text-sm text-dark-400">{fileName}</p>
                </div>
              </div>

              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-dark-300 mb-2">
                  Job Description
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={10}
                  className="input-field resize-none"
                />
                <p className="text-xs text-dark-500 mt-2">
                  {jobDescription.length} characters
                  {jobDescription.length < 20 ? ' (minimum 20)' : ''}
                </p>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={jobDescription.trim().length < 20}
                className="btn-primary w-full mt-6"
              >
                Analyze Against This Job →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Analyzing */}
        {step === 4 && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-3 border-primary-500/20" />
              <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary-500 animate-spin" />
              <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-accent-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Resume...</h2>
            <p className="text-dark-400">AI is comparing your resume against the job description.</p>
            <p className="text-sm text-dark-500 mt-2">This may take a few seconds.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
