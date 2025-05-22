import SideNav from '../components/SideNav.jsx';
import TopBar from '../components/TopBar.jsx'

export default function BackLayout({ children }) {
  return (
        <div className="flex h-screen bg-white">
            <div className="flex">
                <SideNav/>  
            </div>
            <div className="flex-1 bg-[rgba(141,145,149,0.15)]">
                <TopBar/>
                {children}
            </div>
        </div>
  );
}