import SideNav from '../components/SideNav.jsx';
import TopBar from '../components/TopBar.jsx'

export default function BackLayout({ children }) {
  return (
       // Contenedor principal: flex para SideNav y Contenido, ocupa toda la altura, fondo blanco
    <div className='flex min-h-screen bg-white'> 
      
      {/* Contenedor del SideNav: h-full para estirarse, y ahora aquí ponemos el borde derecho */}
      {/* Asegúrate de que SideNav tenga un ancho definido, ya sea en su propio CSS o aquí con 'w-64' */}
      <div className="flex-shrink-0 w-[258px] bg-white flex flex-col"> {/* El borde derecho se dibuja aquí */}
        <SideNav className='flex-grow'/> {/* SideNav ahora sí recibirá h-full */}
      </div>
      
      {/* Contenedor para TopBar y el contenido de la página */}
      <div className='flex-1 flex flex-col bg-[#f0f0f0ba]'>
        <TopBar/>
        {/* Este div con flex-grow es donde se renderiza el contenido de la página. */}
        {/* Aquí debe estar el fondo blanco del área principal. */}
        <div className='flex-grow p-6'> {/* Asegúrate de que bg-white esté aquí y agrega p-6 para padding */}
            {children}
        </div>
      </div>
    </div>
  );
}