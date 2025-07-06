async function cargarResumenDeudas() {
  const tablaBody = $("#tablaResumen tbody");
  tablaBody.empty();

  let totalDeudaGlobal = 0;
  let totalPagosGlobal = 0;

  const miembrosSnapshot = await db.collection("miembros").get();

  for (const miembroDoc of miembrosSnapshot.docs) {
    const miembroId = miembroDoc.id;
    const miembro = miembroDoc.data();
    const nombreCompleto = `${miembro.nombre} ${miembro.apellido || ""}`;

    let deudaTotal = 0;
    let pagosTotales = 0;

    // 1. Buscar todas las actividades
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

    totalDeudaGlobal += deudaTotal;
    totalPagosGlobal += pagosTotales;

    tablaBody.append(`
      <tr>
        <td>${nombreCompleto}</td>
        <td class="text-end">$${deudaTotal.toLocaleString()}</td>
        <td class="text-end">$${pagosTotales.toLocaleString()}</td>
        <td class="text-end">$${saldo.toLocaleString()}</td>
      </tr>
    `);
  }

  const totalSaldoGlobal = totalDeudaGlobal - totalPagosGlobal;

  $("#totalDeuda").text(`$${totalDeudaGlobal.toLocaleString()}`);
  $("#totalPagos").text(`$${totalPagosGlobal.toLocaleString()}`);
  $("#totalSaldo").text(`$${totalSaldoGlobal.toLocaleString()}`);
}

// Llamar al cargar la página
cargarResumenDeudas();
$("#atrasd").click(function () {
  loadPage("frontPagos", "admin/");
});
async function exportarTablaPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Resumen de Deudas por Miembro", 14, 15);

  const head = [["Miembro", "Deuda Total", "Pagos Totales", "Saldo"]];
  const body = [];

  $("#tablaResumen tbody tr").each(function () {
    const fila = [];
    $(this).find("td").each(function () {
      fila.push($(this).text().trim());
    });
    body.push(fila);
  });

  const totalRow = [
    "Totales:",
    $("#totalDeuda").text(),
    $("#totalPagos").text(),
    $("#totalSaldo").text()
  ];
  body.push(totalRow);

  doc.autoTable({
    startY: 20,
    head: head,
    body: body,
    theme: "grid"
  });

  doc.save("resumen-deudas.pdf");
}
function imprimirTabla() {
  const tablaHtml = document.getElementById("tablaResumen")?.outerHTML || "";
  const estilo = `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: center;
      }
      th {
        background-color: #f2f2f2;
      }
      h2 {
        text-align: center;
      }
    </style>
  `;

  const ventanaImpresion = window.open('', '_blank');
  if (ventanaImpresion) {
    ventanaImpresion.document.head.innerHTML = `<title>Resumen de Deudas</title>${estilo}`;
    ventanaImpresion.document.body.innerHTML = `
      <h2>Resumen de Deudas por Miembro</h2>
      ${tablaHtml}
    `;
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    ventanaImpresion.print();
    ventanaImpresion.close();
  }
}


