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
  const totalGananciasCell = $("#totalGanancias");
  tabla.empty(); // Limpiar tabla antes de insertar
  totalGananciasCell.text("$0.00");

  const actividadesRef = firebase.firestore().collection("actividades");
  let sumaGanancias = 0;

  actividadesRef.orderBy("creada", "desc").get()
    .then(async snapshot => {
      if (snapshot.empty) {
        tabla.append('<tr><td colspan="9" class="text-center">No hay actividades registradas.</td></tr>');
        return;
      }

      for (const doc of snapshot.docs) {
        const a = doc.data();
        const actividadId = doc.id;

        // 1. Obtener total de gastos
        const gastosSnap = await actividadesRef.doc(actividadId).collection("gastos").get();
        let totalGastos = 0;
        gastosSnap.forEach(g => {
          const gasto = g.data();
          totalGastos += gasto.monto || 0;
        });

        // 2. Calcular ganancia
        const ganancia = (a.total || 0) - totalGastos;
        sumaGanancias += ganancia;

        // 3. Construir la fila
        const fila = `
          <tr data-id="${actividadId}">
            <td>${a.nombre}</td>
            <td>${a.descripcion}</td>
            <td>${a.fecha}</td>
            <td>${a.cantUnidades}</td>
            <td>$${a.precioUnidad.toFixed(2)}</td>
            <td>$${a.total.toFixed(2)}</td>
            <td>$${totalGastos.toFixed(2)}</td>
            <td>$${ganancia.toFixed(2)}</td>
            <td>
              <button class="btn btn-sm btn-warning btn-editar">Editar</button>
              <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
            </td>
          </tr>
        `;

        tabla.append(fila);
      }

      // 4. Mostrar total de ganancias abajo
      totalGananciasCell.text(`$${sumaGanancias.toFixed(2)}`);
    })
    .catch(error => {
      console.error("Error al cargar actividades:", error);
    });
}

function renderGastosForm(gastos = []) {
        $("#lineasGasto").empty();

        for (let i = 0; i < 5; i++) {
          const gasto = gastos[i] || { nombre: "", descripcion: "", monto: "" };

          $("#lineasGasto").append(`
            <div class="row mb-2 gasto-linea">
              <div class="col-md-3">
                <input type="text" class="form-control gasto-nombre" placeholder="Nombre del gasto" value="${gasto.nombre || ''}">
              </div>
              <div class="col-md-5">
                <input type="text" class="form-control gasto-desc" placeholder="Descripción" value="${gasto.descripcion || ''}">
              </div>
              <div class="col-md-2">
                <input type="number" class="form-control gasto-monto" placeholder="Monto" value="${gasto.monto || ''}">
              </div>
            </div>
          `);
        }
      }
function cargarDeudas(miembroId, nombreMiembro) {
  const tabla = $("#tablaDeudas");
  const tablaBody = tabla.find("tbody");
  tablaBody.empty();
  let deudas = [];
  let totalGeneral = 0;

  firebase.firestore().collection("actividades").get()
    .then(snapshot => {
      const promesas = [];

      snapshot.forEach(actividadDoc => {
        const actividad = actividadDoc.data();
        const actividadId = actividadDoc.id;

        const asignacionRef = firebase.firestore()
          .collection("actividades")
          .doc(actividadId)
          .collection("miembrosActividad")
          .doc(miembroId);

        const promesa = asignacionRef.get().then(asignacionSnap => {
          if (asignacionSnap.exists) {
            const asignacion = asignacionSnap.data();

            if (asignacion.cantidad > 0) {
              const valorUnidad = actividad.precioUnidad || 0;
              const valorDeuda = asignacion.cantidad * valorUnidad;
              const totalPagado = asignacion.totalPagado || 0;
              const deudaActual = valorDeuda - totalPagado;

              deudas.push({
                actividad: actividad.nombre,
                fecha: actividad.fecha,
                cantidad: asignacion.cantidad,
                valorDeuda: valorDeuda,
                totalPagado: totalPagado,
                deudaActual: deudaActual,
                actividadId: actividadId
              });

              totalGeneral += deudaActual;
            }
          }
        });

        promesas.push(promesa);
      });

      return Promise.all(promesas);
    })
    .then(() => {
      if (deudas.length > 0) {
        tabla.removeClass("d-none");
        tablaBody.empty();

        // Encabezado personalizado si deseas generarlo dinámicamente
        // (O asegúrate de tenerlo en tu HTML)

        deudas.forEach(d => {
          const fila = `
            <tr>
              <td>${d.actividad}</td>
              <td>${d.fecha}</td>
              <td class="text-end">$${d.valorDeuda.toLocaleString()}</td>
              <td class="text-end">$${d.totalPagado.toLocaleString()}</td>
              <td class="text-end fw-bold text-danger">$${d.deudaActual.toLocaleString()}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-success btn-agregar-pago" 
                        data-miembro-id="${miembroId}" 
                        data-actividad-id="${d.actividadId}">
                  Agregar pago
                </button>
              </td>
            </tr>
          `;
          tablaBody.append(fila);
        });

        tablaBody.append(`
          <tr class="fw-bold table-secondary">
            <td colspan="5" class="text-end">Total deuda actual:</td>
            <td class="text-end text-danger">$${totalGeneral.toLocaleString()}</td>
            <td></td>
          </tr>
        `);
      } else {
        tabla.addClass("d-none");
        alert(`El miembro ${nombreMiembro} no tiene deudas.`);
      }
    })
    .catch(error => {
      console.error("Error al cargar deudas:", error);
      alert("Hubo un error al obtener las deudas.");
    });
}

function cargarMiembros2() {
  const miembrosSelect = $("#miembrosSelect"); // Asegúrate de tenerlo en tu HTML
  miembrosSelect.empty();
  miembrosSelect.append(`<option value="">Seleccione un miembro</option>`);

  firebase.firestore().collection("miembros").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const m = doc.data();
        const option = `<option value="${doc.id}">${m.nombre} ${m.apellido}</option>`;
        miembrosSelect.append(option);
      });
    });
  }
function entradaFondo(){
const formEntrada = document.getElementById("formEntrada");

formEntrada.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fecha = document.getElementById("fecha").value;
  const tipo = document.getElementById("tipo").value;
  const cantidad = parseFloat(document.getElementById("cantidad").value);

  if (!fecha || !tipo || isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor complete todos los campos correctamente.");
    return;
  }

  try {
    await firebase.firestore().collection("fondoEntradas").add({
      fecha: new Date(fecha),
      tipo,
      cantidad,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Entrada registrada correctamente.");
    formEntrada.reset();
  } catch (error) {
    console.error("Error al guardar la entrada:", error);
    alert("Ocurrió un error al guardar la entrada.");
  }
});
}  

function salidasFondo(){

const formSalida = document.getElementById("formSalida");

formSalida.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fecha = document.getElementById("fechaSalida").value;
  const motivo = document.getElementById("motivo").value.trim();
  const cantidad = parseFloat(document.getElementById("cantidadSalida").value);

  if (!fecha || !motivo || isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor complete todos los campos correctamente.");
    return;
  }

  try {
    await firebase.firestore().collection("fondoSalidas").add({
      fecha: new Date(fecha),
      motivo,
      cantidad,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Salida registrada correctamente.");
    formSalida.reset();
  } catch (error) {
    console.error("Error al registrar la salida:", error);
    alert("Ocurrió un error al registrar la salida.");
  }
});
    
}

async function cargarEstadoFondo() {
  let entradasManuales = 0;
  let entradasActividades = 0;
  let salidasManuales = 0;
  let gastosActividades = 0;
  let totalPagado = 0;
  let totalDeuda = 0;

  const db = firebase.firestore();

  // 1. Entradas manuales
  const entradasSnap = await db.collection("fondoEntradas").get();
  entradasSnap.forEach(doc => {
    entradasManuales += parseFloat(doc.data().cantidad || 0);
  });

  // 2. Salidas manuales
  const salidasSnap = await db.collection("fondoSalidas").get();
  salidasSnap.forEach(doc => {
    salidasManuales += parseFloat(doc.data().cantidad || 0);
  });

  // 3. Recorrer actividades
  const actividadesSnap = await db.collection("actividades").get();

  for (const actividadDoc of actividadesSnap.docs) {
    const actividad = actividadDoc.data();
    const actividadId = actividadDoc.id;
    const precioUnidad = actividad.precioUnidad || 0;

    // 3.1 Miembros asignados
    const miembrosSnap = await db.collection("actividades").doc(actividadId).collection("miembrosActividad").get();

    miembrosSnap.forEach(doc => {
      const asignacion = doc.data();
      const cantidad = asignacion.cantidad || 0;
      const pagado = asignacion.totalPagado || 0;

      const totalPorMiembro = cantidad * precioUnidad;
      entradasActividades += totalPorMiembro;
      totalPagado += pagado;
      totalDeuda += (totalPorMiembro - pagado);
    });

    // 3.2 Gastos de actividad (si los manejas en una subcolección)
    const gastosSnap = await db.collection("actividades").doc(actividadId).collection("gastos").get();
    gastosSnap.forEach(doc => {
      gastosActividades += parseFloat(doc.data().monto || 0);
    });
  }

  const totalEntradas = entradasManuales + entradasActividades;
  const totalSalidas = salidasManuales + gastosActividades;
  const saldo = totalEntradas - totalSalidas;

  // Mostrar en pantalla
  $("#entradasManuales").text(`$${entradasManuales.toLocaleString()}`);
  $("#entradasActividades").text(`$${entradasActividades.toLocaleString()}`);
  $("#totalEntradas").text(`$${totalEntradas.toLocaleString()}`);

  $("#salidasManuales").text(`$${salidasManuales.toLocaleString()}`);
  $("#gastosActividades").text(`$${gastosActividades.toLocaleString()}`);
  $("#totalSalidas").text(`$${totalSalidas.toLocaleString()}`);

  $("#saldoFondo").text(`$${saldo.toLocaleString()}`);
  $("#dineroEfectivo").text(`$${totalPagado.toLocaleString()}`);
  $("#deudasPendientes").text(`$${totalDeuda.toLocaleString()}`);
}


