import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Store, Code, LogOut, LogIn, PlusCircle, Trash2, Edit, 
  Megaphone, Star, Download, Tag, Calendar, Check, Menu, X, ArrowLeft, 
  Globe, Info, Laptop, Activity, ShieldAlert, HeartPulse, Sparkles, 
  Shirt, MessageCircle, PlayCircle, ShoppingBag, GraduationCap, MapPin, 
  User, CheckCircle, AlertCircle, Eye, EyeOff
} from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:9090'
  : window.location.origin;
const ADMIN_APP_OWNER_EMAIL = 'developer@gmail.com';

function App() {
  // State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentTab, setCurrentTab] = useState('store'); // 'store' | 'dev' | 'auth'
  const [sidebarTab, setSidebarTab] = useState('store'); // 'store' | 'manage' | 'notifications'
  const [manageTab, setManageTab] = useState('installed'); // 'installed' | 'developer'
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // App Listings Catalog
  const [apps, setApps] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  
  // Installed Apps Tracking
  const [installedApps, setInstalledApps] = useState(() => {
    if (!currentUser) return {};
    const saved = localStorage.getItem(`installed_apps_versions_${currentUser.email}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [installedAppDetails, setInstalledAppDetails] = useState([]);

  // App Details Modal
  const [activeApp, setActiveApp] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReviewRating, setSelectedReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hoveredReviewRating, setHoveredReviewRating] = useState(0);
  
  // Admin stats and listings
  const [devApps, setDevApps] = useState([]);
  const [devReviews, setDevReviews] = useState([]);
  const [devStats, setDevStats] = useState({ totalApps: 0, totalDownloads: 0, avgRating: '0.0' });
  
  // Modal toggles
  const [showAppForm, setShowAppForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateAppTarget, setUpdateAppTarget] = useState(null);
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // UI states
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Forms states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('USER');
  const [loginError, setLoginError] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('USER');
  const [registerError, setRegisterError] = useState('');
  
  // App Publish Form
  const [appFormName, setAppFormName] = useState('');
  const [appFormCategory, setAppFormCategory] = useState('Games');
  const [appFormDesc, setAppFormDesc] = useState('');
  const [appFormVersion, setAppFormVersion] = useState('1.0.0');
  const [appFormDate, setAppFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appFormIcon, setAppFormIcon] = useState('');
  const [appFormScreenshot, setAppFormScreenshot] = useState('');
  const [appFormStorageSize, setAppFormStorageSize] = useState('100 MB');
  
  // App Update Announcement Form
  const [updateVersion, setUpdateVersion] = useState('');
  const [updateDate, setUpdateDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [updateDesc, setUpdateDesc] = useState('');

  // Refs for closing dropdowns on click outside
  const userMenuRef = useRef(null);
  const notificationBellRef = useRef(null);

  // Load installed apps from backend
  const loadInstalledApps = async (email) => {
    if (!email) return;
    try {
      const data = await apiRequest(`/apps/installed/map?userEmail=${encodeURIComponent(email)}`);
      if (data) {
        setInstalledApps(data);
        localStorage.setItem(`installed_apps_versions_${email}`, JSON.stringify(data));
      }
      const installedList = await apiRequest(`/apps/installed?userEmail=${encodeURIComponent(email)}`);
      setInstalledAppDetails(installedList || []);
    } catch (e) {
      console.error('Failed to load installed apps map', e);
    }
  };

  // Sync installed apps local storage when user changes
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`installed_apps_versions_${currentUser.email}`);
      if (saved) {
        setInstalledApps(JSON.parse(saved));
      }
      loadInstalledApps(currentUser.email);
      if (currentUser.role === 'OWNER') {
        setManageTab('developer');
      } else {
        setManageTab('installed');
      }
    } else {
      setInstalledApps({});
      setInstalledAppDetails([]);
      setManageTab('installed');
    }
  }, [currentUser]);

  // Load apps catalog whenever categories, queries, or rating filters change
  useEffect(() => {
    if (currentTab === 'store') {
      loadAppsCatalog();
    }
  }, [selectedCategory, minRatingFilter, searchQuery, currentTab]);

  // Load Admin Dashboard data
  useEffect(() => {
    if (sidebarTab === 'manage' && manageTab === 'developer' && currentUser && currentUser.role === 'OWNER') {
      loadDeveloperDashboard();
    }
  }, [sidebarTab, manageTab, currentUser]);

  // Polling notifications
  useEffect(() => {
    let interval = null;
    if (currentUser) {
      loadUserNotifications();
      interval = setInterval(loadUserNotifications, 10000);
    } else {
      setNotifications([]);
      setUnreadNotifications(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser]);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dynamic toast alerts
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const renderNotificationBadge = (className = 'nav-notification-badge') => {
    if (unreadNotifications <= 0) return null;
    return (
      <span className={className} aria-label={`${unreadNotifications} unread notifications`}>
        {unreadNotifications > 99 ? '99+' : unreadNotifications}
      </span>
    );
  };

  // Safe API Request handler
  const apiRequest = async (endpoint, options = {}) => {
    const defaultHeaders = {};
    if (currentUser && currentUser.token) {
      defaultHeaders['Authorization'] = `Bearer ${currentUser.token}`;
    }
    
    if (options.body && !(options.body instanceof URLSearchParams)) {
      defaultHeaders['Content-Type'] = 'application/json';
      if (typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
    }

    options.headers = { ...defaultHeaders, ...options.headers };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server Error');
      }
      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch (e) {
        return text;
      }
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  };

  // Fetch catalog
  const loadAppsCatalog = async () => {
    setIsLoadingApps(true);
    try {
      let endpoint = `/apps/search?onlyVisible=true`;
      if (searchQuery) endpoint += `&name=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory && selectedCategory !== 'all') endpoint += `&category=${encodeURIComponent(selectedCategory)}`;
      if (minRatingFilter > 0) endpoint += `&rating=${minRatingFilter}`;

      const data = await apiRequest(endpoint);
      setApps(data || []);
    } catch (e) {
      showToast('Failed to load apps catalog', 'error');
      setApps([]);
    } finally {
      setIsLoadingApps(false);
    }
  };

  // Download / Update App
  const downloadApp = async (e, app) => {
    e.stopPropagation(); // Avoid triggering openAppDetails
    if (!currentUser) {
      showToast('Please Sign In to install applications.', 'info');
      switchTab('auth');
      return;
    }
    const isUpdate = (installedApps[app.id] || installedApps[String(app.id)]) !== undefined;

    try {
      showToast(isUpdate ? 'Downloading update...' : 'Installing application...', 'info');
      
      await apiRequest(`/apps/${app.id}/download?userEmail=${encodeURIComponent(currentUser.email)}`, {
        method: 'POST'
      });

      await loadInstalledApps(currentUser.email);
      await loadUserNotifications();
      
      showToast(isUpdate ? `${app.appName} updated successfully!` : `${app.appName} installed successfully!`, 'success');
      loadAppsCatalog();
      
      if (activeApp && activeApp.id === app.id) {
        // Refresh details modal if open
        openAppDetails(app.id);
      }
    } catch (err) {
      showToast('Failed to complete download', 'error');
    }
  };

  // Uninstall App
  const uninstallApp = async (e, app) => {
    if (e) e.stopPropagation();
    if (!currentUser) return;

    try {
      showToast('Uninstalling application...', 'info');
      
      await apiRequest(`/apps/${app.id}/uninstall?userEmail=${encodeURIComponent(currentUser.email)}`, {
        method: 'POST'
      });

      await loadInstalledApps(currentUser.email);
      
      showToast(`${app.appName} uninstalled successfully!`, 'success');
      loadAppsCatalog();
      
      if (activeApp && activeApp.id === app.id) {
        openAppDetails(app.id);
      }
    } catch (err) {
      showToast('Failed to uninstall app', 'error');
    }
  };

  // Fetch Admin dashboard content
  const loadDeveloperDashboard = async () => {
    if (!currentUser || currentUser.role !== 'OWNER') return;
    try {
      const devAppsList = await apiRequest(`/apps/owner?developerEmail=${encodeURIComponent(ADMIN_APP_OWNER_EMAIL)}`);
      setDevApps(devAppsList || []);

      const totalAppsCount = devAppsList.length;
      let downloadsSum = 0;
      let totalRatingSum = 0;
      let ratedAppsCount = 0;
      const appIds = [];

      devAppsList.forEach(app => {
        downloadsSum += app.downloads;
        if (app.rating > 0) {
          totalRatingSum += app.rating;
          ratedAppsCount++;
        }
        appIds.push(app.id);
      });

      const avg = ratedAppsCount > 0 ? (totalRatingSum / ratedAppsCount).toFixed(1) : '0.0';
      setDevStats({
        totalApps: totalAppsCount,
        totalDownloads: downloadsSum,
        avgRating: `${avg} ★`
      });

      if (appIds.length > 0) {
        const commentsList = await apiRequest('/reviews/apps', {
          method: 'POST',
          body: appIds
        });
        setDevReviews(commentsList || []);
      } else {
        setDevReviews([]);
      }
    } catch (e) {
      showToast('Failed to load admin stats', 'error');
    }
  };

  // Toggle admin app visibility
  const handleToggleAppVisibility = async (appId, checked) => {
    try {
      await apiRequest(`/apps/${appId}/visibility?visible=${checked}`, {
        method: 'PUT'
      });
      showToast(`App visibility changed to ${checked ? 'Visible' : 'Hidden'}`, 'success');
      loadDeveloperDashboard();
      loadAppsCatalog();
      if (currentUser) loadInstalledApps(currentUser.email);
    } catch (e) {
      showToast('Failed to update app visibility', 'error');
    }
  };

  // Delete App
  const handleDeleteApp = async (appId) => {
    if (!window.confirm('Are you sure you want to permanently delete this application? All ratings and reviews will be lost.')) {
      return;
    }
    try {
      await apiRequest(`/apps/${appId}`, { method: 'DELETE' });
      showToast('Application deleted successfully', 'success');
      loadDeveloperDashboard();
      loadAppsCatalog();
    } catch (e) {
      showToast('Failed to delete application', 'error');
    }
  };

  // Open app details modal
  const openAppDetails = async (appId) => {
    try {
      const appData = await apiRequest(`/apps/${appId}`);
      setActiveApp(appData);
      setSelectedReviewRating(0);
      setReviewComment('');
      
      const reviewsData = await apiRequest(`/reviews/${appId}`);
      setReviews(reviewsData || []);
    } catch (e) {
      showToast('Failed to load application details', 'error');
    }
  };

  // Close app details
  const closeAppDetails = () => {
    setActiveApp(null);
    setReviews([]);
  };

  // Submit App Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (selectedReviewRating === 0) {
      showToast('Please select a star rating first', 'info');
      return;
    }

    try {
      await apiRequest('/reviews', {
        method: 'POST',
        body: {
          appId: activeApp.id,
          username: currentUser.name,
          comment: reviewComment,
          rating: selectedReviewRating
        }
      });

      showToast('Review submitted successfully!', 'success');
      setSelectedReviewRating(0);
      setReviewComment('');

      // Refresh reviews list
      const reviewsData = await apiRequest(`/reviews/${activeApp.id}`);
      setReviews(reviewsData || []);

      // Refresh parent app details
      const appData = await apiRequest(`/apps/${activeApp.id}`);
      setActiveApp(appData);
      loadAppsCatalog();
    } catch (err) {
      showToast('Failed to submit review', 'error');
    }
  };

  // Load User Notifications
  const loadUserNotifications = async () => {
    if (!currentUser) return;
    try {
      const notificationEmail = currentUser.role === 'OWNER' ? ADMIN_APP_OWNER_EMAIL : currentUser.email;
      const list = await apiRequest(`/notifications?email=${encodeURIComponent(notificationEmail)}`);
      const nextNotifications = list || [];
      setNotifications(nextNotifications);
      
      let count = 0;
      nextNotifications.forEach(n => { if (!n.readStatus) count++; });
      setUnreadNotifications(count);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const openNotificationsPanel = () => {
    setSidebarTab('notifications');
    setMobileMenuOpen(false);
    if (currentUser) loadUserNotifications();
  };

  // Mark notification as read
  const handleMarkNotificationRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
      loadUserNotifications();
    } catch (e) {
      console.error('Failed to read notification', e);
    }
  };

  // Auth Handler: Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.endsWith('@gmail.com')) {
      setLoginError('Email must be a Gmail address ending in @gmail.com');
      showToast('Login failed: Invalid email domain', 'error');
      return;
    }

    try {
      const authData = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email: loginEmail, password: loginPassword }
      });

      if (authData.role !== loginRole) {
        throw new Error(`Account type mismatch. The credentials entered belong to a ${authData.role === 'OWNER' ? 'Admin' : 'Standard User'}.`);
      }

      setCurrentUser(authData);
      localStorage.setItem('currentUser', JSON.stringify(authData));
      
      showToast(`Welcome back, ${authData.name}!`, 'success');
      setLoginEmail('');
      setLoginPassword('');
      switchTab(authData.role === 'OWNER' ? 'dev' : 'store');
    } catch (error) {
      setLoginError(error.message || 'Invalid email or password');
      showToast('Login failed', 'error');
    }
  };

  // Auth Handler: Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerEmail.endsWith('@gmail.com')) {
      setRegisterError('Email must be a Gmail address ending in @gmail.com');
      showToast('Registration failed: Invalid email domain', 'error');
      return;
    }

    try {
      await apiRequest('/users/register', {
        method: 'POST',
        body: { 
          name: registerName, 
          email: registerEmail, 
          password: registerPassword, 
          role: registerRole 
        }
      });

      showToast('Registration successful! Please Sign In.', 'success');
      setAuthTab('login');
      setLoginEmail(registerEmail);
      setLoginPassword('');
      setLoginRole(registerRole);
      
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    } catch (error) {
      setRegisterError(error.message || 'Registration failed. Email might already exist.');
      showToast('Registration failed', 'error');
    }
  };

  // Log out
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowUserDropdown(false);
    switchTab('store');
    showToast('Logged out successfully', 'info');
  };

  // Switch tabs
  const switchTab = (tabName) => {
    if (tabName === 'auth') {
      setCurrentTab('auth');
    } else if (tabName === 'store') {
      setCurrentTab('store');
      setSidebarTab('store');
    } else if (tabName === 'dev') {
      setCurrentTab('dev');
      setSidebarTab('manage');
      setManageTab('developer');
    }
    setMobileMenuOpen(false);
    setShowNotifications(false);
  };

  // Open App Form Modal (Add / Edit)
  const openAppFormModal = (app = null) => {
    if (app) {
      setEditingApp(app);
      setAppFormName(app.appName);
      setAppFormCategory(app.category);
      setAppFormDesc(app.description || '');
      setAppFormVersion(app.version || '1.0.0');
      setAppFormDate(app.releaseDate || new Date().toISOString().split('T')[0]);
      setAppFormIcon(app.iconUrl || '');
      setAppFormScreenshot(app.screenshotUrl || '');
      setAppFormStorageSize(app.storageSize || '100 MB');
    } else {
      setEditingApp(null);
      setAppFormName('');
      setAppFormCategory('Games');
      setAppFormDesc('');
      setAppFormVersion('1.0.0');
      setAppFormDate(new Date().toISOString().split('T')[0]);
      setAppFormIcon('');
      setAppFormScreenshot('');
      setAppFormStorageSize('100 MB');
    }
    setShowAppForm(true);
  };

  // Submit App Form
  const handleAppFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'OWNER') return;

    const payload = {
      appName: appFormName,
      category: appFormCategory,
      developerName: ADMIN_APP_OWNER_EMAIL,
      description: appFormDesc,
      version: appFormVersion,
      releaseDate: appFormDate,
      iconUrl: appFormIcon,
      screenshotUrl: appFormScreenshot,
      storageSize: appFormStorageSize
    };

    try {
      if (editingApp) {
        await apiRequest(`/apps/${editingApp.id}`, {
          method: 'PUT',
          body: payload
        });
        showToast('Application updated successfully!', 'success');
      } else {
        await apiRequest('/apps', {
          method: 'POST',
          body: payload
        });
        showToast('Application published successfully!', 'success');
      }
      setShowAppForm(false);
      loadDeveloperDashboard();
      loadAppsCatalog();
      if (currentUser) loadInstalledApps(currentUser.email);
    } catch (err) {
      showToast(editingApp ? 'Failed to update app' : 'Failed to publish app', 'error');
    }
  };

  // Open App Update Modal
  const openUpdateModal = (app) => {
    setUpdateAppTarget(app);
    setUpdateVersion('');
    setUpdateDate(new Date().toISOString().split('T')[0]);
    setUpdateDesc('');
    setShowUpdateForm(true);
  };

  // Submit App Update Announcement
  const handleUpdateFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'OWNER' || !updateAppTarget) return;

    try {
      await apiRequest(`/apps/${updateAppTarget.id}/announce-update?version=${encodeURIComponent(updateVersion)}&releaseDate=${encodeURIComponent(updateDate)}&description=${encodeURIComponent(updateDesc)}`, {
        method: 'POST'
      });
      showToast('App update announced successfully!', 'success');
      setShowUpdateForm(false);
      loadDeveloperDashboard();
      loadAppsCatalog();
      if (currentUser) loadInstalledApps(currentUser.email);
      loadUserNotifications();
    } catch (err) {
      showToast('Failed to announce update', 'error');
    }
  };

  // Render Rating stars
  const getStarsIconRow = (rating) => {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    const starList = [];

    for (let i = 0; i < full; i++) starList.push(<Star key={`f-${i}`} size={13} className="text-amber-500 fill-amber-500" style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />);
    for (let i = 0; i < half; i++) starList.push(<Star key="h" size={13} className="text-amber-500" style={{ color: 'var(--warning)' }} />);
    for (let i = 0; i < empty; i++) starList.push(<Star key={`e-${i}`} size={13} className="text-gray-300" style={{ color: 'var(--text-muted)' }} />);
    
    return starList;
  };

  // Get gradient color by category
  const getCategoryGradient = (category) => {
    const colors = {
      'Games': 'linear-gradient(135deg, #f59e0b, #d97706)',
      'Beauty': 'linear-gradient(135deg, #ec4899, #db2777)',
      'Fashion': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'Women (Safety, Community & Tracking)': 'linear-gradient(135deg, #f43f5e, #be123c)',
      'Health & Fitness': 'linear-gradient(135deg, #10b981, #047857)',
      'Social Media & Communication': 'linear-gradient(135deg, #0ea5e9, #0369a1)',
      'Entertainment & Streaming': 'linear-gradient(135deg, #ef4444, #b91c1c)',
      'Shopping & E-Commerce': 'linear-gradient(135deg, #a855f7, #6b21a8)',
      'Productivity & Education': 'linear-gradient(135deg, #6366f1, #4338ca)',
      'Travel & Utilities': 'linear-gradient(135deg, #14b8a6, #0f766e)'
    };
    return colors[category] || 'linear-gradient(135deg, #64748b, #475569)';
  };

  // Get simple category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Games': return <Laptop size={16} />;
      case 'Beauty': return <Sparkles size={16} />;
      case 'Fashion': return <Shirt size={16} />;
      case 'Women (Safety, Community & Tracking)': return <HeartPulse size={16} />;
      case 'Health & Fitness': return <Activity size={16} />;
      case 'Social Media & Communication': return <MessageCircle size={16} />;
      case 'Entertainment & Streaming': return <PlayCircle size={16} />;
      case 'Shopping & E-Commerce': return <ShoppingBag size={16} />;
      case 'Productivity & Education': return <GraduationCap size={16} />;
      case 'Travel & Utilities': return <MapPin size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const getStorageLabel = (app) => app.storageSize || '100 MB';

  const getInstalledAppRows = () => {
    if (installedAppDetails.length > 0) return installedAppDetails;
    return apps.filter(a => (installedApps[a.id] || installedApps[String(a.id)]) !== undefined);
  };

  const installedRows = getInstalledAppRows();

  // Render a Single App Card
  const renderAppCard = (app) => {
    const installedVersion = installedApps[app.id] || installedApps[String(app.id)];
    const isInstalled = installedVersion !== undefined;
    const hasUpdate = isInstalled && installedVersion !== app.version;
    
    const ratingVal = app.rating ? app.rating.toFixed(1) : '0.0';
    const reviewsCount = (app.id * 17 + 5) % 120;

    return (
      <div key={app.id} className="app-card" onClick={() => openAppDetails(app.id)}>
        <div className="app-card-icon-container" style={{ background: getCategoryGradient(app.category) }}>
          {app.appName.charAt(0).toUpperCase()}
        </div>
        <div className="app-card-title" title={app.appName}>{app.appName}</div>
        <div className="app-card-rating-row">
          <span>{ratingVal}★</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span>{getStorageLabel(app)}</span>
          <span className="app-card-downloads-count" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <span>↓</span>
            <span>{app.downloads}</span>
          </span>
        </div>
        
        <div className="app-card-actions-wrapper" onClick={(e) => e.stopPropagation()}>
          {!isInstalled ? (
            <button 
              className="app-card-btn-action btn-install" 
              onClick={(e) => downloadApp(e, app)}
            >
              <Download size={12} />
              <span>Install</span>
            </button>
          ) : (
            <div className="app-card-btn-group">
              {hasUpdate ? (
                <button 
                  className="app-card-btn-action btn-update" 
                  onClick={(e) => downloadApp(e, app)}
                >
                  <Download size={12} />
                  <span>Update</span>
                </button>
              ) : (
                <button 
                  className="app-card-btn-action btn-open" 
                  onClick={() => showToast(`Opening ${app.appName}...`, 'success')}
                >
                  <Check size={12} />
                  <span>Open</span>
                </button>
              )}
              <button 
                className="app-card-btn-action btn-uninstall" 
                onClick={(e) => uninstallApp(e, app)}
              >
                <Trash2 size={12} />
                <span>Uninstall</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* 1. Header component */}
      {currentTab !== 'auth' && (
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="logo-container" onClick={() => { switchTab('store'); setSelectedCategory('all'); }}>
              <i className="fab fa-google-play logo-icon"></i>
              <span className="logo-text">Play Store</span>
            </div>
          </div>
          
          <div className="header-center">
            <div className="search-bar">
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search apps, games, and more..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="header-right">
            {currentUser ? (
              <>
                <button
                  className="icon-btn"
                  ref={notificationBellRef}
                  title="Notifications"
                  aria-label="Notifications"
                  onClick={() => {
                    setShowNotifications(true);
                    setShowUserDropdown(false);
                    loadUserNotifications();
                  }}
                >
                  <Bell size={18} />
                  {renderNotificationBadge('badge')}
                </button>
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <div className="user-menu-trigger" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                    <div className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
                    <span className="user-name">{currentUser.name}</span>
                  </div>
                  {showUserDropdown && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <span className="dropdown-header-name">{currentUser.name}</span>
                        <span className="dropdown-header-email">{currentUser.email}</span>
                        <span className="dropdown-header-role">{currentUser.role === 'OWNER' ? 'Admin' : 'User'}</span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button className="btn-auth" onClick={() => switchTab('auth')}>
                <LogIn size={14} style={{ marginRight: '6px' }} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Categories Top Horizontal Navigation Bar */}
      {currentTab !== 'auth' && (
        <div className="categories-top-bar-container">
          <div className="categories-top-bar">
            <button 
              className={`category-pill ${selectedCategory === 'all' && sidebarTab === 'store' ? 'active' : ''}`}
              onClick={() => { setSidebarTab('store'); setSelectedCategory('all'); }}
            >
              All Apps
            </button>
            {[
              'Games', 'Beauty', 'Fashion', 
              'Women (Safety, Community & Tracking)', 'Health & Fitness', 
              'Social Media & Communication', 'Entertainment & Streaming', 
              'Shopping & E-Commerce', 'Productivity & Education', 
              'Travel & Utilities'
            ].map(cat => (
              <button 
                key={cat}
                className={`category-pill ${selectedCategory === cat && sidebarTab === 'store' ? 'active' : ''}`}
                onClick={() => { setSidebarTab('store'); setSelectedCategory(cat); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Full screen Separate Authentication Wrapper */}
      {currentTab === 'auth' && (
        <div className="auth-wrapper">
          <div className="auth-container">
            <div className="auth-form-container">
              <div className="auth-brand-header">
                <div className="auth-brand-mark">
                  <Store size={24} />
                </div>
                <div>
                  <h2>Play Store</h2>
                  <p>Sign in as a user or admin.</p>
                </div>
              </div>
              <div className="auth-tabs">
                <label className={`mini-radio-pill ${authTab === 'login' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="authTab"
                    checked={authTab === 'login'}
                    onChange={() => { setAuthTab('login'); setLoginError(''); }}
                  />
                  <span>Sign In</span>
                </label>
                <label className={`mini-radio-pill ${authTab === 'register' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="authTab"
                    checked={authTab === 'register'}
                    onChange={() => { setAuthTab('register'); setRegisterError(''); }}
                  />
                  <span>Sign Up</span>
                </label>
              </div>

              {authTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="auth-form">
                  <h3>Sign in to your account</h3>
                  <p className="auth-form-desc">Enter your credentials to continue.</p>

                  <div className="form-group">
                    <label>Choose Account Type</label>
                    <div className="auth-radio-group">
                      <label className={`auth-radio-label ${loginRole === 'USER' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="loginRole" 
                          value="USER" 
                          checked={loginRole === 'USER'} 
                          onChange={() => setLoginRole('USER')} 
                        />
                        <span>User / Downloader</span>
                      </label>
                      <label className={`auth-radio-label ${loginRole === 'OWNER' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="loginRole" 
                          value="OWNER" 
                          checked={loginRole === 'OWNER'} 
                          onChange={() => setLoginRole('OWNER')} 
                        />
                        <span>Admin</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-email">Email Address</label>
                    <input 
                      type="email" 
                      id="login-email" 
                      required 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input 
                      type="password" 
                      id="login-password" 
                      required 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>

                  {loginError && <div className="form-error-msg">{loginError}</div>}

                  <button type="submit" className="auth-submit-btn">
                    <span>Login</span>
                    <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="auth-form">
                  <h3>Create a new account</h3>
                  <p className="auth-form-desc">Choose whether you are a user or admin.</p>

                  <div className="form-group">
                    <label>Account Role Type</label>
                    <div className="auth-radio-group">
                      <label className={`auth-radio-label ${registerRole === 'USER' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="registerRole" 
                          value="USER" 
                          checked={registerRole === 'USER'} 
                          onChange={() => setRegisterRole('USER')} 
                        />
                        <span>Standard User</span>
                      </label>
                      <label className={`auth-radio-label ${registerRole === 'OWNER' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="registerRole" 
                          value="OWNER" 
                          checked={registerRole === 'OWNER'} 
                          onChange={() => setRegisterRole('OWNER')} 
                        />
                        <span>Admin</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-name">Full Name</label>
                    <input 
                      type="text" 
                      id="reg-name" 
                      required 
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-email">Email Address</label>
                    <input 
                      type="email" 
                      id="reg-email" 
                      required 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-password">Password</label>
                    <input 
                      type="password" 
                      id="reg-password" 
                      required 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>

                  {registerError && <div className="form-error-msg">{registerError}</div>}

                  <button type="submit" className="auth-submit-btn">
                    <span>Register Account</span>
                    <PlusCircle size={16} />
                  </button>
                </form>
              )}
              <button className="btn-back-guest auth-guest-btn" onClick={() => { switchTab('store'); }}>
                <ArrowLeft size={16} />
                <span>Browse as Guest</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Workspace Layout */}
      {currentTab !== 'auth' && (
        <div className="main-container">
          
          {/* Mobile Overlay Scrim for Sidebar */}
          <div 
            className={`sidebar-overlay ${mobileMenuOpen ? 'mobile-open' : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar Drawer */}
          <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="sidebar-list">
              <li 
                className={`sidebar-item ${sidebarTab === 'store' ? 'active' : ''}`}
                onClick={() => { switchTab('store'); }}
              >
                <Store size={16} />
                <span>Store</span>
              </li>
              
              {currentUser && currentUser.role === 'OWNER' ? (
                <li 
                  className={`sidebar-item ${sidebarTab === 'manage' && manageTab === 'developer' ? 'active' : ''}`}
                  onClick={() => { switchTab('dev'); }}
                >
                  <Code size={16} />
                  <span>Admin Dashboard</span>
                </li>
              ) : (
                <li 
                  className={`sidebar-item ${sidebarTab === 'manage' && manageTab === 'installed' ? 'active' : ''}`}
                  onClick={() => { setSidebarTab('manage'); setManageTab('installed'); setMobileMenuOpen(false); }}
                >
                  <Laptop size={16} />
                  <span>Manage apps</span>
                </li>
              )}
              
              <li 
                className={`sidebar-item ${sidebarTab === 'notifications' ? 'active' : ''}`}
                onClick={openNotificationsPanel}
              >
                <Bell size={16} />
                <span>Notifications</span>
                {renderNotificationBadge()}
              </li>
            </ul>
            
            <div className="sidebar-footer">
              <p>@ 2026 playstore. All Rights Reserved.</p>
            </div>
          </aside>

          {/* Content Area */}
          <main className="content">
            
            {/* tab 1: STORE FRONT CATALOG */}
            {sidebarTab === 'store' && (
              <div className="view-panel">
                {/* Categories horizontal bar removed - moved to global top bar */}

                <div className="panel-header">
                  <h2>{selectedCategory === 'all' ? 'Top Essentials' : selectedCategory}</h2>
                  <div className="panel-actions">
                    <div className="rating-filter-wrapper">
                      <label className="rating-filter-label" htmlFor="react-rating-select">
                        <Star size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', fill: 'currentColor' }} />
                        <span>Customer Ratings:</span>
                      </label>
                      <select 
                        id="react-rating-select"
                        className="rating-select"
                        value={minRatingFilter}
                        onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                      >
                        <option value="0">Any Rating</option>
                        <option value="4">4.0★ & above</option>
                        <option value="3">3.0★ & above</option>
                        <option value="2">2.0★ & above</option>
                        <option value="1">1.0★ & above</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter pills display */}
                {(selectedCategory !== 'all' || minRatingFilter > 0 || searchQuery) && (
                  <div className="filter-pills-bar">
                    {selectedCategory !== 'all' && (
                      <div className="filter-pill">
                        <span>Category: {selectedCategory}</span>
                        <X size={12} onClick={() => setSelectedCategory('all')} />
                      </div>
                    )}
                    {minRatingFilter > 0 && (
                      <div className="filter-pill">
                        <span>Rating: {minRatingFilter}★+</span>
                        <X size={12} onClick={() => setMinRatingFilter(0)} />
                      </div>
                    )}
                    {searchQuery && (
                      <div className="filter-pill">
                        <span>Search: {searchQuery}</span>
                        <X size={12} onClick={() => setSearchQuery('')} />
                      </div>
                    )}
                  </div>
                )}

                {isLoadingApps ? (
                  <div className="loading-spinner-box">
                    <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span>Fetching latest catalog...</span>
                  </div>
                ) : apps.length === 0 ? (
                  <div className="empty-state-box">
                    <Search size={48} />
                    <p>No applications match your selection.</p>
                  </div>
                ) : selectedCategory === 'all' ? (
                  // Shelves grouping catalog view
                  <div className="shelves-wrapper">
                    {/* Top Essentials Banner shelf */}
                    {(() => {
                      const essentialNames = ["Google Chrome", "Truecaller", "JioTV", "Instagram", "WhatsApp"];
                      const essentials = apps.filter(app => essentialNames.includes(app.appName));
                      if (essentials.length === 0) return null;
                      return (
                        <div className="store-shelf">
                          <div className="store-shelf-title">Top Essentials</div>
                          <div className="store-shelf-grid">
                            {essentials.map(app => renderAppCard(app))}
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Category shelves */}
                    {[
                      'Games', 'Beauty', 'Fashion', 
                      'Women (Safety, Community & Tracking)', 'Health & Fitness', 
                      'Social Media & Communication', 'Entertainment & Streaming', 
                      'Shopping & E-Commerce', 'Productivity & Education', 
                      'Travel & Utilities'
                    ].map(cat => {
                      const catApps = apps.filter(app => app.category === cat);
                      if (catApps.length === 0) return null;
                      return (
                        <div key={cat} className="store-shelf">
                          <div className="store-shelf-title">{cat}</div>
                          <div className="store-shelf-grid">
                            {catApps.map(app => renderAppCard(app))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Flat Grid view
                  <div className="app-grid">
                    {apps.map(app => renderAppCard(app))}
                  </div>
                )}
              </div>
            )}

            {/* tab 2: MANAGE APPS & DEV CONSOLE */}
            {sidebarTab === 'manage' && (
              <div className="view-panel">
                {!currentUser ? (
                  <div className="empty-state-box">
                    <Laptop size={48} />
                    <p>Please Sign In to manage your applications.</p>
                  </div>
                ) : (
                  <>
                    {/* Subview 1: Installed Apps */}
                    {(currentUser.role !== 'OWNER' || manageTab === 'installed') && (
                      <div className="installed-apps-view-container">
                        <div className="manage-apps-hero">
                          <div>
                            <h2>Manage Apps</h2>
                            <p>Open, update, or remove apps installed on this account.</p>
                          </div>
                          <div className="manage-summary-grid">
                            <div className="manage-summary-card">
                              <Laptop size={18} />
                              <span>Installed</span>
                              <strong>{Object.keys(installedApps).length}</strong>
                            </div>
                            <div className="manage-summary-card">
                              <Download size={18} />
                              <span>Updates</span>
                              <strong>{installedRows.filter(app => {
                                const installedVersion = installedApps[app.id] || installedApps[String(app.id)];
                                return installedVersion && installedVersion !== app.version;
                              }).length}</strong>
                            </div>
                          </div>
                        </div>
                        
                        {Object.keys(installedApps).length === 0 ? (
                          <div className="empty-state-box">
                            <Laptop size={36} />
                            <p>No applications installed on this device.</p>
                          </div>
                        ) : (
                          <div className="installed-rows-list">
                            {installedRows.map(app => {
                              const installedVersion = installedApps[app.id] || installedApps[String(app.id)];
                              const hasUpdate = installedVersion !== app.version;
                              return (
                                <div key={app.id} className="installed-row-card">
                                  <div className="row-icon" style={{ background: getCategoryGradient(app.category) }}>
                                    {app.appName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="row-info">
                                    <div className="row-name">{app.appName}</div>
                                    <div className="row-meta">
                                      <span>Installed Version: v{installedVersion}</span>
                                      <span className="row-meta-dot">•</span>
                                      <span>{getStorageLabel(app)}</span>
                                      {!app.visible && (
                                        <>
                                          <span className="row-meta-dot">•</span>
                                          <span className="visibility-note">Hidden by admin</span>
                                        </>
                                      )}
                                      {hasUpdate && <span className="update-tag-bubble">Update Available (v{app.version})</span>}
                                    </div>
                                  </div>
                                  <div className="row-actions">
                                    {hasUpdate ? (
                                      <button className="row-btn btn-update" onClick={(e) => downloadApp(e, app)}>
                                        Update
                                      </button>
                                    ) : (
                                      <button className="row-btn btn-open" onClick={() => showToast(`Opening ${app.appName}...`, 'success')}>
                                        Open
                                      </button>
                                    )}
                                    <button className="row-btn btn-uninstall" onClick={(e) => uninstallApp(e, app)}>
                                      Uninstall
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Subview 2: Admin Dashboard */}
                    {currentUser.role === 'OWNER' && manageTab === 'developer' && (
                      <div className="developer-dashboard-view">
                        <div className="panel-header" style={{ marginBottom: '16px' }}>
                          <h3>Admin Dashboard</h3>
                          <button className="primary-btn" onClick={() => openAppFormModal()}>
                            <PlusCircle size={16} />
                            <span>Add New App</span>
                          </button>
                        </div>

                        {/* Admin Stats Grid */}
                        <div className="dev-stats-grid" style={{ marginBottom: '24px' }}>
                          <div className="dev-stat-card">
                            <div className="dev-stat-icon-wrapper">
                              <Laptop size={20} />
                            </div>
                            <div>
                              <div className="dev-stat-label">Total Apps</div>
                              <div className="dev-stat-value">{devApps.length}</div>
                            </div>
                          </div>
                          <div className="dev-stat-card">
                            <div className="dev-stat-icon-wrapper">
                              <Download size={20} />
                            </div>
                            <div>
                              <div className="dev-stat-label">Total Downloads</div>
                              <div className="dev-stat-value">{devStats.totalDownloads.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="dev-stat-card">
                            <div className="dev-stat-icon-wrapper">
                              <Star size={20} />
                            </div>
                            <div>
                              <div className="dev-stat-label">Avg Rating</div>
                              <div className="dev-stat-value">{devStats.avgRating}</div>
                            </div>
                          </div>
                        </div>

                        <div className="dev-dashboard-blocks">
                          <div className="dev-block">
                            <div className="dev-block-header" style={{ marginBottom: '12px' }}>
                              <h4>My Published Apps</h4>
                            </div>
                            <div className="table-wrapper">
                              {devApps.length === 0 ? (
                                <div className="empty-state-box">
                                  <Laptop size={36} />
                                  <p>You haven't published any applications yet.</p>
                                </div>
                              ) : (
                                <table className="responsive-table">
                                  <thead>
                                    <tr>
                                      <th>App Details</th>
                                      <th>Category</th>
                                      <th>Version</th>
                                      <th>Size</th>
                                      <th>Downloads</th>
                                      <th>Rating</th>
                                      <th>Visibility</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {devApps.map(app => (
                                      <tr key={app.id}>
                                        <td>
                                          <div className="table-app-details">
                                            <div className="table-app-icon" style={{ background: getCategoryGradient(app.category) }}>
                                              {app.appName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                              <span className="table-app-name">{app.appName}</span>
                                              <span className="table-app-id">ID: {app.id}</span>
                                            </div>
                                          </div>
                                        </td>
                                        <td>{app.category}</td>
                                        <td>v{app.version}</td>
                                        <td>{getStorageLabel(app)}</td>
                                        <td><strong>{app.downloads}</strong> downloads</td>
                                        <td>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                            <span>{app.rating ? app.rating.toFixed(1) : '0.0'}</span>
                                            <Star size={11} className="fill-amber-500 text-amber-500" style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label className="switch">
                                              <input 
                                                type="checkbox" 
                                                checked={app.visible} 
                                                onChange={(e) => handleToggleAppVisibility(app.id, e.target.checked)}
                                              />
                                              <span className="slider"></span>
                                            </label>
                                            <span className={`switch-badge ${app.visible ? 'visible' : 'hidden'}`}>
                                              {app.visible ? 'Visible' : 'Hidden'}
                                            </span>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="dev-action-buttons">
                                            <button className="action-icon-btn" title="Announce Update" onClick={() => openUpdateModal(app)}>
                                              <Megaphone size={14} />
                                            </button>
                                            <button className="action-icon-btn" title="Edit details" onClick={() => openAppFormModal(app)}>
                                              <Edit size={14} />
                                            </button>
                                            <button className="action-icon-btn btn-trash" title="Delete app" onClick={() => handleDeleteApp(app.id)}>
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>

                          <div className="dev-block" style={{ marginTop: '24px' }}>
                            <div className="dev-block-header" style={{ marginBottom: '12px' }}>
                              <h4>Recent Comments on My Apps</h4>
                            </div>
                            <div className="dev-reviews-feed-box">
                              {devReviews.length === 0 ? (
                                <div className="empty-state-box" style={{ padding: '20px 0' }}>
                                  <MessageCircle size={24} />
                                  <p>No reviews received yet.</p>
                                </div>
                              ) : (
                                devReviews.map(rev => {
                                  const appName = devApps.find(a => a.id === rev.appId)?.appName || `App ID ${rev.appId}`;
                                  return (
                                    <div key={rev.id} className="feed-card">
                                      <div className="feed-card-header">
                                        <span className="feed-card-title">{rev.username}</span>
                                        <div className="rating-stars-list">
                                          {getStarsIconRow(rev.rating)}
                                        </div>
                                      </div>
                                      <div className="feed-card-app-name">App: {appName}</div>
                                      <p className="feed-card-comment">"{rev.comment}"</p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* tab 3: NOTIFICATIONS VIEW */}
            {sidebarTab === 'notifications' && (
              <div className="view-panel">
                <div className="panel-header">
                  <h2>
                    Notifications
                    {renderNotificationBadge('page-notification-badge')}
                  </h2>
                </div>
                
                <div className="notifications-page-list" style={{ marginTop: '16px' }}>
                  {!currentUser ? (
                    <div className="empty-state-box">
                      <Bell size={48} />
                      <p>Please Sign In to view your notifications.</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="empty-state-box">
                      <Bell size={36} />
                      <p>All caught up! No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map(item => (
                      <div 
                        key={item.id} 
                        className={`notification-page-card ${item.readStatus ? '' : 'unread'}`}
                        onClick={() => handleMarkNotificationRead(item.id)}
                      >
                        <div className="notification-page-card-header">
                          <span className={`notification-tag ${item.type.toLowerCase() === 'update' ? 'update' : 'system'}`}>
                            {item.type}
                          </span>
                          <span className="notification-time-label">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="notification-page-body-text">{item.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* 4. APP DETAILS SCENE OVERLAY MODAL */}
      {activeApp && (
        <div className="modal-scrim" onClick={closeAppDetails}>
          <div className="modal-content-container app-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={closeAppDetails}>
              <X size={18} />
            </button>

            <div className="app-details-header">
              <div className="details-icon-container" style={{ background: getCategoryGradient(activeApp.category) }}>
                {activeApp.appName.charAt(0).toUpperCase()}
              </div>
              <div className="details-info-container">
                <h2>{activeApp.appName}</h2>
                <div className="details-badges-row">
                  <span className="details-badge badge-rating">
                    <Star size={11} className="fill-current text-amber-500" style={{ fill: 'currentColor', color: 'var(--warning)' }} />
                    <span>{activeApp.rating ? activeApp.rating.toFixed(1) : '0.0'}★ ({reviews.length})</span>
                  </span>
                  <span className="details-badge">
                    <span>↓ {activeApp.downloads}</span>
                  </span>
                  <span className="details-badge">
                    <Tag size={11} />
                    <span>{activeApp.category}</span>
                  </span>
                  <span className="details-badge">
                    <span>{getStorageLabel(activeApp)}</span>
                  </span>
                  <span className="details-badge">
                    <span>v{activeApp.version}</span>
                  </span>
                  <span className="details-badge">
                    <Calendar size={11} />
                    <span>Released: {activeApp.releaseDate}</span>
                  </span>
                </div>

                {/* Card Button triggers */}
                {(() => {
                  const installedVersion = installedApps[activeApp.id] || installedApps[String(activeApp.id)];
                  const isInstalled = installedVersion !== undefined;
                  const hasUpdate = isInstalled && installedVersion !== activeApp.version;

                  return (
                    <div className="app-details-actions-row" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                      {!isInstalled ? (
                        <button 
                          className="app-card-btn-action btn-install"
                          style={{ maxWidth: '200px', padding: '10px 18px', fontSize: '13px' }}
                          onClick={(e) => downloadApp(e, activeApp)}
                        >
                          <Download size={14} style={{ marginRight: '6px' }} />
                          <span>Install</span>
                        </button>
                      ) : (
                        <>
                          {hasUpdate ? (
                            <button 
                              className="app-card-btn-action btn-update"
                              style={{ maxWidth: '150px', padding: '10px 14px', fontSize: '13px' }}
                              onClick={(e) => downloadApp(e, activeApp)}
                            >
                              <Download size={14} style={{ marginRight: '6px' }} />
                              <span>Update</span>
                            </button>
                          ) : (
                            <button 
                              className="app-card-btn-action btn-open"
                              style={{ maxWidth: '150px', padding: '10px 14px', fontSize: '13px' }}
                              onClick={() => showToast(`Opening ${activeApp.appName}...`, 'success')}
                            >
                              <Check size={14} style={{ marginRight: '6px' }} />
                              <span>Open</span>
                            </button>
                          )}
                          <button 
                            className="app-card-btn-action btn-uninstall"
                            style={{ maxWidth: '150px', padding: '10px 14px', fontSize: '13px' }}
                            onClick={(e) => uninstallApp(e, activeApp)}
                          >
                            <Trash2 size={14} style={{ marginRight: '6px' }} />
                            <span>Uninstall</span>
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="app-details-main-body">
              <div className="details-left-section">
                <div className="details-block">
                  <h3>About this App</h3>
                  <p className="app-long-description">{activeApp.description || 'No description available.'}</p>
                </div>
                <div className="details-block">
                  <h3>App Information</h3>
                  <div className="app-info-grid">
                    <div className="app-info-item">
                      <span className="app-info-label">Storage</span>
                      <strong>{getStorageLabel(activeApp)}</strong>
                    </div>
                    <div className="app-info-item">
                      <span className="app-info-label">Version</span>
                      <strong>v{activeApp.version}</strong>
                    </div>
                    <div className="app-info-item">
                      <span className="app-info-label">Visibility</span>
                      <strong>{activeApp.visible ? 'Visible' : 'Hidden'}</strong>
                    </div>
                  </div>
                </div>
                <div className="details-block">
                  <h3>Preview</h3>
                  <img 
                    className="details-screenshot" 
                    src={activeApp.screenshotUrl || `https://placehold.co/600x340/01875f/ffffff?text=${encodeURIComponent(activeApp.appName)}`}
                    alt="App Screenshot" 
                    onError={(e) => {
                      e.target.src = `https://placehold.co/600x340/01875f/ffffff?text=${encodeURIComponent(activeApp.appName)}`;
                    }}
                  />
                </div>
              </div>

              <div className="details-right-section">
                <div className="details-block">
                  <h3>Ratings & Reviews</h3>
                  <div className="rating-summary-card">
                    <span className="rating-big-number">{activeApp.rating ? activeApp.rating.toFixed(1) : '0.0'}</span>
                    <div className="rating-stars-visual">
                      <div className="rating-stars-list">
                        {getStarsIconRow(activeApp.rating)}
                      </div>
                      <span className="rating-reviews-count-label">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="details-block">
                  <h3>User Comments</h3>
                  <div className="comments-list-box">
                    {reviews.length === 0 ? (
                      <div className="empty-state-box" style={{ padding: '20px 0' }}>
                        <MessageCircle size={24} />
                        <p style={{ fontSize: '13px' }}>Be the first to review this application!</p>
                      </div>
                    ) : (
                      reviews.map(rev => (
                        <div key={rev.id} className="comment-card">
                          <div className="comment-card-header">
                            <span className="comment-author">{rev.username}</span>
                            <div className="comment-stars">
                              {getStarsIconRow(rev.rating)}
                            </div>
                          </div>
                          <p className="comment-body-text">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Review posting logic */}
                {currentUser && currentUser.role === 'USER' && (
                  <div className="details-block">
                    <div className="write-review-card">
                      <h3>Write a Review</h3>
                      <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="stars-selector-row">
                          <span className="stars-selector-label">Your Rating:</span>
                          <div className="interactive-stars-group">
                            {[1, 2, 3, 4, 5].map(star => {
                              const isLit = star <= (hoveredReviewRating || selectedReviewRating);
                              return (
                                <Star 
                                  key={star}
                                  size={18}
                                  className={`interactive-star ${isLit ? 'selected' : ''}`}
                                  style={{ fill: isLit ? 'var(--warning)' : 'none', color: isLit ? 'var(--warning)' : 'var(--text-muted)' }}
                                  onMouseEnter={() => setHoveredReviewRating(star)}
                                  onMouseLeave={() => setHoveredReviewRating(0)}
                                  onClick={() => setSelectedReviewRating(star)}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <div className="form-group">
                          <textarea 
                            rows="2" 
                            required 
                            placeholder="Share your experience with this application..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            style={{ fontSize: '13px', resize: 'vertical' }}
                          />
                        </div>
                        <button type="submit" className="btn-submit-review">Submit Review</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PUBLISH / EDIT APP MODAL (DEVELOPER) */}
      {showAppForm && (
        <div className="modal-scrim" onClick={() => setShowAppForm(false)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setShowAppForm(false)}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
              {editingApp ? 'Edit Application Details' : 'Publish New Application'}
            </h2>
            <form onSubmit={handleAppFormSubmit} className="modal-form-grid">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="form-appname">Application Name</label>
                  <input 
                    type="text" 
                    id="form-appname" 
                    required 
                    placeholder="e.g. Candy Crush Saga"
                    value={appFormName}
                    onChange={(e) => setAppFormName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-category">Category</label>
                  <select 
                    id="form-category"
                    value={appFormCategory}
                    onChange={(e) => setAppFormCategory(e.target.value)}
                  >
                    {[
                      'Games', 'Beauty', 'Fashion', 
                      'Women (Safety, Community & Tracking)', 'Health & Fitness', 
                      'Social Media & Communication', 'Entertainment & Streaming', 
                      'Shopping & E-Commerce', 'Productivity & Education', 
                      'Travel & Utilities'
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="form-description">Description</label>
                <textarea 
                  id="form-description" 
                  rows="3" 
                  required 
                  placeholder="Describe what your application does, its main features, etc."
                  value={appFormDesc}
                  onChange={(e) => setAppFormDesc(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="form-version">Initial Version</label>
                  <input 
                    type="text" 
                    id="form-version" 
                    placeholder="e.g. 1.0.0"
                    value={appFormVersion}
                    onChange={(e) => setAppFormVersion(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-date">Release Date</label>
                  <input 
                    type="date" 
                    id="form-date" 
                    required
                    value={appFormDate}
                    onChange={(e) => setAppFormDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="form-icon">Icon URL (Image link)</label>
                  <input 
                    type="url" 
                    id="form-icon" 
                    placeholder="https://example.com/icon.png"
                    value={appFormIcon}
                    onChange={(e) => setAppFormIcon(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-screenshot">Screenshot URL (Image link)</label>
                  <input 
                    type="url" 
                    id="form-screenshot" 
                    placeholder="https://example.com/screenshot.jpg"
                    value={appFormScreenshot}
                    onChange={(e) => setAppFormScreenshot(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="form-storagesize">Storage Size</label>
                <input 
                  type="text" 
                  id="form-storagesize" 
                  list="storage-size-options"
                  required 
                  placeholder="e.g. 150 MB"
                  value={appFormStorageSize}
                  onChange={(e) => setAppFormStorageSize(e.target.value)}
                />
                <datalist id="storage-size-options">
                  {['50 MB', '100 MB', '150 MB', '200 MB', '250 MB', '500 MB', '1 GB', '1.5 GB', '2 GB'].map(size => (
                    <option key={size} value={size} />
                  ))}
                </datalist>
              </div>

              <div className="form-actions-row">
                <button type="button" className="btn-back-guest" style={{ padding: '8px 16px' }} onClick={() => setShowAppForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn">{editingApp ? 'Save Changes' : 'Publish App'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ANNOUNCE UPDATE MODAL (DEVELOPER) */}
      {showUpdateForm && updateAppTarget && (
        <div className="modal-scrim" onClick={() => setShowUpdateForm(false)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setShowUpdateForm(false)}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>Announce App Update</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Announce version changes and new features. All users who installed {updateAppTarget.appName} will receive a notification.
            </p>
            <form onSubmit={handleUpdateFormSubmit} className="modal-form-grid">
              <div className="form-group">
                <label>Application</label>
                <input type="text" readOnly className="readonly-input" style={{ background: '#f1f3f4', cursor: 'not-allowed' }} value={updateAppTarget.appName} />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="update-ver">New Version String</label>
                  <input 
                    type="text" 
                    id="update-ver" 
                    required 
                    placeholder="e.g. 1.1.0"
                    value={updateVersion}
                    onChange={(e) => setUpdateVersion(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="update-date">Update Release Date</label>
                  <input 
                    type="date" 
                    id="update-date" 
                    required
                    value={updateDate}
                    onChange={(e) => setUpdateDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="update-desc">What's New / Changes</label>
                <textarea 
                  id="update-desc" 
                  rows="3" 
                  required 
                  placeholder="Describe the bug fixes, additions, and enhancements..."
                  value={updateDesc}
                  onChange={(e) => setUpdateDesc(e.target.value)}
                />
              </div>

              <div className="form-actions-row">
                <button type="button" className="btn-back-guest" style={{ padding: '8px 16px' }} onClick={() => setShowUpdateForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Send Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. NOTIFICATION DRAWER SLIDE OUT */}
      {showNotifications && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowNotifications(false)}></div>
          <div className="notification-drawer-wrapper">
            <div className="drawer-header">
              <h3>
                Notifications
                {renderNotificationBadge('page-notification-badge')}
              </h3>
              <button className="drawer-close-btn" onClick={() => setShowNotifications(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="drawer-content-box">
              {notifications.length === 0 ? (
                <div className="empty-state-box" style={{ padding: '40px 0' }}>
                  <Bell size={32} />
                  <p>All caught up! No notifications yet.</p>
                </div>
              ) : (
                notifications.map(item => (
                  <div 
                    key={item.id} 
                    className={`notification-item-card ${item.readStatus ? '' : 'unread'}`}
                    onClick={() => handleMarkNotificationRead(item.id)}
                  >
                    <div className="notification-card-header">
                      <span className={`notification-tag ${item.type.toLowerCase() === 'update' ? 'update' : 'system'}`}>
                        {item.type}
                      </span>
                      <span className="notification-time-label">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="notification-body-text">{item.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {currentTab !== 'auth' && (
        <div className="mobile-bottom-nav">
          <button 
            className={`bottom-nav-btn ${currentTab === 'store' ? 'active' : ''}`}
            onClick={() => switchTab('store')}
          >
            <Store size={20} />
            <span>Store</span>
          </button>
          {currentUser && currentUser.role === 'OWNER' && (
            <button 
              className={`bottom-nav-btn ${currentTab === 'dev' ? 'active' : ''}`}
              onClick={() => switchTab('dev')}
            >
              <Code size={20} />
                <span>Admin</span>
                {renderNotificationBadge('bottom-nav-badge')}
            </button>
          )}
          {currentUser && (
            <button
              className={`bottom-nav-btn ${sidebarTab === 'notifications' ? 'active' : ''}`}
              onClick={() => {
                setCurrentTab(currentUser.role === 'OWNER' ? 'dev' : 'store');
                openNotificationsPanel();
              }}
            >
              <Bell size={20} />
              <span>Alerts</span>
              {renderNotificationBadge('bottom-nav-badge')}
            </button>
          )}
        </div>
      )}

      {/* 8. TOAST NOTIFICATION ALERTS BOXES */}
      <div className="toast-container-box">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
