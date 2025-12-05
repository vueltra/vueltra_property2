
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar'; 
import TopBar from './components/TopBar'; 
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ListingDetail from './pages/ListingDetail';
import ListingForm from './pages/ListingForm';
import RequestForm from './pages/RequestForm';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import Verification from './pages/Verification';
import AgentProfile from './pages/AgentProfile';
import Profile from './pages/Profile';
import Legal from './pages/Legal';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Requests from './pages/Requests'; 
import Contact from './pages/Contact'; 
import { StoreService } from './services/store';
import { User, Listing } from './types';
import { ToastProvider } from './context/ToastContext';

type Page = 'home' | 'dashboard' | 'create-listing' | 'edit-listing' | 'create-request' | 'detail' | 'login' | 'register' | 'forgot-password' | 'admin-dashboard' | 'verification' | 'agent-profile' | 'profile' | 'legal' | 'blog' | 'blog-detail' | 'requests' | 'contact';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedBlogId, setSelectedBlogId] = useState<string>('');
  const [editingListingId, setEditingListingId] = useState<string>('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<string>('Semua'); 
  const [user, setUser] = useState<User | null>(null);
  
  // Layout States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  const [pendingRedirect, setPendingRedirect] = useState<Page | null>(null);

  useEffect(() => {
    const state = StoreService.getState();
    if (state.currentUser) {
      setUser(state.currentUser);
    }
  }, []);

  const refreshUser = () => {
    const state = StoreService.getState();
    setUser(state.currentUser);
  };

  const handleNavigate = (page: string, param?: string) => {
    const targetPage = page as Page;
    
    // Auth Guard
    if ((targetPage === 'dashboard' || targetPage === 'create-listing' || targetPage === 'create-request' || targetPage === 'admin-dashboard' || targetPage === 'verification' || targetPage === 'profile') && !user) {
      setCurrentPage('login');
      return;
    }
    
    // Admin Guard
    if (targetPage === 'admin-dashboard' && !user?.isAdmin) {
      alert("Akses ditolak: Hanya untuk admin.");
      return;
    }

    if (targetPage === 'blog-detail' && param) setSelectedBlogId(param);
    if (targetPage === 'blog' && param) setBlogCategoryFilter(param);
    if (targetPage === 'edit-listing' && param) setEditingListingId(param);
    
    setCurrentPage(targetPage);
    window.scrollTo(0,0);
    setIsSidebarOpen(false);
  };

  const handleNavigateWithReturn = (target: string, returnTo: Page) => {
    setPendingRedirect(returnTo);
    handleNavigate(target);
  };

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentPage('detail');
    window.scrollTo(0,0);
  };

  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId);
    setCurrentPage('agent-profile');
    window.scrollTo(0,0);
  }

  const handleLogout = async () => {
    await StoreService.logout();
    setUser(null);
    setCurrentPage('home');
  };

  const handleAuthSuccess = () => {
    const state = StoreService.getState();
    setUser(state.currentUser);
    if (pendingRedirect) {
      setCurrentPage(pendingRedirect);
      setPendingRedirect(null);
    } else {
      if (state.currentUser?.isAdmin) setCurrentPage('admin-dashboard');
      else setCurrentPage('dashboard');
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 flex flex-col">
        
        {/* Mobile Sidebar (Drawer) */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activePage={currentPage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
        />

        {/* Top Header with Navigation */}
        <TopBar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchValue={globalSearch}
          onSearchChange={setGlobalSearch}
          user={user}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          activePage={currentPage}
        />

        {/* Main Content Area */}
        <div className="flex-1 w-full">
            {currentPage === 'home' && (
              <Home 
                user={user}
                onListingClick={handleListingClick} 
                onRefreshUser={refreshUser}
                onNavigate={(page) => handleNavigateWithReturn(page, 'home')}
                searchQuery={globalSearch} 
              />
            )}
            
            {currentPage === 'dashboard' && user && (
              <Dashboard user={user} onRefreshUser={refreshUser} onNavigate={handleNavigate} />
            )}

            {/* Full Page Forms */}
            {currentPage === 'create-listing' && user && (
              <ListingForm user={user} onNavigate={handleNavigate} />
            )}

            {currentPage === 'edit-listing' && user && editingListingId && (
              <ListingForm user={user} editListingId={editingListingId} onNavigate={handleNavigate} />
            )}

            {currentPage === 'create-request' && user && (
              <RequestForm user={user} onNavigate={handleNavigate} />
            )}

            {currentPage === 'admin-dashboard' && user && user.isAdmin && (
              <AdminDashboard user={user} />
            )}

            {currentPage === 'verification' && user && (
              <Verification user={user} onRefreshUser={refreshUser} />
            )}

            {currentPage === 'profile' && user && (
              <Profile user={user} onRefreshUser={refreshUser} onNavigate={handleNavigate} />
            )}

            {currentPage === 'legal' && (
              <Legal onBack={() => handleNavigate('home')} />
            )}

            {currentPage === 'blog' && (
              <Blog 
                onNavigate={handleNavigate} 
                onBack={() => handleNavigate('home')} 
                initialCategory={blogCategoryFilter} 
              />
            )}

            {currentPage === 'blog-detail' && selectedBlogId && (
              <BlogDetail 
                postId={selectedBlogId} 
                onBack={() => handleNavigate('blog')}
                onCategoryClick={(cat) => handleNavigate('blog', cat)}
              />
            )}

            {currentPage === 'requests' && (
              <Requests user={user} onNavigate={handleNavigate} />
            )}

            {currentPage === 'contact' && (
              <Contact onBack={() => handleNavigate('home')} />
            )}

            {currentPage === 'detail' && selectedListing && (
              <ListingDetail 
                listing={selectedListing} 
                onBack={() => setCurrentPage('home')}
                onAgentClick={handleAgentClick}
                onListingClick={handleListingClick}
                currentUser={user}
                onRefreshUser={refreshUser}
                onNavigate={(page) => handleNavigateWithReturn(page, 'detail')}
              />
            )}

            {currentPage === 'agent-profile' && selectedAgentId && (
              <AgentProfile 
                 agentId={selectedAgentId} 
                 onListingClick={handleListingClick} 
                 onBack={() => setCurrentPage('home')}
              />
            )}

            {currentPage === 'login' && (
              <Login onSuccess={handleAuthSuccess} onNavigate={handleNavigate} />
            )}

            {currentPage === 'register' && (
              <Register onSuccess={handleAuthSuccess} onNavigate={handleNavigate} />
            )}

            {currentPage === 'forgot-password' && (
              <ForgotPassword onNavigate={handleNavigate} />
            )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} Vueltra.com.</p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

export default App;
