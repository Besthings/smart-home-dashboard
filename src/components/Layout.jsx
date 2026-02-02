import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto mt-8 md:mt-2 md:ml-64">
        {children}
      </main>
    </div>
  );
};

export default Layout;
