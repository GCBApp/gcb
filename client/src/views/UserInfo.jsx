import React from "react";
import "./UserInfo.css";
import { useLocation } from "react-router-dom";

function UserInfo() {
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <div>No se encontró información del usuario.</div>;
  }

  return (
    <div className="container">
      <div className="main-body">
        <div className="row gutters-sm">
          <div className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex flex-column align-items-center text-center">
                  <img src="https://i.pinimg.com/564x/d1/51/62/d15162b27cd9712860b90abe58cb60e7.jpg" alt="Avatar" className="rounded-circle" width="150" />
                  <div className="mt-3">
                    <h4>{user.US_nombre}</h4>
                    <p className="text-secondary mb-1">{user.TU_descripcion}</p>
                    <p className="text-muted font-size-sm">{user.US_correo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card mb-3">
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-3">
                    <h6 className="mb-0">Nombre</h6>
                  </div>
                  <div className="col-sm-9 text-secondary">
                    {user.US_nombre}
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-sm-3">
                    <h6 className="mb-0">Correo</h6>
                  </div>
                  <div className="col-sm-9 text-secondary">
                    {user.US_correo}
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-sm-3">
                    <h6 className="mb-0">Tipo de usuario</h6>
                  </div>
                  <div className="col-sm-9 text-secondary">
                    {user.TU_descripcion}
                  </div>
                </div>
                {/* ...puedes dejar el resto del diseño igual o eliminar lo que no necesites... */}
              </div>
            </div>
            {/* ...resto del diseño... */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;