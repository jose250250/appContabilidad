$(function () {
  cargarResumenDeudas();
});

$("#atrasd").click(function () {
  loadPage("frontPagos", "admin/");
});

// ===============================
// EXPORTAR A PDF
// ===============================
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

  // 🔹 Totales al final
  body.push([
    "Totales",
    $("#totalDeuda").text(),
    $("#totalPagos").text(),
    $("#totalSaldo").text(),
  ]);

  doc.autoTable({
    startY: 20,
    head: head,
    body: body,
    theme: "grid",
  });

  doc.save("resumen-deudas.pdf");
}

// ===============================
// IMPRIMIR
// ===============================
function imprimirTabla() {
  const tablaHtml = document.getElementById("tablaResumen")?.outerHTML || "";

  if (!tablaHtml) {
    alert("No hay datos para imprimir.");
    return;
  }

  const estilo = `
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      table {
        width: 100%;
        border-collapse: collapse;
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
        margin-bottom: 15px;
      }
    </style>
  `;

  const ventanaImpresion = window.open("", "_blank");
  if (!ventanaImpresion) return;

  ventanaImpresion.document.open();
  ventanaImpresion.document.write(`
    <html>
      <head>
        <title>Resumen de Deudas</title>
        ${estilo}
      </head>
      <body>
        <h2>Resumen de Deudas por Miembro</h2>
        ${tablaHtml}
      </body>
    </html>
  `);
  ventanaImpresion.document.close();
  ventanaImpresion.focus();
  ventanaImpresion.print();
  ventanaImpresion.close();
}


