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
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // El usuario ha iniciado sesión
    console.log("Usuario autenticado:", user.email);
    mail = user.email;

    // Puedes acceder al UID si lo necesitas
    const uid = user.uid;

    // Por ejemplo, cargar su rol desde Firestore
    firebase
      .firestore()
      .collection("usuarios")
      .doc(uid)
      .get()
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
          } else if (rol === "usuario") {
            loadHeader("admin/");
            loadPage("homeUsuario", "usuario/");
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
async function cargarMiembros() {
  const tabla = $("#tablaMiembros tbody");
  tabla.empty();
  mostrarLoading(); // 🔄 Mostrar spinner antes de iniciar

  try {
    const querySnapshot = await firebase.firestore().collection("miembros").get();

    querySnapshot.forEach((doc) => {
      const m = doc.data();
      const fila = `
        <tr data-id="${doc.id}">
          <td>${m.nombre}</td>
          <td>${m.apellido}</td>
          <td>${m.tipoMiembro}</td>
          <td>
            <button class="btn btn-sm btn-info btn-editar me-2">Editar</button>
            <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
          </td>
        </tr>`;
      tabla.append(fila);
    });
  } catch (error) {
    console.error("Error al cargar los miembros:", error);
    alert("Ocurrió un error al cargar los miembros.");
  } finally {
    ocultarLoading(); // ✅ Siempre se ejecuta al final
  }
}

async function cargarMiembrosEnSelect() {
  mostrarLoading(); // 🔄 Mostrar spinner

  try {
    const querySnapshot = await firebase.firestore().collection("miembros").get();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      $("#miembroSelect").append(
        `<option value="${doc.id}">${data.nombre} ${data.apellido} - ${data.cc}</option>`
      );
    });
  } catch (error) {
    console.error("Error al cargar miembros en el select:", error);
    alert("Ocurrió un error al cargar los miembros.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner al final
  }
}

async function cargarActividades() {
  const tabla = $("#tablaActividades tbody");
  const totalGananciasCell = $("#totalGanancias");
  tabla.empty();
  totalGananciasCell.text("$0.00");

  mostrarLoading(); // 🔄 Mostrar spinner

  try {
    const actividadesRef = firebase.firestore().collection("actividades");
    const snapshot = await actividadesRef.orderBy("creada", "desc").get();
    let sumaGanancias = 0;

    if (snapshot.empty) {
      tabla.append('<tr><td colspan="9" class="text-center">No hay actividades registradas.</td></tr>');
      return;
    }

    for (const doc of snapshot.docs) {
      const a = doc.data();
      const actividadId = doc.id;

      // Obtener gastos
      const gastosSnap = await actividadesRef.doc(actividadId).collection("gastos").get();
      let totalGastos = 0;
      gastosSnap.forEach((g) => {
        const gasto = g.data();
        totalGastos += gasto.monto || 0;
      });

      // Calcular ganancia
      const ganancia = (a.total || 0) - totalGastos;
      sumaGanancias += ganancia;

      // Construir fila
      const fila = `
        <tr data-id="${actividadId}">
          <td>${a.nombre}  (${a.fecha})</td>
          <td>${a.total}</td>
          <td>$${totalGastos.toFixed(2)}</td>
          <td>$${ganancia.toFixed(2)}</td>
          <td>
             <button class="btn btn-sm btn-warning btn-editar m-1">Editar</button>
             <button class="btn btn-danger btn-sm btn-eliminar m-1">Eliminar</button>
          </td>
        </tr>
      `;

      tabla.append(fila);
    }

    totalGananciasCell.text(`$${sumaGanancias.toFixed(2)}`);
  } catch (error) {
    console.error("Error al cargar actividades:", error);
    alert("Hubo un error al cargar las actividades.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner al terminar
  }
}
function renderGastosForm(gastos = []) {
  $("#lineasGasto").empty();

  for (let i = 0; i < 5; i++) {
    const gasto = gastos[i] || { nombre: "", descripcion: "", monto: "" };

    $("#lineasGasto").append(`
  <div class="row mb-2 gasto-linea" style="border-bottom: 2px solid #ccc; padding-bottom: 10px;">
    <div class="col-md-3">
      <input type="text" class="form-control gasto-nombre" placeholder="Nombre del gasto" value="${
        gasto.nombre || ""
      }">
    </div>
    <div class="col-md-5">
      <input type="text" class="form-control gasto-desc" placeholder="Descripción" value="${
        gasto.descripcion || ""
      }">
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control gasto-monto" placeholder="Monto" value="${
        gasto.monto || ""
      }">
    </div>
  </div>
`);
  }
}
async function cargarDeudas(miembroId, nombreMiembro) {
  const tabla = $("#tablaDeudas");
  const tablaBody = tabla.find("tbody");
  tablaBody.empty();
  let deudas = [];
  let totalGeneral = 0;

  mostrarLoading(); // 🔄 Mostrar spinner bloqueante

  try {
    const actividadesSnapshot = await firebase.firestore().collection("actividades").get();
    const promesas = [];

    actividadesSnapshot.forEach((actividadDoc) => {
      const actividad = actividadDoc.data();
      const actividadId = actividadDoc.id;

      const asignacionRef = firebase
        .firestore()
        .collection("actividades")
        .doc(actividadId)
        .collection("miembrosActividad")
        .doc(miembroId);

      const promesa = asignacionRef.get().then((asignacionSnap) => {
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
              actividadId: actividadId,
            });

            totalGeneral += deudaActual;
          }
        }
      });

      promesas.push(promesa);
    });

    await Promise.all(promesas); // ⏳ Esperar todas las asignaciones

    if (deudas.length > 0) {
      tabla.removeClass("d-none");
      tablaBody.empty();

      deudas.forEach((d) => {
        const fila = `
          <tr>
            <td>${d.actividad} (${d.fecha})</td>
            <td class="text-end">$${d.valorDeuda.toLocaleString()}</td>
            <td class="text-end">$${d.totalPagado.toLocaleString()}</td>
            <td class="text-end fw-bold text-danger">$${d.deudaActual.toLocaleString()}</td>
            <td class="text-center">
              <button class="btn btn-sm btn-success btn-agregar-pago me-2" 
                data-miembro-id="${miembroId}" 
                data-actividad-id="${d.actividadId}">
                Agregar pago
              </button>
              <button class="btn btn-sm btn-warning btn-editar-pago"
                data-miembro-id="${miembroId}" 
                data-actividad-id="${d.actividadId}">
                Editar
              </button>
            </td>
          </tr>
        `;
        tablaBody.append(fila);
      });

      tablaBody.append(`
        <tr class="fw-bold table-secondary">
          <td colspan="3" class="text-end">Total deuda actual:</td>
          <td class="text-end text-danger">$${totalGeneral.toLocaleString()}</td>
          <td></td>
        </tr>
      `);
    } else {
      tabla.addClass("d-none");
      alert(`El miembro ${nombreMiembro} no tiene deudas.`);
    }
  } catch (error) {
    console.error("Error al cargar deudas:", error);
    alert("Hubo un error al obtener las deudas.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner siempre, incluso si hay error
  }
}


async function cargarMiembros2() {
  const miembrosSelect = $("#miembrosSelect");
  miembrosSelect.empty();
  miembrosSelect.append(`<option value="">Seleccione un miembro</option>`);

  mostrarLoading(); // 🔄 Mostrar spinner

  try {
    const snapshot = await firebase.firestore().collection("miembros").get();
    let miembros = [];

    snapshot.forEach((doc) => {
      let data = doc.data();
      miembros.push({
        id: doc.id,
        nombre: data.nombre || "",
        apellido: data.apellido || "",
      });
    });

    // 🔤 Ordenar alfabéticamente por nombre y luego por apellido
    miembros.sort((a, b) => {
      let nombreA = a.nombre.toLowerCase();
      let nombreB = b.nombre.toLowerCase();
      if (nombreA === nombreB) {
        return a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase());
      }
      return nombreA.localeCompare(nombreB);
    });

    // 📝 Agregar opciones al select
    miembros.forEach((m) => {
      const option = `<option value="${m.id}">${m.nombre} ${m.apellido}</option>`;
      miembrosSelect.append(option);
    });
  } catch (error) {
    console.error("Error al cargar miembros:", error);
    alert("Hubo un error al cargar los miembros.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner
  }
}


function entradaFondo() {
  const formEntrada = document.getElementById("formEntrada");

  formEntrada.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fecha = document.getElementById("fecha").value;
    const tipo = document.getElementById("tipo").value;
    const cantidad = parseFloat(document.getElementById("cantidad").value);
    const descripcion = document.getElementById("descripcion").value.trim();

    if (!fecha || !tipo || isNaN(cantidad) || cantidad <= 0 || !descripcion) {
      alert("Por favor complete todos los campos correctamente.");
      return;
    }

    try {
      await firebase
        .firestore()
        .collection("fondoEntradas")
        .add({
          fecha: new Date(fecha),
          tipo,
          cantidad,
          descripcion,
          creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
        });

      alert("Entrada registrada correctamente.");
      formEntrada.reset();
    } catch (error) {
      console.error("Error al guardar la entrada:", error);
      alert("Ocurrió un error al guardar la entrada.");
    }
  });
}
async function cargarSalidasFondo() {
  const tablaBody = $("#tablaSalidas tbody");
  const totalSalidasEl = $("#totalSalidas");
  tablaBody.empty();

  let total = 0;

  mostrarLoading(); // 🔄 Mostrar spinner

  try {
    const salidasSnap = await firebase
      .firestore()
      .collection("fondoSalidas")
      .orderBy("fecha", "desc")
      .get();

    salidasSnap.forEach((doc) => {
      const s = doc.data();
      const id = doc.id;

      let fecha = "Sin fecha";
      if (s.fecha?.toDate) {
        fecha = s.fecha.toDate().toISOString().split("T")[0];
      }

      const motivo = s.motivo || "Sin motivo";
      const cantidad = s.cantidad || 0;

      tablaBody.append(`
        <tr data-id="${id}">
          <td>${fecha}</td>
          <td>${motivo}</td>
          <td class="text-end">$${cantidad.toLocaleString()}</td>
          <td>
            <button class="btn btn-sm btn-primary btn-editar-salida"
              data-id="${id}" 
              data-fecha="${fecha}" 
              data-motivo="${motivo}" 
              data-cantidad="${cantidad}">
              Editar
            </button>
            <button class="btn btn-sm btn-danger btn-eliminar-salida" data-id="${id}">
              Eliminar
            </button>
          </td>
        </tr>
      `);

      total += cantidad;
    });

    totalSalidasEl.text(`$${total.toLocaleString()}`);
  } catch (error) {
    console.error("Error al cargar salidas:", error);
    alert("Error al cargar salidas del fondo.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner
  }
}

async function cargarEntradasFondo() {
  const tbody = $("#tablaEntradas tbody");
  const totalEl = $("#totalEntradas");
  tbody.empty();

  let total = 0;

  mostrarLoading(); // 🔄 Mostrar spinner

  try {
    const snapshot = await firebase
      .firestore()
      .collection("fondoEntradas")
      .orderBy("fecha", "desc")
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const fecha = data.fecha?.toDate().toISOString().split("T")[0] || "Sin fecha";
      const motivo = data.descripcion || "Sin descripción";
      const tipo = data.tipo || "Sin tipo";
      const cantidad = data.cantidad || 0;

      total += cantidad;

      const fila = `
        <tr data-id="${doc.id}">
          <td>${fecha}</td>
          <td>${motivo}</td>
          <td>${tipo}</td>
          <td>$${cantidad.toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-warning btn-editar" data-id="${doc.id}">Editar</button>
            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${doc.id}">Eliminar</button>
          </td>
        </tr>
      `;
      tbody.append(fila);
    });

    totalEl.text(`$${total.toFixed(2)}`);
  } catch (error) {
    console.error("Error al cargar entradas:", error);
    alert("No se pudo cargar la lista de entradas.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner al finalizar
  }
}

function salidasFondo() {
  const formSalida = document.getElementById("formSalida");

  formSalida.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fecha = document.getElementById("fechaSalida").value;
    const motivo = document.getElementById("motivo").value.trim();
    const cantidad = parseFloat(
      document.getElementById("cantidadSalida").value
    );

    if (!fecha || !motivo || isNaN(cantidad) || cantidad <= 0) {
      alert("Por favor complete todos los campos correctamente.");
      return;
    }

    try {
      await firebase
        .firestore()
        .collection("fondoSalidas")
        .add({
          fecha: new Date(fecha),
          motivo,
          cantidad,
          creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
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

  mostrarLoading(); // 🔄 Mostrar spinner

  try {
    // 1. Entradas manuales
    const entradasSnap = await db.collection("fondoEntradas").get();
    entradasSnap.forEach((doc) => {
      entradasManuales += parseFloat(doc.data().cantidad || 0);
    });

    // 2. Salidas manuales
    const salidasSnap = await db.collection("fondoSalidas").get();
    salidasSnap.forEach((doc) => {
      salidasManuales += parseFloat(doc.data().cantidad || 0);
    });

    // 3. Recorrer actividades
    const actividadesSnap = await db.collection("actividades").get();

    for (const actividadDoc of actividadesSnap.docs) {
      const actividad = actividadDoc.data();
      const actividadId = actividadDoc.id;
      const precioUnidad = actividad.precioUnidad || 0;

      // 3.1 Miembros asignados
      const miembrosSnap = await db
        .collection("actividades")
        .doc(actividadId)
        .collection("miembrosActividad")
        .get();

      miembrosSnap.forEach((doc) => {
        const asignacion = doc.data();
        const cantidad = asignacion.cantidad || 0;
        const pagado = asignacion.totalPagado || 0;

        const totalPorMiembro = cantidad * precioUnidad;
        entradasActividades += totalPorMiembro;
        totalPagado += pagado;
        totalDeuda += totalPorMiembro - pagado;
      });

      // 3.2 Gastos de actividad
      const gastosSnap = await db
        .collection("actividades")
        .doc(actividadId)
        .collection("gastos")
        .get();

      gastosSnap.forEach((doc) => {
        gastosActividades += parseFloat(doc.data().monto || 0);
      });
    }

    const totalEntradas = entradasManuales + entradasActividades;
    const totalSalidas = salidasManuales + gastosActividades;
    const saldo = totalEntradas - totalSalidas;
    const efectivo = saldo - totalDeuda;

    // Mostrar en pantalla
    $("#entradasManuales").text(`$${entradasManuales.toLocaleString()}`);
    $("#entradasActividades").text(`$${entradasActividades.toLocaleString()}`);
    $("#totalEntradas").text(`$${totalEntradas.toLocaleString()}`);

    $("#salidasManuales").text(`$${salidasManuales.toLocaleString()}`);
    $("#gastosActividades").text(`$${gastosActividades.toLocaleString()}`);
    $("#totalSalidas").text(`$${totalSalidas.toLocaleString()}`);

    $("#saldoFondo").text(`$${saldo.toLocaleString()}`);
    $("#dineroEfectivo").text(`$${efectivo.toLocaleString()}`);
    $("#deudasPendientes").text(`$${totalDeuda.toLocaleString()}`);
  } catch (error) {
    console.error("Error al calcular estado del fondo:", error);
    alert("Hubo un error al calcular el estado del fondo.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner pase lo que pase
  }
}

async function cargarActividadesU() {
  const tabla = $("#tablaActividades tbody");
  const totalGananciasCell = $("#totalGanancias");
  tabla.empty(); // Limpiar tabla antes de insertar
  totalGananciasCell.text("$0.00");

  const actividadesRef = firebase.firestore().collection("actividades");
  let sumaGanancias = 0;

  mostrarLoading(); // 🔄 Mostrar spinner

  try {
    const snapshot = await actividadesRef.orderBy("creada", "desc").get();

    if (snapshot.empty) {
      tabla.append(
        '<tr><td colspan="9" class="text-center">No hay actividades registradas.</td></tr>'
      );
      return;
    }

    for (const doc of snapshot.docs) {
      const a = doc.data();
      const actividadId = doc.id;

      // 1. Obtener total de gastos
      const gastosSnap = await actividadesRef
        .doc(actividadId)
        .collection("gastos")
        .get();

      let totalGastos = 0;
      gastosSnap.forEach((g) => {
        const gasto = g.data();
        totalGastos += gasto.monto || 0;
      });

      // 2. Calcular ganancia
      const ganancia = (a.total || 0) - totalGastos;
      sumaGanancias += ganancia;

      // 3. Construir la fila
      const fila = `
      <tr data-id="${actividadId}">
          <td>${a.nombre}  (${a.fecha})</td>
          <td>${a.total}</td>
          <td>$${totalGastos.toFixed(2)}</td>
          <td>$${ganancia.toFixed(2)}</td>
        </tr>
      `;

      tabla.append(fila);
    }

    // 4. Mostrar total de ganancias abajo
    totalGananciasCell.text(`$${sumaGanancias.toFixed(2)}`);
  } catch (error) {
    console.error("Error al cargar actividades:", error);
    alert("Hubo un error al cargar las actividades.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner pase lo que pase
  }
}

async function cargarEntradasFondoU() {
  const tbody = $("#tablaEntradas tbody");
  const totalEl = $("#totalEntradas");
  tbody.empty();

  let total = 0;

  mostrarLoading(); // ⏳ Mostrar spinner de carga

  try {
    const snapshot = await firebase
      .firestore()
      .collection("fondoEntradas")
      .orderBy("fecha", "desc")
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const fecha =
        data.fecha?.toDate().toISOString().split("T")[0] || "Sin fecha";
      const motivo = data.descripcion || "Sin descripción";
      const tipo = data.tipo || "Sin tipo";
      const cantidad = data.cantidad || 0;

      total += cantidad;

      const fila = `
        <tr data-id="${doc.id}">
          <td>${fecha}</td>
          <td>${motivo}</td>
          <td>${tipo}</td>
          <td>$${cantidad.toFixed(2)}</td>
        </tr>
      `;
      tbody.append(fila);
    });

    totalEl.text(`$${total.toFixed(2)}`);
  } catch (error) {
    console.error("Error al cargar entradas:", error);
    alert("No se pudo cargar la lista de entradas.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner sin importar el resultado
  }
}

async function cargarSalidasFondoU() {
  const tablaBody = $("#tablaSalidas tbody");
  const totalSalidasEl = $("#totalSalidas");
  tablaBody.empty();

  let total = 0;

  mostrarLoading(); // ⏳ Mostrar spinner

  try {
    const salidasSnap = await firebase
      .firestore()
      .collection("fondoSalidas")
      .orderBy("fecha", "desc")
      .get();

    salidasSnap.forEach((doc) => {
      const s = doc.data();
      const id = doc.id;

      let fecha = "Sin fecha";
      if (s.fecha?.toDate) {
        fecha = s.fecha.toDate().toISOString().split("T")[0];
      }

      const motivo = s.motivo || "Sin motivo";
      const cantidad = s.cantidad || 0;

      tablaBody.append(`
        <tr data-id="${id}">
          <td>${fecha}</td>
          <td>${motivo}</td>
          <td class="text-end">$${cantidad.toLocaleString()}</td>
        </tr>
      `);

      total += cantidad;
    });

    totalSalidasEl.text(`$${total.toLocaleString()}`);
  } catch (error) {
    console.error("Error al cargar salidas:", error);
    alert("Error al cargar salidas del fondo.");
  } finally {
    ocultarLoading(); // ✅ Ocultar spinner, sin importar éxito o error
  }
}

async function cargarResumenDeudas() {
  // Mostrar loading y bloquear scroll
  mostrarLoading();

  const tablaBody = $("#tablaResumen tbody");
  tablaBody.empty();

  let totalDeudaGlobal = 0;
  let totalPagosGlobal = 0;

  try {
    const miembrosSnapshot = await db.collection("miembros").get();

    for (const miembroDoc of miembrosSnapshot.docs) {
      const miembroId = miembroDoc.id;
      const miembro = miembroDoc.data();
      const nombreCompleto = `${miembro.nombre} ${miembro.apellido || ""}`;

      let deudaTotal = 0;
      let pagosTotales = 0;

      const actividadesSnapshot = await db.collection("actividades").get();

      for (const actividadDoc of actividadesSnapshot.docs) {
        const actividad = actividadDoc.data();
        const actividadId = actividadDoc.id;

        const miembroActividadRef = db
          .collection("actividades")
          .doc(actividadId)
          .collection("miembrosActividad")
          .doc(miembroId);

        const miembroActividadSnap = await miembroActividadRef.get();

        if (miembroActividadSnap.exists) {
          const asignacion = miembroActividadSnap.data();
          const cantidad = asignacion.cantidad || 0;
          const precioUnidad = actividad.precioUnidad || 0;
          const totalPagado = asignacion.totalPagado || 0;

          deudaTotal += cantidad * precioUnidad;
          pagosTotales += totalPagado;
        }
      }

      const saldo = deudaTotal - pagosTotales;

      if (saldo > 0) {
        tablaBody.append(`
          <tr>
            <td>${nombreCompleto}</td>
            <td class="text-end">$${deudaTotal.toLocaleString()}</td>
            <td class="text-end">$${pagosTotales.toLocaleString()}</td>
            <td class="text-end text-danger">$${saldo.toLocaleString()}</td>
          </tr>
        `);

        totalDeudaGlobal += deudaTotal;
        totalPagosGlobal += pagosTotales;
      }
    }

    const totalSaldoGlobal = totalDeudaGlobal - totalPagosGlobal;
    $("#totalSaldo").text(`$${totalSaldoGlobal.toLocaleString()}`);

  } catch (error) {
    console.error("Error al cargar resumen de deudas:", error);
    alert("Ocurrió un error al cargar las deudas.");
  } finally {
    // Ocultar loading y reactivar scroll
    ocultarLoading();
  }
}


function mostrarLoading() {
  $("body").css("overflow", "hidden");
  $("#loadingOverlay")
    .css("display", "flex")  // Activar el display flex para centrar
    .hide()                  // Luego ocultarlo para aplicar el fadeIn
    .fadeIn(200);            // Animación de entrada
}


function ocultarLoading() {
  $("body").css("overflow", "auto");
  $("#loadingOverlay").fadeOut(200, function () {
    $(this).css("display", "none");
  });
}



