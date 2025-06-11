import React, { useState, useEffect } from 'react';

const AuthApp = () => {
  // URL del servidor Java Spring Boot que maneja la autenticación JWT
  const [baseURL] = useState('http://localhost:8080');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Controla si el usuario está autenticado o no para mostrar login vs dashboard
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    usuarios: [],
    productos: [],
    stats: {
      totalUsuarios: 0,
      totalProductos: 0
    }
  });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    country: ''
  });
  const [showUserModal, setShowUserModal] = useState(false);
const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
const [selectedUser, setSelectedUser] = useState(null);
const [userFormData, setUserFormData] = useState({
  username: '',
  password: '',
  firstname: '',
  lastname: '',
  country: ''
});
const [showProductModal, setShowProductModal] = useState(false);
const [productModalMode, setProductModalMode] = useState('create');
const [selectedProduct, setSelectedProduct] = useState(null);
const [productFormData, setProductFormData] = useState({
  nombre: '',
  categoria: '',
  precio: '',
  stock: '',
  descripcion: ''
});
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10); // Mostrar 10 elementos por página
  // Función para limpiar alertas
  const clearAlerts = () => {
    setAlerts([]);
  };

  // Función para mostrar alertas
  const showAlert = (message, type) => {
    clearAlerts();
    const alertId = Date.now();
    setAlerts([{ id: alertId, message, type }]);
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, 5000);
  };

  // Función para mostrar/ocultar loading
  const showLoading = (show) => {
    setLoading(show);
  };

  // Función para alternar entre login y registro
  const toggleForm = () => {
    setIsLoginMode(!isLoginMode);
    clearAlerts();
    setFormData({
      username: '',
      password: '',
      firstname: '',
      lastname: '',
      country: ''
    });
  };
  

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Función para paginar datos
const paginateData = (data, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
};

// Función para calcular total de páginas
const getTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems / itemsPerPage);
};

// Función para cambiar página
const changePage = (pageNumber) => {
  setCurrentPage(pageNumber);
};

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      // Cargar usuarios
      const usuariosResponse = await fetch(`${baseURL}/api/usuarios`);
      const usuarios = usuariosResponse.ok ? await usuariosResponse.json() : [];

      // Cargar productos
      const productosResponse = await fetch(`${baseURL}/api/productos`);
      const productos = productosResponse.ok ? await productosResponse.json() : [];

      setDashboardData({
        usuarios: usuarios, // Cargar TODOS los usuarios
        productos: productos, // Cargar TODOS los productos
        stats: {
          totalUsuarios: usuarios.length,
          totalProductos: productos.length
        }
      });
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      // Datos de ejemplo si no hay conexión
      setDashboardData({
        usuarios: [
          { id: 1, username: 'admin', firstname: 'Admin', lastname: 'User', country: 'México' },
          { id: 2, username: 'user1', firstname: 'Juan', lastname: 'Pérez', country: 'España' },
          { id: 3, username: 'user2', firstname: 'María', lastname: 'García', country: 'Colombia' }
        ],
        productos: [
          { id: 1, nombre: 'Laptop HP', categoria: 'Electronics', precio: 899.99, stock: 15 },
          { id: 2, nombre: 'Mouse Inalámbrico', categoria: 'Accesorios', precio: 25.50, stock: 50 },
          { id: 3, nombre: 'Teclado Mecánico', categoria: 'Accesorios', precio: 120.00, stock: 30 }
        ],
        stats: {
          totalUsuarios: 25,
          totalProductos: 150
        }
      });
    }
  };
// Función para abrir modal de crear usuario
const openCreateUserModal = () => {
  setModalMode('create');
  setUserFormData({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    country: ''
  });
  setShowUserModal(true);
};

// Función para abrir modal de editar usuario
const openEditUserModal = (user) => {
  setModalMode('edit');
  setSelectedUser(user);
  setUserFormData({
    username: user.username,
    password: '',
    firstname: user.firstname,
    lastname: user.lastname,
    country: user.country
  });
  setShowUserModal(true);
};

// Función para cerrar modal
const closeUserModal = () => {
  setShowUserModal(false);
  setSelectedUser(null);
  setUserFormData({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    country: ''
  });
};

// Función para manejar cambios en el formulario de usuario
const handleUserFormChange = (e) => {
  const { name, value } = e.target;
  setUserFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Función para crear usuario
const createUser = async () => {
  try {
    showLoading(true);
    const response = await fetch(`${baseURL}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userFormData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear usuario');
    }

    showAlert('Usuario creado exitosamente', 'success');
    closeUserModal();
    loadDashboardData();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
};

// Función para actualizar usuario
const updateUser = async () => {
  try {
    showLoading(true);
    const response = await fetch(`${baseURL}/api/usuarios/${selectedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userFormData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar usuario');
    }

    showAlert('Usuario actualizado exitosamente', 'success');
    closeUserModal();
    loadDashboardData();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
};

// Función para eliminar usuario
const deleteUser = async (userId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    return;
  }

  try {
    showLoading(true);
    const response = await fetch(`${baseURL}/api/usuarios/${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }

    showAlert('Usuario eliminado exitosamente', 'success');
    loadDashboardData();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
};

// Función para manejar envío del formulario de usuario
const handleUserFormSubmit = (e) => {
  e.preventDefault();
  if (modalMode === 'create') {
    createUser();
  } else {
    updateUser();
  }
};
// Función para abrir modal de crear producto
const openCreateProductModal = () => {
  setProductModalMode('create');
  setProductFormData({
    nombre: '',
    categoria: '',
    precio: '',
    stock: '',
    descripcion: ''
  });
  setShowProductModal(true);
};

// Función para abrir modal de editar producto
const openEditProductModal = (product) => {
  setProductModalMode('edit');
  setSelectedProduct(product);
  setProductFormData({
    nombre: product.nombre,
    categoria: product.categoria,
    precio: product.precio.toString(),
    stock: product.stock.toString(),
    descripcion: product.descripcion || ''
  });
  setShowProductModal(true);
};

// Función para cerrar modal de producto
const closeProductModal = () => {
  setShowProductModal(false);
  setSelectedProduct(null);
  setProductFormData({
    nombre: '',
    categoria: '',
    precio: '',
    stock: '',
    descripcion: ''
  });
};

// Función para manejar cambios en el formulario de producto
const handleProductFormChange = (e) => {
  const { name, value } = e.target;
  setProductFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Función para crear producto
const createProduct = async () => {
  try {
    showLoading(true);
    const productData = {
      ...productFormData,
      precio: parseFloat(productFormData.precio),
      stock: parseInt(productFormData.stock)
    };
    
    const response = await fetch(`${baseURL}/api/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear producto');
    }

    showAlert('Producto creado exitosamente', 'success');
    closeProductModal();
    loadDashboardData();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
};

// Función para actualizar producto
const updateProduct = async () => {
  try {
    showLoading(true);
    const productData = {
      ...productFormData,
      precio: parseFloat(productFormData.precio),
      stock: parseInt(productFormData.stock)
    };
    
    const response = await fetch(`${baseURL}/api/productos/${selectedProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar producto');
    }

    showAlert('Producto actualizado exitosamente', 'success');
    closeProductModal();
    loadDashboardData();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
};

// Función para eliminar producto
const deleteProduct = async (productId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
    return;
  }

  try {
    showLoading(true);
    const response = await fetch(`${baseURL}/api/productos/${productId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Error al eliminar producto');
    }

    showAlert('Producto eliminado exitosamente', 'success');
    loadDashboardData();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
};

// Función para manejar envío del formulario de producto
const handleProductFormSubmit = (e) => {
  e.preventDefault();
  if (productModalMode === 'create') {
    createProduct();
  } else {
    updateProduct();
  }
};
  // Función de login y que envía credenciales al endpoint de login del backend Java
  const login = async (username, password) => {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    showAlert('¡Inicio de sesión exitoso!', 'success');
    
    setTimeout(() => {
      setIsAuthenticated(true);
      loadDashboardData();
      clearAlerts();
    }, 1000);
  };

  // Función de registro envía datos de registro al endpoint de registro del backend Java
  const register = async (username, password, firstname, lastname, country) => {
    const response = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, firstname, lastname, country })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar usuario');
    }

    showAlert('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
    
    setTimeout(() => {
      toggleForm();
      setFormData({
        username: '',
        password: '',
        firstname: '',
        lastname: '',
        country: ''
      });
    }, 2000);
  };

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { username, password, firstname, lastname, country } = formData;

    clearAlerts();
    showLoading(true);

    try {
      if (isLoginMode) {
        await login(username, password);
      } else {
        await register(username, password, firstname, lastname, country);
      }
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      showLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setIsAuthenticated(false);
    setActiveSection('dashboard');
    setFormData({
      username: '',
      password: '',
      firstname: '',
      lastname: '',
      country: ''
    });
    clearAlerts();
  };

  // Componente del gráfico de pastel simple
  const PieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="text-center">
        <h6 className="mb-3">{title}</h6>
        <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            currentAngle += angle;
            
            const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
            
            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={colors[index % colors.length]}
                  opacity="0.8"
                />
              </g>
            );
          })}
        </svg>
        <div className="mt-2">
          {data.map((item, index) => {
            const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
            return (
              <div key={index} className="d-flex align-items-center justify-content-center mb-1">
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: colors[index % colors.length],
                    marginRight: '8px'
                  }}
                ></div>
                <small>{item.label}: {item.value}</small>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar página de login
  if (!isAuthenticated) {
    const cardStyle = {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
    };

    const inputStyle = {
      borderRadius: '12px',
      border: '2px solid #e1e5e9',
      transition: 'all 0.3s ease',
      padding: '15px 20px',
      fontSize: '1rem'
    };

    const buttonPrimaryStyle = {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      padding: '15px',
      fontSize: '1.1rem',
      fontWeight: '600',
      textTransform: 'uppercase'
    };

    const buttonSecondaryStyle = {
      background: 'transparent',
      color: '#667eea',
      border: '2px solid #667eea',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      padding: '15px',
      fontSize: '1.1rem',
      fontWeight: '600'
    };

    const titleStyle = {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '10px'
    };

    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
           }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0" style={cardStyle}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h1 className="display-6 mb-2" style={{ fontSize: '3rem' }}>🔐</h1>
                    <h1 className="h2 fw-bold mb-2" style={titleStyle}>
                      {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h1>
                    <p className="text-muted fs-5">
                      {isLoginMode ? 'Accede a tu cuenta' : 'Únete a nosotros'}
                    </p>
                  </div>

                  {alerts.map(alert => (
                    <div key={alert.id} 
                         className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}
                         style={{ 
                           borderRadius: '12px',
                           padding: '15px 20px',
                           fontWeight: '500'
                         }}>
                      {alert.message}
                    </div>
                  ))}

                  {loading && (
                    <div className="text-center mb-4">
                      <div className="spinner-border text-primary mb-2" 
                           style={{ width: '40px', height: '40px' }} 
                           role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mb-0">Procesando...</p>
                    </div>
                  )}

                  <div>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label fw-semibold" style={{ color: '#333', fontSize: '0.95rem' }}>
                        Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        placeholder="Ingresa tu nombre de usuario"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#333', fontSize: '0.95rem' }}>
                        Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder="Ingresa tu contraseña"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        style={inputStyle}
                      />
                    </div>

                    {!isLoginMode && (
                      <>
                        <div className="mb-3">
                          <label htmlFor="firstname" className="form-label fw-semibold" style={{ color: '#333', fontSize: '0.95rem' }}>
                            Nombre
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="firstname"
                            name="firstname"
                            placeholder="Ingresa tu nombre"
                            value={formData.firstname}
                            onChange={handleInputChange}
                            required
                            style={inputStyle}
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="lastname" className="form-label fw-semibold" style={{ color: '#333', fontSize: '0.95rem' }}>
                            Apellido
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="lastname"
                            name="lastname"
                            placeholder="Ingresa tu apellido"
                            value={formData.lastname}
                            onChange={handleInputChange}
                            required
                            style={inputStyle}
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="country" className="form-label fw-semibold" style={{ color: '#333', fontSize: '0.95rem' }}>
                            País
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="country"
                            name="country"
                            placeholder="Ingresa tu país"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            style={inputStyle}
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      className="btn w-100 mb-3"
                      disabled={loading}
                      onClick={handleFormSubmit}
                      style={buttonPrimaryStyle}>
                      {isLoginMode ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
                    </button>

                    <button
                      type="button"
                      className="btn w-100"
                      onClick={toggleForm}
                      style={buttonSecondaryStyle}>
                      {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar dashboard después del login
  return (
    <div className="d-flex vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <div className="bg-primary text-white" style={{ width: '250px', minHeight: '100vh' }}>
        <div className="p-3">
          <h4 className="mb-4">📊 Sistema</h4>
          <nav className="nav flex-column">
            <button 
              className={`nav-link text-white btn btn-link text-start p-2 ${activeSection === 'dashboard' ? 'bg-light bg-opacity-25' : ''}`}
              onClick={() => setActiveSection('dashboard')}
              style={{ textDecoration: 'none', borderRadius: '5px' }}>
              📈 Dashboard
            </button>
            <button 
              className={`nav-link text-white btn btn-link text-start p-2 ${activeSection === 'productos' ? 'bg-light bg-opacity-25' : ''}`}
              onClick={() => setActiveSection('productos')}
              style={{ textDecoration: 'none', borderRadius: '5px' }}>
              📦 Productos
            </button>
            <button 
              className={`nav-link text-white btn btn-link text-start p-2 ${activeSection === 'usuarios' ? 'bg-light bg-opacity-25' : ''}`}
              onClick={() => setActiveSection('usuarios')}
              style={{ textDecoration: 'none', borderRadius: '5px' }}>
              👥 Usuarios
            </button>
            <hr className="my-3" />
            <button 
              className="nav-link text-white btn btn-link text-start p-2"
              onClick={logout}
              style={{ textDecoration: 'none', borderRadius: '5px' }}>
              🚪 Cerrar Sesión
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-grow-1 p-4">
        <div className="container-fluid">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Dashboard</h2>
                <span className="text-muted">Bienvenido al sistema</span>
              </div>

              {/* Cards de estadísticas */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h4>{dashboardData.stats.totalUsuarios}</h4>
                          <p className="mb-0">Usuarios</p>
                        </div>
                        <div className="display-6">👥</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h4>{dashboardData.stats.totalProductos}</h4>
                          <p className="mb-0">Productos</p>
                        </div>
                        <div className="display-6">📦</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <PieChart 
                        data={[
                          { label: 'Usuarios Activos', value: dashboardData.stats.totalUsuarios * 0.8 },
                          { label: 'Usuarios Inactivos', value: dashboardData.stats.totalUsuarios * 0.2 }
                        ]}
                        title="Estado de Usuarios"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <PieChart 
                        data={[
                          { label: 'En Stock', value: dashboardData.stats.totalProductos * 0.7 },
                          { label: 'Bajo Stock', value: dashboardData.stats.totalProductos * 0.2 },
                          { label: 'Sin Stock', value: dashboardData.stats.totalProductos * 0.1 }
                        ]}
                        title="Estado de Productos"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablas */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h5>Usuarios Recientes</h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Usuario</th>
                              <th>Nombre</th>
                              <th>País</th>
                            </tr>
                          </thead>
                            <tbody>
                              {paginateData(dashboardData.usuarios, currentPage, itemsPerPage).map(usuario => (
                                <tr key={usuario.id}>
                                <td>{usuario.username}</td>
                                <td>{usuario.firstname} {usuario.lastname}</td>
                                <td>{usuario.country}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                      </div>
                      
                    </div>
                    
                  </div>
                  
                </div>
                
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h5>Productos Recientes</h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Precio</th>
                              <th>Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.productos.map(producto => (
                              <tr key={producto.id}>
                                <td>{producto.nombre}</td>
                                <td>${producto.precio}</td>
                                <td>{producto.stock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Sección Productos */}
          {activeSection === 'productos' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Productos</h2>
<button className="btn btn-primary" onClick={openCreateProductModal}>+ Nuevo Producto</button>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Categoría</th>
                          <th>Precio</th>
                          <th>Stock</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.productos.map(producto => (
                          <tr key={producto.id}>
                            <td>{producto.id}</td>
                            <td>{producto.nombre}</td>
                            <td>{producto.categoria}</td>
                            <td>${producto.precio}</td>
                            <td>{producto.stock}</td>
                            <td>
                              <button 
  className="btn btn-sm btn-outline-primary me-1"
  onClick={() => openEditProductModal(producto)}>
  Editar
</button>
<button 
  className="btn btn-sm btn-outline-danger"
  onClick={() => deleteProduct(producto.id)}>
  Eliminar
</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Sección Usuarios */}
          {activeSection === 'usuarios' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Usuarios</h2>
                <button className="btn btn-primary" onClick={openCreateUserModal}>+ Nuevo Usuario</button>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Usuario</th>
                          <th>Nombre</th>
                          <th>Apellido</th>
                          <th>País</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.usuarios.map(usuario => (
                          <tr key={usuario.id}>
                            <td>{usuario.id}</td>
                            <td>{usuario.username}</td>
                            <td>{usuario.firstname}</td>
                            <td>{usuario.lastname}</td>
                            <td>{usuario.country}</td>
                            <td>
                              <button 
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => openEditUserModal(usuario)}>
                              Editar
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteUser(usuario.id)}>
                              Eliminar
                            </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    {/* Modal para Usuario */}
{showUserModal && (
  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
          </h5>
          <button type="button" className="btn-close" onClick={closeUserModal}></button>
        </div>
        <form onSubmit={handleUserFormSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre de Usuario</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={userFormData.username}
                onChange={handleUserFormChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Contraseña {modalMode === 'edit' && '(dejar vacío para no cambiar)'}
              </label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={userFormData.password}
                onChange={handleUserFormChange}
                required={modalMode === 'create'}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="firstname"
                value={userFormData.firstname}
                onChange={handleUserFormChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                className="form-control"
                name="lastname"
                value={userFormData.lastname}
                onChange={handleUserFormChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">País</label>
              <input
                type="text"
                className="form-control"
                name="country"
                value={userFormData.country}
                onChange={handleUserFormChange}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeUserModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (modalMode === 'create' ? 'Crear' : 'Actualizar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
{/* Modal para Producto */}
{showProductModal && (
  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {productModalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
          </h5>
          <button type="button" className="btn-close" onClick={closeProductModal}></button>
        </div>
        <form onSubmit={handleProductFormSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre del Producto</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={productFormData.nombre}
                onChange={handleProductFormChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <input
                type="text"
                className="form-control"
                name="categoria"
                value={productFormData.categoria}
                onChange={handleProductFormChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Precio</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="precio"
                value={productFormData.precio}
                onChange={handleProductFormChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Stock</label>
              <input
                type="number"
                className="form-control"
                name="stock"
                value={productFormData.stock}
                onChange={handleProductFormChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                name="descripcion"
                rows="3"
                value={productFormData.descripcion}
                onChange={handleProductFormChange}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeProductModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (productModalMode === 'create' ? 'Crear' : 'Actualizar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AuthApp;