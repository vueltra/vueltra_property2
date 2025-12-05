
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar'; // New Sidebar
import TopBar from './components/TopBar'; // New TopBar
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ListingDetail from './pages/ListingDetail';
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

type Page = 'home' | 'dashboard' | 'detail' | 'login' | 'register' | 'forgot-password' | 'admin-dashboard' | 'verification' | 'agent-profile' | 'profile' | 'legal' | 'blog' | 'blog-detail' | 'requests' | 'contact';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedBlogId, setSelectedBlogId] = useState<string>('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<string>('Semua'); 
  const [user, setUser] = useState<User | null>(null);
  
  // New Layout States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState(''); // Search state lifted to App
  
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
    if ((targetPage === 'dashboard' || targetPage === 'admin-dashboard' || targetPage === 'verification' || targetPage === 'profile') && !user) {
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
    
    setCurrentPage(targetPage);
    window.scrollTo(0,0);
    setIsSidebarOpen(false); // Close mobile sidebar on nav
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
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activePage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <TopBar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchValue={globalSearch}
          onSearchChange={setGlobalSearch}
          user={user}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'home' && (
            <Home 
              user={user}
              onListingClick={handleListingClick} 
              onRefreshUser={refreshUser}
              onNavigate={(page) => handleNavigateWithReturn(page, 'home')}
              searchQuery={globalSearch} // Pass global search
            />
          )}
          
          {currentPage === 'dashboard' && user && (
            <Dashboard user={user} onRefreshUser={refreshUser} />
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

          {/* Footer inside Main Scroll Area */}
          <footer className="bg-white border-t border-stone-200 py-8 text-center text-stone-500 text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4">
              <p>&copy; {new Date().getFullYear()} Vueltra.com.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
