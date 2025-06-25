# URLongless

## Descripción del Proyecto

URLongless es una aplicación web integral diseñada para la gestión eficiente de enlaces. Permite a los usuarios acortar URLs largas, generar códigos QR personalizados para sus enlaces y visualizar métricas de rendimiento detalladas a través de un panel de análisis. Ya sea para campañas de marketing, uso personal o seguimiento de la efectividad de los enlaces, URLongless proporciona una solución robusta y fácil de usar.

## Características Principales

* **Acortador de URLs:** Transforma enlaces largos y complejos en URLs cortas y fáciles de compartir.
* **Generador de Códigos QR:** Crea códigos QR a partir de cualquier URL, listos para ser escaneados y compartidos.
* **Analíticas Detalladas:** Obtén información valiosa sobre el rendimiento de tus enlaces y códigos QR, incluyendo:
    * Clicks a lo largo del tiempo.
    * Clicks por país.
    * Fuentes de tráfico.
    * Clicks por URL.
* **Interfaz de Usuario Intuitiva:** Un panel de control limpio y responsivo para una gestión sencilla.
* **Personalización:** Posibilidad de definir claves personalizadas para tus URLs acortadas.

## Tecnologías Utilizadas

### Frontend
* **Next.js:** Framework de React para el desarrollo de aplicaciones web de alto rendimiento.
* **React:** Biblioteca de JavaScript para construir interfaces de usuario.
* **Tailwind CSS:** Framework CSS utility-first para un diseño rápido y personalizable.
* **D3.js:** Para la visualización de datos en las gráficas de analíticas.
* **React Icons:** Librería de iconos para React.

### Backend
* **FastAPI:** Framework web moderno y rápido para construir APIs con Python.
* **Pydantic:** Para la validación de datos.
* **Segno:** Librería para la generación de códigos QR.
* **Uvicorn:** Servidor ASGI para ejecutar la aplicación FastAPI.
* **uuid:** Para generar nombres de archivo únicos para los códigos QR.
* **(Opcional, si usas base de datos):** SQLAlchemy / PostgreSQL / SQLite, etc.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales: `Front` para el frontend y `Back` para el backend.

	.
	├── Back/                # Directorio del Backend (FastAPI)
	│   ├── main.py          # Archivo principal de la API
	│   ├── requirements.txt # Dependencias de Python
	│   ├── temp_qrs/        # Directorio temporal para los códigos QR generados
	│   └── ...              # Otros módulos y configuraciones del backend
	├── Front/               # Directorio del Frontend (Next.js)
	│   ├── public/          # Archivos estáticos
	│   ├── src/             # Código fuente de la aplicación Next.js
	│   │   ├── app/         # Directorio del App Router
	│   │   │   ├── (Back)/  # Layout y páginas del dashboard (ej. Home, Analytics)
	│   │   │   ├── api/     # Rutas de API de Next.js (si las usas para reenvío)
	│   │   │   └── globals.css # Estilos globales de Tailwind
	│   │   ├── components/  # Componentes reutilizables (SideNav, TopBar, MiniForm, BarChartVertical)
	│   │   │   ├── SideNav.jsx
	│   │   │   ├── SideNav.module.css
	│   │   │   ├── TopBar.jsx
	│   │   │   ├── MiniForm.jsx
	│   │   │   └── BarChartVertical.jsx
	│   │   └── ...          # Otras configuraciones de Next.js
	│   ├── .env.local       # Variables de entorno para el frontend
	│   └── package.json     # Dependencias de Node.js
	└── README.md

## Configuración y Ejecución Local

Sigue estos pasos para poner en marcha el proyecto en tu máquina local.

### Requisitos Previos

Asegúrate de tener instalado lo siguiente:
* Python 3.8+
* Node.js (versión LTS recomendada) y npm/yarn
* Git

### 1. Clonar el Repositorio

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd urlongless
```
### 2. Configurar y Ejecutar el Backend (FastAPI)

```bash
cd Back

# Crear y activar un entorno virtual (recomendado)
python -m venv venv
# En Windows:
.\venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor FastAPI
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
### 3. Configurar y Ejecutar el Frontend (Next.js)

```bash
cd Front

# Instalar dependencias
npm install # o yarn install

# Crear un archivo .env.local y configurar la URL del backend
cp .env.local.example .env.local # Si tienes un archivo de ejemplo
```
Asegúrate de que tu archivo .env.local contenga la URL de tu API backend:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

```bash
# Ejecutar el servidor de desarrollo de Next.js
npm run dev # o yarn dev
```
## Uso

Una vez que ambos servidores estén ejecutándose:

1. Abre tu navegador y navega a http://localhost:3000.
2. Utiliza el formulario en la página de inicio para acortar URLs o generar códigos QR.
3. Explora la sección de "Analytics" en el sidebar para ver las estadísticas de tus enlaces.
4. Navega por las diferentes opciones del sidebar para acceder a otras funcionalidades.

## Contribuciones

¡Las contribuciones son bienvenidas! Si deseas contribuir al proyecto, por favor, sigue estos pasos:

1. Haz un "fork" del repositorio.
2. Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).
3. Realiza tus cambios y haz "commit" de ellos (git commit -m 'feat: añade nueva funcionalidad X').
4. Haz "push" a tu rama (git push origin feature/nueva-funcionalidad).
5. Abre un "Pull Request".

### ¡Disfruta usando URLongless!
