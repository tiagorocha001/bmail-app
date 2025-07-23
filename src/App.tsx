import React, { useState, useEffect, useMemo } from 'react';
import { Search, Mail, Send, Trash2, Edit, Star, StarOff, Reply, Forward, MoreVertical, Paperclip, Bold, Italic, Underline, Link, Image, Smile, Settings, User, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Type definitions
interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Email {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  folder: string;
  hasAttachment: boolean;
}

interface ComposeData {
  to: string;
  subject: string;
  body: string;
}

interface Folder {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  count: number;
}

// Frozen time: March 14th, 2030 @ 3:14 PM
const FROZEN_TIME = new Date('2030-03-14T15:14:00');

// Mock data that resets to the same state every time
const generateInitialEmails = (): Email[] => [
  {
    id: 1,
    from: 'john.doe@company.com',
    to: 'me@matrices.ai',
    subject: 'Q1 Performance Review',
    body: 'Hi there,\n\nI wanted to discuss your performance in Q1. Overall, you\'ve done excellent work on the project deliverables.\n\nLet\'s schedule a meeting to go over the details.\n\nBest regards,\nJohn',
    timestamp: new Date('2030-03-14T10:30:00'),
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    hasAttachment: true
  },
  {
    id: 2,
    from: 'sarah.wilson@matrices.ai',
    to: 'me@matrices.ai',
    subject: 'Welcome to the team!',
    body: 'Welcome to Matrices! We\'re excited to have you join our engineering team.\n\nYour first day orientation is scheduled for Monday at 9 AM. Please bring your ID and any necessary documents.\n\nLooking forward to working with you!\n\nSarah Wilson\nHR Manager',
    timestamp: new Date('2030-03-13T16:45:00'),
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    hasAttachment: false
  },
  {
    id: 3,
    from: 'notifications@github.com',
    to: 'me@matrices.ai',
    subject: '[matrices-ai/bmail] New pull request #42',
    body: 'A new pull request has been opened:\n\nFeat: Add email search functionality\n\nThis PR adds comprehensive search capabilities to the BMail application including:\n- Subject line search\n- Sender search\n- Full-text search\n- Date range filtering\n\nPlease review when you have time.',
    timestamp: new Date('2030-03-13T14:22:00'),
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    hasAttachment: false
  },
  {
    id: 4,
    from: 'me@matrices.ai',
    to: 'client@business.com',
    subject: 'Project Update - March 2030',
    body: 'Dear Client,\n\nI hope this email finds you well. I wanted to provide you with an update on our current project status.\n\nWe have completed the initial development phase and are now moving into testing. The deliverables are on track for the end-of-month deadline.\n\nPlease let me know if you have any questions.\n\nBest regards,\nYour Name',
    timestamp: new Date('2030-03-12T11:15:00'),
    isRead: true,
    isStarred: false,
    folder: 'sent',
    hasAttachment: false
  },
  {
    id: 5,
    from: 'team@matrices.ai',
    to: 'me@matrices.ai',
    subject: 'Important: Security Update Required',
    body: 'Action Required: Please update your password\n\nWe\'ve detected some unusual activity on your account. As a precautionary measure, please update your password immediately.\n\nClick here to update your password: [Update Password]\n\nIf you have any questions, please contact our security team.\n\nMatrices Security Team',
    timestamp: new Date('2030-03-11T09:00:00'),
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    hasAttachment: false
  }
];

const generateInitialDrafts = (): Email[] => [
  {
    id: 101,
    from: 'me@matrices.ai',
    to: 'manager@matrices.ai',
    subject: 'Weekly Status Report - Draft',
    body: 'Hi Manager,\n\nHere\'s my weekly status report:\n\n- Completed the email client replica\n- Fixed bugs in the search functionality\n- Started working on...',
    timestamp: new Date('2030-03-14T12:30:00'),
    isRead: true,
    isStarred: false,
    folder: 'drafts',
    hasAttachment: false
  }
];

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [drafts, setDrafts] = useState<Email[]>([]);
  const [currentView, setCurrentView] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [composeData, setComposeData] = useState<ComposeData>({
    to: '',
    subject: '',
    body: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const userData: User = {
      name: 'Alex Chen',
      email: 'me@matrices.ai',
      avatar: 'AC'
    };
    setUser(userData);
    setEmails(generateInitialEmails());
    setDrafts(generateInitialDrafts());
  }, []);

  // Filter emails based on current view and search
  const filteredEmails = useMemo(() => {
    let emailsToShow: Email[] = [];
    
    if (currentView === 'inbox') {
      emailsToShow = emails.filter(email => email.folder === 'inbox');
    } else if (currentView === 'sent') {
      emailsToShow = emails.filter(email => email.folder === 'sent');
    } else if (currentView === 'drafts') {
      emailsToShow = drafts;
    } else if (currentView === 'starred') {
      emailsToShow = emails.filter(email => email.isStarred);
    } else if (currentView === 'trash') {
      emailsToShow = emails.filter(email => email.folder === 'trash');
    }

    if (searchQuery) {
      emailsToShow = emailsToShow.filter(email => 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return emailsToShow.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [emails, drafts, currentView, searchQuery]);

  const formatTime = (timestamp: Date): string => {
    const date = new Date(timestamp);
    const now = FROZEN_TIME;
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleEmailClick = (email: Email): void => {
    setSelectedEmail(email);
    if (!email.isRead && email.folder !== 'sent' && email.folder !== 'drafts') {
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, isRead: true } : e
      ));
    }
  };

  const handleStarToggle = (emailId: number, isStarred: boolean): void => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !isStarred } : email
    ));
  };

  const handleCompose = (): void => {
    setIsComposing(true);
    setSelectedEmail(null);
    setComposeData({ to: '', subject: '', body: '' });
  };

  const handleSendEmail = (): void => {
    if (composeData.to && composeData.subject && user) {
      const newEmail: Email = {
        id: Date.now(),
        from: user.email,
        to: composeData.to,
        subject: composeData.subject,
        body: composeData.body,
        timestamp: FROZEN_TIME,
        isRead: true,
        isStarred: false,
        folder: 'sent',
        hasAttachment: false
      };
      
      setEmails(prev => [...prev, newEmail]);
      setIsComposing(false);
      setComposeData({ to: '', subject: '', body: '' });
    }
  };

  const handleSaveDraft = (): void => {
    if ((composeData.to || composeData.subject || composeData.body) && user) {
      const newDraft: Email = {
        id: Date.now(),
        from: user.email,
        to: composeData.to,
        subject: composeData.subject || '(No Subject)',
        body: composeData.body,
        timestamp: FROZEN_TIME,
        isRead: true,
        isStarred: false,
        folder: 'drafts',
        hasAttachment: false
      };
      
      setDrafts(prev => [...prev, newDraft]);
      setIsComposing(false);
      setComposeData({ to: '', subject: '', body: '' });
    }
  };

  const handleDeleteEmail = (emailId: number): void => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, folder: 'trash' } : email
    ));
    setSelectedEmail(null);
  };

  const folders: Folder[] = [
    { id: 'inbox', name: 'Inbox', icon: Mail, count: emails.filter(e => e.folder === 'inbox').length },
    { id: 'starred', name: 'Starred', icon: Star, count: emails.filter(e => e.isStarred).length },
    { id: 'sent', name: 'Sent', icon: Send, count: emails.filter(e => e.folder === 'sent').length },
    { id: 'drafts', name: 'Drafts', icon: Edit, count: drafts.length },
    { id: 'trash', name: 'Trash', icon: Trash2, count: emails.filter(e => e.folder === 'trash').length }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="text-center mb-6">
            <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">BMail</h1>
            <p className="text-gray-600">Secure Email Platform</p>
          </div>
          <button
            onClick={() => setUser({ name: 'Alex Chen', email: 'me@matrices.ai', avatar: 'AC' })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center'}`}>
              <Mail className="h-8 w-8 text-blue-600" />
              {sidebarOpen && <span className="ml-2 text-xl font-bold text-gray-900">BMail</span>}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <button
            onClick={handleCompose}
            className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center ${sidebarOpen ? 'justify-center' : 'justify-center'} mb-6`}
          >
            <Edit className="h-5 w-5" />
            {sidebarOpen && <span className="ml-2">Compose</span>}
          </button>

          <nav className="space-y-2">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = currentView === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setCurrentView(folder.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 flex-1 text-left">{folder.name}</span>
                      {folder.count > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isActive ? 'bg-blue-200' : 'bg-gray-200'
                        }`}>
                          {folder.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.avatar}
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 capitalize">{currentView}</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Email List */}
          {!selectedEmail && !isComposing && (
            <div className="flex-1 overflow-y-auto">
              {filteredEmails.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms' : 'Your inbox is empty'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !email.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStarToggle(email.id, email.isStarred);
                            }}
                            className="hover:bg-gray-200 p-1 rounded"
                          >
                            {email.isStarred ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <span className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {currentView === 'sent' ? email.to : email.from}
                          </span>
                          {email.hasAttachment && <Paperclip className="h-4 w-4 text-gray-400" />}
                        </div>
                        <span className="text-xs text-gray-500">{formatTime(email.timestamp)}</span>
                      </div>
                      <h3 className={`text-sm mb-1 ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {email.subject}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {email.body.split('\n')[0]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Email Detail View */}
          {selectedEmail && !isComposing && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStarToggle(selectedEmail.id, selectedEmail.isStarred)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {selectedEmail.isStarred ? (
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Reply className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Forward className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmail(selectedEmail.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">{selectedEmail.subject}</h1>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">{selectedEmail.from}</span>
                  <span className="mx-2">to</span>
                  <span>{selectedEmail.to}</span>
                  <span className="ml-auto">{formatTime(selectedEmail.timestamp)}</span>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="prose max-w-none">
                  {selectedEmail.body.split('\n').map((line: string, index: number) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compose View */}
          {isComposing && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-gray-900">Compose Email</h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveDraft}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={handleSendEmail}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setIsComposing(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col p-4">
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="email"
                      value={composeData.to}
                      onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="recipient@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter subject"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                    className="w-full h-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Write your message here..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
