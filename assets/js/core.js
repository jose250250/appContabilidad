let mail = "";
let rol = "";


function loadZone(pathOrigin, idElement) {
  const numeroAleatorio = Math.random();
  $.ajax({
    url: pathOrigin + "?n=" + numeroAleatorio,
    type: "GET",
    success: function (result) {
      $("#" + idElement).html(result);
    },
    error: function (xhr, status, error) {},
  });
}
function loadHeader(root) {
  root = root === null || root === undefined ? "" : root;
  var url = "templates/" + root + "header.html";
  var idContent = "header";
  loadZone(url + "?e=h", idContent);
}
function loadFooter(root) {
  root = root === null || root === undefined ? "" : root;
  var url = "templates/" + root + "foother.html";
  var idContent = "foother";
  loadZone(url + "?e=f", idContent);
}
function loadPage(page, root, variables) {
  variables =
    variables === null || variables === undefined || variables === ""
      ? "t=1"
      : variables;
  root = root === null || root === undefined ? "" : root;
  var url = "templates/" + root + "pages/" + page + ".html";
  var idContent = "content";
  loadZone(url + "?" + variables, idContent);
}
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // El usuario ha iniciado sesión
      console.log("Usuario autenticado:", user.email);
      mail = user.email;
      
      // Puedes acceder al UID si lo necesitas
      const uid = user.uid;

      // Por ejemplo, cargar su rol desde Firestore
      firebase.firestore().collection("usuarios").doc(uid).get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            rol = data.rol;
            console.log("Rol:", rol);

            // Redirigir o mostrar contenido
            if (rol === "administrador") {
                loadHeader("admin/");

              // Mostrar panel admin
                loadPage("homeAdmin");
            } else if(rol=== "usuario"){
              // Mostrar panel usuario
              loadPage("homeUsuario");
            }
          } else {
            loadPage("login");
          }
        });

    } else {
      // No hay sesión activa
      console.log("No hay usuario autenticado");
      // window.location.href = "/login.html"; // Opcional
      loadPage("login");
    }
  });
function cargarMiembros() {
  const tabla = $("#tablaMiembros tbody");
  tabla.empty();

  firebase.firestore().collection("miembros").get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const m = doc.data();
        const fila = `
          <tr data-id="${doc.id}">
            <td>${m.nombre}</td>
            <td>${m.apellido}</td>
            <td>${m.cc}</td>
            <td>${m.celular}</td>
            <td>${m.email}</td>
            <td>${m.tipoMiembro}</td>
            <td>
              <button class="btn btn-sm btn-warning btn-editar">Editar</button>
              <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
            </td>
          </tr>`;
        tabla.append(fila);
      });
    });
}
function cargarMiembrosEnSelect() {
  firebase.firestore().collection("miembros").get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        $("#miembroSelect").append(
          `<option value="${doc.id}">${data.nombre} ${data.apellido} - ${data.cc}</option>`
        );
      });
    });
}
  function cargarActividades() {
    const tabla = $("#tablaActividades tbody");
    tabla.empty(); // Limpiar tabla antes de insertar

    firebase.firestore().collection("actividades").orderBy("creada", "desc").get()
      .then(snapshot => {
        if (snapshot.empty) {
          tabla.append('<tr><td colspan="7" class="text-center">No hay actividades registradas.</td></tr>');
          return;
        }

        snapshot.forEach(doc => {
          const a = doc.data();
          const fila = `
            <tr data-id="${doc.id}">
              <td>${a.nombre}</td>
              <td>${a.descripcion}</td>
              <td>${a.fecha}</td>
              <td>${a.cantUnidades}</td>
              <td>$${a.precioUnidad.toFixed(2)}</td>
              <td>$${a.total.toFixed(2)}</td>
              <td>
                <button class="btn btn-sm btn-warning btn-editar">Editar</button>
                <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
              </td>
            </tr>
          `;
          tabla.append(fila);
        });
      })
      .catch(error => {
        console.error("Error al cargar actividades:", error);
      });
  }

    function renderGastosForm() {
      let html = "";
      for (let i = 1; i <= 5; i++) {
        html += `
          <div class="row g-2 mb-3 gasto-linea">
            <div class="col-md-3">
              <input type="text" class="form-control gasto-nombre" placeholder="Gasto ${i}">
            </div>
            <div class="col-md-4">
              <input type="text" class="form-control gasto-desc" placeholder="Descripción">
            </div>
            <div class="col-md-2">
              <input type="number" class="form-control gasto-monto" placeholder="Monto">
            </div>
            <div class="col-md-3">
              <input type="file" class="form-control gasto-file" accept="image/*,application/pdf">
            </div>
          </div>
        `;
      }
      $("#gastosContainer").html(html);
    }  




