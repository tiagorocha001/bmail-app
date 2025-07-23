import React, { useState, useEffect, useMemo } from 'react';
import { Search, Mail, Send, Trash2, Edit, Star, StarOff, Reply, Forward, Settings, User, Menu, X, ChevronLeft } from 'lucide-react';

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
  icon: React.ComponentType;
  count: number;
}

// Frozen time: March 14th, 2030 @ 3:14 PM
const FROZEN_TIME = new Date('2030-03-14T15:14:00');

// Mock data that resets to the same state every time
const generateInitialEmails = (): Email[] => [
  {
    id: 1,
    from: 'Gmail Team',
    to: 'me@matrices.ai',
    subject: 'Welcome to your new Gmail',
    body: 'Welcome! Your new Gmail account is ready to use. You can now send and receive emails, organize your inbox, and much more.',
    timestamp: new Date('2030-03-14T10:30:00'),
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    hasAttachment: false
  },
  {
    id: 2,
    from: 'Amazon',
    to: 'me@matrices.ai',
    subject: 'Your order has shipped',
    body: 'Good news! Your recent order has been shipped and is on its way to you.',
    timestamp: new Date('2030-03-13T16:45:00'),
    isRead: true,
    isStarred: true,
    folder: 'inbox',
    hasAttachment: false
  },
  {
    id: 3,
    from: 'Sarah Johnson, Mike Chen',
    to: 'me@matrices.ai',
    subject: 'Re: Team meeting tomorrow',
    body: 'Yes, please bring the Q4 reports. Also, let\'s discuss the new project timeline.',
    timestamp: new Date('2030-03-13T14:22:00'),
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    hasAttachment: false
  },
  {
    id: 4,
    from: 'Alex Rivera, You',
    to: 'me@matrices.ai',
    subject: 'Re: Dinner plans this weekend?',
    body: 'How about 7 PM? I\'ll make a reservation for us.',
    timestamp: new Date('2030-03-12T11:15:00'),
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    hasAttachment: false
  },
  {
    id: 5,
    from: 'Tech News',
    to: 'me@matrices.ai',
    subject: 'Newsletter: Weekly updates',
    body: 'Here are this week\'s top tech stories and updates from around the industry.',
    timestamp: new Date('2030-03-11T09:00:00'),
    isRead: true,
    isStarred: false,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [composeData, setComposeData] = useState<ComposeData>({
    to: '',
    subject: '',
    body: ''
  });

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
    setIsSidebarOpen(false); // Close sidebar on mobile when email is selected
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
    setIsSidebarOpen(false); // Close sidebar on mobile when composing
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

  const handleFolderClick = (folderId: string): void => {
    setCurrentView(folderId);
    setIsSidebarOpen(false); // Close sidebar on mobile when folder is selected
  };

  const folders: Folder[] = [
    { id: 'inbox', name: 'Inbox', icon: Mail, count: emails.filter(e => e.folder === 'inbox').length },
    { id: 'starred', name: 'Starred', icon: Star, count: emails.filter(e => e.isStarred).length },
    { id: 'sent', name: 'Sent', icon: Send, count: emails.filter(e => e.folder === 'sent').length },
    { id: 'drafts', name: 'All Mail', icon: Edit, count: drafts.length },
    { id: 'spam', name: 'Spam', icon: Trash2, count: 1 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: emails.filter(e => e.folder === 'trash').length }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
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
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-14 md:h-16 px-3 md:px-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-sm flex items-center justify-center">
              <Mail className="h-3 w-3 md:h-5 md:w-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-normal text-gray-700">BMail</span>
          </div>
        </div>
        
        <div className="flex-1 max-w-2xl mx-2 md:mx-8">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:shadow-md rounded-full transition-all duration-200 outline-none text-sm md:text-base"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full hidden md:block">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
          <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium">
            {user.avatar}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 md:z-0 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out h-full`}>
          <div className="p-4 md:p-6">
            <button
              onClick={handleCompose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 md:py-3 px-4 md:px-6 rounded-full transition-colors flex items-center justify-center space-x-2 shadow-md text-sm md:text-base"
            >
              <Edit className="h-4 w-4 md:h-5 md:w-5" />
              <span>Compose</span>
            </button>
          </div>

          <nav className="flex-1 px-3">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = currentView === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  className={`w-full flex items-center px-3 md:px-4 py-2.5 md:py-2 rounded-full text-sm transition-colors ${
                    isActive 
                      ? 'bg-blue-100 font-bold' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon />
                  <span className="flex-1 text-left ml-2 md:ml-1.5">{folder.name}</span>
                  {folder.count > 0 && folder.id === 'inbox' && (
                    <span className="text-sm font-medium">
                      {folder.count}
                    </span>
                  )}
                  {folder.id === 'spam' && (
                    <span className="text-sm font-medium">
                      1
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Email List */}
          {!selectedEmail && !isComposing && (
            <div className="flex-1 overflow-y-auto bg-white">
              {filteredEmails.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
                  <p className="text-gray-500 text-sm md:text-base">
                    {searchQuery ? 'Try adjusting your search terms' : 'Your inbox is empty'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={`flex items-center px-3 md:px-6 py-3 md:py-2 hover:shadow-md cursor-pointer transition-all border-b border-gray-100 ${
                        !email.isRead ? 'bg-white shadow-sm' : 'bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarToggle(email.id, email.isStarred);
                        }}
                        className="mr-3 md:mr-4 hover:bg-gray-200 p-1 rounded flex-shrink-0"
                      >
                        {email.isStarred ? (
                          <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center">
                        <div className="md:w-48 flex-shrink-0 mb-1 md:mb-0">
                          <span className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'} truncate block`}>
                            {currentView === 'sent' ? email.to : email.from}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0 md:mx-4">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <span className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'} truncate block md:inline`}>
                              {email.subject}
                            </span>
                            <span className="text-sm text-gray-500 md:ml-2 truncate block md:inline">
                              {window.innerWidth < 768 ? '' : '- '}{email.body.split('\n')[0].substring(0, window.innerWidth < 768 ? 60 : 100)}
                              {email.body.split('\n')[0].length > (window.innerWidth < 768 ? 60 : 100) ? '...' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 text-right mt-1 md:mt-0">
                          <span className="text-xs text-gray-500">{formatTime(email.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Email Detail View */}
          {selectedEmail && !isComposing && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="border-b border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    <span className="hidden md:inline">Back</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStarToggle(selectedEmail.id, selectedEmail.isStarred)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {selectedEmail.isStarred ? (
                        <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      )}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Reply className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg hidden md:block">
                      <Forward className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmail(selectedEmail.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <h1 className="text-lg md:text-xl font-normal text-gray-900 mb-4 break-words">{selectedEmail.subject}</h1>
                <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-600 space-y-1 md:space-y-0">
                  <div className="flex items-center">
                    <span className="font-medium truncate">{selectedEmail.from}</span>
                    <span className="mx-2 hidden md:inline">to</span>
                  </div>
                  <div className="flex items-center md:flex-1">
                    <span className="md:hidden text-gray-500 mr-2">to</span>
                    <span className="truncate">{selectedEmail.to}</span>
                    <span className="ml-auto text-xs">{formatTime(selectedEmail.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  {selectedEmail.body.split('\n').map((line: string, index: number) => (
                    <p key={index} className="mb-3 text-gray-700 leading-relaxed text-sm md:text-base break-words">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compose View */}
          {isComposing && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="border-b border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg md:text-xl font-normal text-gray-900">New Message</h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveDraft}
                      className="px-3 md:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                    >
                      <span className="hidden md:inline">Save Draft</span>
                      <span className="md:hidden">Save</span>
                    </button>
                    <button
                      onClick={handleSendEmail}
                      className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setIsComposing(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col p-4 md:p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center border-b border-gray-200 pb-2">
                    <label className="w-12 text-sm text-gray-600 flex-shrink-0">To</label>
                    <input
                      type="email"
                      value={composeData.to}
                      onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                      className="flex-1 outline-none text-sm min-w-0"
                      placeholder="Recipients"
                    />
                  </div>
                  <div className="flex items-center border-b border-gray-200 pb-2">
                    <label className="w-12 text-sm text-gray-600 flex-shrink-0">Subject</label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                      className="flex-1 outline-none text-sm min-w-0"
                      placeholder="Subject"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                    className="w-full h-full outline-none resize-none text-sm leading-relaxed"
                    placeholder="Compose email"
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