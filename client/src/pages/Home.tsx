  import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link as LinkIcon, Copy, QrCode, Calendar, Lock, Globe } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  customAlias?: string;
  expiresAt?: string;
  isPasswordProtected: boolean;
  qrCode: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/urls', {
        originalUrl,
        customAlias: customAlias || undefined,
        expiresAt: expiresAt || undefined,
        isPasswordProtected,
        password: isPasswordProtected ? password : undefined
      });

      setShortenedUrl(response.data.url);
      toast.success('URL shortened successfully!');
      
      // Reset form
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setIsPasswordProtected(false);
      setPassword('');
      setShowAdvanced(false);
      
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to shorten URL';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getFullShortUrl = (shortUrl: string) => {
    return `${window.location.origin}/${shortUrl}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <LinkIcon className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6 leading-tight">
            Shorten Your URLs
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create short, memorable links that are easy to share. Track clicks, 
            protect with passwords, and set expiration dates.
          </p>
        </div>

        {/* URL Shortening Form */}
        <div className="card max-w-3xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="card-header text-center pb-8">
            <h2 className="card-title text-3xl font-bold text-gray-900 mb-3">Shorten a URL</h2>
            <p className="card-description text-lg text-gray-600">
              {user ? 'Create and manage your shortened URLs' : 'Create a shortened URL (guest users welcome)'}
            </p>
          </div>
          <div className="card-content px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Original URL Input */}
              <div className="space-y-3">
                <label htmlFor="originalUrl" className="block text-lg font-semibold text-gray-800 mb-3">
                  Original URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="originalUrl"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very-long-url-that-needs-shortening"
                    className="input text-lg py-4 px-6 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="flex items-center justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="inline-flex items-center space-x-2 text-lg text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:bg-blue-50 px-6 py-3 rounded-full"
                >
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                  <svg 
                    className={`w-5 h-5 transform transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-6 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                  {/* Custom Alias */}
                  <div className="space-y-3">
                    <label htmlFor="customAlias" className="block text-lg font-semibold text-gray-800 mb-3">
                      Custom Alias <span className="text-gray-500 text-sm">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="customAlias"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      placeholder="my-custom-link"
                      className="input text-lg py-4 px-6 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl"
                      pattern="[a-zA-Z0-9_-]+"
                      title="Only letters, numbers, hyphens, and underscores allowed"
                    />
                  </div>

                  {/* Expiration Date */}
                  <div className="space-y-3">
                    <label htmlFor="expiresAt" className="block text-lg font-semibold text-gray-800 mb-3">
                      Expiration Date <span className="text-gray-500 text-sm">(optional)</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="expiresAt"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="input text-lg py-4 px-6 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl"
                    />
                  </div>

                  {/* Password Protection */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        id="isPasswordProtected"
                        checked={isPasswordProtected}
                        onChange={(e) => setIsPasswordProtected(e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                      />
                      <label htmlFor="isPasswordProtected" className="text-lg font-semibold text-gray-800">
                        Password Protect Link
                      </label>
                    </div>
                    
                    {isPasswordProtected && (
                      <div className="space-y-3 pl-9">
                        <label htmlFor="password" className="block text-lg font-semibold text-gray-800 mb-3">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="input text-lg py-4 px-6 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl"
                          required={isPasswordProtected}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Shortening...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <LinkIcon className="h-6 w-6" />
                      <span>Shorten URL</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Result Section */}
        {shortenedUrl && (
          <div className="card max-w-3xl mx-auto mt-12 shadow-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="card-header text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="card-title text-3xl font-bold text-green-700 mb-2">URL Shortened Successfully!</h3>
              <p className="text-green-600">Your link is ready to share!</p>
            </div>
            <div className="card-content px-8 pb-8 space-y-6">
              {/* Shortened URL */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-800 mb-3">Shortened URL</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={getFullShortUrl(shortenedUrl.shortUrl)}
                    readOnly
                    className="input flex-1 text-lg py-4 px-6 bg-gray-50 border-2 border-green-200 text-green-800 font-mono rounded-xl"
                  />
                  <button
                    onClick={() => copyToClipboard(getFullShortUrl(shortenedUrl.shortUrl))}
                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-colors duration-200 hover:shadow-lg"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">QR Code</label>
                <img 
                  src={shortenedUrl.qrCode} 
                  alt="QR Code" 
                  className="mx-auto border rounded-lg"
                  style={{ width: '150px', height: '150px' }}
                />
              </div>

              {/* URL Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Original: {shortenedUrl.originalUrl}</span>
                </div>
                
                {shortenedUrl.customAlias && (
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Alias: {shortenedUrl.customAlias}</span>
                  </div>
                )}
                
                {shortenedUrl.expiresAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Expires: {new Date(shortenedUrl.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {shortenedUrl.isPasswordProtected && (
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Password Protected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-24 mb-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our URL Shortener?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional features designed to make link management simple and effective
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <LinkIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick & Easy</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Shorten URLs in seconds with our intuitive interface. No registration required for basic use.</p>
            </div>
            
            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <QrCode className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">QR Codes</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Generate QR codes instantly for easy mobile sharing and offline access to your links.</p>
            </div>
            
            <div className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Private</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Password protect your links, set expiration dates, and control access to your content.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
