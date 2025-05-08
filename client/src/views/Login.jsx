import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const slideImageRef = useRef(null);

  // Datos para los slides
  const slides = [
    {
      image: "/src/assets/team-discussion.jpg",
      title: "Análisis Financiero",
      text: "El sistema GCB proporciona herramientas avanzadas para el análisis financiero, conciliación de cuentas y gestión de operaciones bancarias."
    },
    {
      image: "/src/assets/finance-review.jpg",
      title: "Revisión de Datos",
      text: "Visualiza y analiza todos tus datos bancarios con gráficas interactivas y reportes personalizados para mejor toma de decisiones."
    },
    {
      image: "/src/assets/building.jpg",
      title: "Soluciones Empresariales",
      text: "Nuestro sistema se adapta a las necesidades de tu empresa, sea pequeña o grande, para optimizar la gestión financiera y contable."
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/usuario`);
      const users = await response.json();

      const user = users.find(
        (u) =>
          (u.US_nombre === username || u.US_correo === username) &&
          u.US_contraseña === password
      );

      if (user) {
        setErrorMessage("");
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/HomePage", { state: { user } });
      } else {
        setErrorMessage("Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setErrorMessage("Ocurrió un error al intentar iniciar sesión.");
    }
  };

  // Modificar la función nextSlide para incluir la animación
  const nextSlide = () => {
    if (slideImageRef.current) {
      slideImageRef.current.style.transition = 'transform 0.5s ease-in-out';
      slideImageRef.current.style.transform = 'translateY(-100%)';
      
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        slideImageRef.current.style.transition = 'none';
        slideImageRef.current.style.transform = 'translateY(0)';
      }, 500);
    } else {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Añadir un useEffect para manejar la entrada de la nueva imagen
  useEffect(() => {
    if (slideImageRef.current) {
      slideImageRef.current.style.opacity = '0';
      slideImageRef.current.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        slideImageRef.current.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
        slideImageRef.current.style.opacity = '1';
        slideImageRef.current.style.transform = 'translateY(0)';
      }, 50);
    }
  }, [currentSlide]);

  // Añade este useEffect debajo de tus otros useEffects
  useEffect(() => {
    // Cargar la fuente Open Sans dinámicamente
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(linkElement);

    return () => {
      if (document.head.contains(linkElement)) {
        document.head.removeChild(linkElement);
      }
    };
  }, []);

  return (
    <div style={pageContainerStyle}>
      <div style={{backgroundColor: "#ffffff"}}>
        <Navbar showLoginOnly={true} />
      </div>

      <div style={heroSectionStyle}>
        <div style={heroOverlayStyle}>
          <h1 style={heroTitleStyle}>Sistema de Gestión Contable Bancaria</h1>
          <p style={heroDescriptionStyle}>
            Plataforma integral para el análisis y control de operaciones
            financieras
          </p>
        </div>
      </div>

      <div style={fullWidthBgStyle}>
        <div style={integratedContentStyle}>
          <div style={formSideStyle}>
            <h2 style={formTitleStyle}>Iniciar Sesión</h2>
            <form onSubmit={handleLogin} style={formStyle}>
              <div style={inputGroupStyle}>
                <label htmlFor="username" style={labelStyle}>
                  Usuario o Correo Electrónico
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={inputGroupStyle}>
                <label htmlFor="password" style={labelStyle}>
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              {errorMessage && (
                <div style={errorMessageStyle}>{errorMessage}</div>
              )}
              <button type="submit" style={buttonStyle}>
                Iniciar Sesión
              </button>
            </form>
          </div>
          
          <div style={infoSideStyle}>
            <h3 style={infoTitleStyle}>{slides[currentSlide].title}</h3>
            
            <div style={slideContentStyle}>
              <p style={infoTextStyle}>
                {slides[currentSlide].text}
              </p>
              
              <div style={slideImageContainerStyle}>
                <div style={slideAnimationContainerStyle}>
                  <img
                    ref={slideImageRef}
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    style={infoImageStyle}
                  />
                </div>
                
                <div style={slideNavigationStyle}>
                  <button 
                    onClick={nextSlide} 
                    style={downArrowStyle}
                    aria-label="Siguiente slide"
                  >
                    &#8595;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={footerStyle}>
        <div style={footerContentStyle}>
          <div style={footerColumnContainerStyle}>
            <div style={footerColumnStyle}>
              <h4 style={footerHeaderStyle}>GCB</h4>
              <p style={footerTextStyle}>
                Sistema de gestión contable bancaria diseñado para optimizar los
                procesos financieros de su organización.
              </p>
            </div>
            <div style={footerColumnStyle}>
              <h4 style={footerHeaderStyle}>Contacto</h4>
              <p style={footerTextStyle}>
                soporte@gcb.com
                <br />
                +123 456 7890
              </p>
            </div>
          </div>
          <div style={copyrightStyle}>
            <p style={copyrightTextStyle}>
              © 2025 GCB. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Estilos exactos del tema Lincoln
const pageContainerStyle = {
  fontFamily: "'Open Sans', sans-serif",
  backgroundColor: "#E0E1DD",
  margin: 0,
  padding: 0,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const headerStyle = {
  backgroundColor: "#778DA9", // Azul claro para el header
  padding: "20px 0",
  borderBottom: "1px solid #415A77",
};

const headerContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px",
};

const logoGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const logoStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  objectFit: "cover",
};

const siteTitleStyle = {
  fontSize: "2.25rem",
  fontWeight: "700",
  margin: "0",
  color: "#333333",
};

const navStyle = {
  display: "flex",
  gap: "20px",
};

const navLinkStyle = {
  color: "#0D1B2A", // Color más oscuro para los enlaces
  textDecoration: "none",
  fontWeight: "500",
};

const heroSectionStyle = {
  position: "relative",
  height: "400px", // Aumentado de 350px a 400px
  backgroundImage: `url('/src/assets/building.jpg')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const heroOverlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(27, 38, 59, 0.7)", // #1B263B con transparencia
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: "#E0E1DD", // Texto en color claro
  padding: "0 20px",
  textAlign: "center",
};

const heroTitleStyle = {
  fontSize: "2.4rem",  // Ligeramente reducido para Open Sans
  fontWeight: "700",
  margin: "0 0 15px 0",
};

const heroDescriptionStyle = {
  fontSize: "1.2rem",
  fontWeight: "300",
  margin: "0",
  maxWidth: "800px",
};

const mainContentStyle = {
  maxWidth: "1200px",
  margin: "40px auto 60px", // Cambiado de -60px a 40px
  padding: "0 20px",
  position: "relative",
  zIndex: "10",
};

const contentContainerStyle = {
  display: "flex",
  gap: "30px",
  flexWrap: "wrap",
};

const formContainerStyle = {
  flex: "1",
  minWidth: "300px",
  backgroundColor: "#ffffff",
  border: "1px solid #E0E1DD", // Cambia sombra por borde sutil
  overflow: "hidden",
  borderRadius: "4px", // Añade bordes redondeados
};

const formTitleStyle = {
  fontSize: "1.75rem",  // Ligeramente reducido para Open Sans
  fontWeight: "700",
  color: "#1B263B",
  padding: "25px 30px",
  margin: "0",
  borderBottom: "1px solid #E0E1DD",
};

const formStyle = {
  padding: "30px 40px", // Más padding horizontal
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#333333",
};

const inputStyle = {
  padding: "12px 15px",
  border: "1px solid #778DA9", // Borde en azul claro
  borderRadius: "0",
  fontSize: "0.95rem",
  backgroundColor: "#f9f9f9",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const errorMessageStyle = {
  backgroundColor: "#fff5f5",
  color: "#d32f2f",
  padding: "15px",
  fontSize: "0.9rem",
  borderLeft: "4px solid #d32f2f",
};

const buttonStyle = {
  backgroundColor: "#0D1B2A", // Color más oscuro para los botones
  color: "#E0E1DD", // Texto en color claro
  border: "none",
  padding: "14px 20px",
  fontSize: "0.95rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "background-color 0.3s",
  alignSelf: "flex-start",
  textTransform: "uppercase",
  letterSpacing: "1px",
  ':hover': {
    backgroundColor: "#1B263B", // Al pasar el cursor, cambia al segundo más oscuro
  }
};

const infoContainerStyle = {
  flex: "1",
  minWidth: "300px",
  backgroundColor: "#ffffff",
  border: "1px solid #E0E1DD", // Cambia sombra por borde sutil
  overflow: "hidden",
  borderRadius: "4px", // Añade bordes redondeados
};

const infoTitleStyle = {
  fontSize: "1.75rem",  // Ligeramente reducido para Open Sans
  fontWeight: "700",
  color: "#1B263B",
  padding: "25px 30px",
  margin: "0",
  borderBottom: "1px solid #E0E1DD",
};

const infoTextStyle = {
  fontSize: "0.95rem",
  lineHeight: "1.7",
  color: "#415A77", // Azul medio para el texto
  margin: "0 0 20px 0",
};

const infoImageStyle = {
  width: "100%",
  height: "auto",
  display: "block",
  transition: "opacity 0.3s ease-in-out",
};

// Nuevos estilos para el slideshow
const slideContentStyle = {
  padding: "30px 40px", // Más padding horizontal
};

const slideImageContainerStyle = {
  position: "relative",
  borderRadius: "0 0 4px 4px", // Bordes redondeados solo abajo
  overflow: "hidden",
};

const slideNavigationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "15px 0",
};

const slideButtonStyle = {
  backgroundColor: "#086ed4",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "12px",
  transition: "background-color 0.3s",
};

const slideDotContainerStyle = {
  display: "flex",
  gap: "8px",
};

const slideDotStyle = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  cursor: "pointer",
  transition: "background-color 0.3s",
};

const subtleButtonStyle = {
  backgroundColor: "transparent",
  color: "#086ed4",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  transition: "color 0.3s",
};

const downArrowStyle = {
  backgroundColor: 'transparent',
  color: 'rgba(13, 27, 42, 0.3)', // Color más oscuro con transparencia
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  transition: 'opacity 0.3s',
  margin: '10px auto 0',
  display: 'block',
  outline: 'none',
  padding: '5px 10px',
  ':hover': {
    opacity: '0.7'
  }
};

const footerStyle = {
  backgroundColor: "#1B263B", // Azul oscuro para el footer
  color: "#778DA9", // Texto en azul claro
  marginTop: "auto",
};

const footerContentStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "40px 20px",
};

const footerColumnContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "30px",
};

const footerColumnStyle = {
  flex: "1",
  minWidth: "200px",
};

const footerHeaderStyle = {
  fontSize: "1.2rem",
  color: "#E0E1DD", // Título en color claro
  margin: "0 0 15px 0",
  fontWeight: "700",
};

const footerTextStyle = {
  fontSize: "0.9rem",
  lineHeight: "1.6",
  margin: "0",
  color: "#778DA9", // Texto en azul claro
};

const copyrightStyle = {
  borderTop: "1px solid #415A77", // Borde en azul medio
  padding: "20px 0 0",
  marginTop: "30px",
  textAlign: "center",
};

const copyrightTextStyle = {
  fontSize: "0.85rem",
  color: "#778DA9", // Texto en azul claro
  margin: "0",
};

const slideAnimationContainerStyle = {
  overflow: 'hidden',
  position: 'relative',
  height: '300px', // Aumentado para mejor visualización
};

const fullWidthBgStyle = {
  backgroundColor: "#ffffff",
  padding: "60px 0",
};

const integratedContentStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px",
  display: "flex",
  gap: "40px",
  flexWrap: "wrap",
};

const formSideStyle = {
  flex: "1",
  minWidth: "300px",
  paddingRight: "40px",
  borderRight: "1px solid #E0E1DD",
};

const infoSideStyle = {
  flex: "1",
  minWidth: "300px",
};

export default Login;