

// Llamar al cargar la página
cargarResumenDeudas();
$("#atrasd").click(function () {
  loadPage("frontActividadesU", "usuario/");
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


