$(function(){
cargarEstadoFondo();
})

    $("#atras").click(function(){
    loadPage("frontFondo", "admin/");
    });

function descargarEstadoPDF() {
  const element = document.getElementById("estadoFondo");

  // Crear un clon para evitar modificar el DOM original
  const clone = element.cloneNode(true);

  // Crear e insertar el elemento de fecha
  const fechaHoraActual = new Date().toLocaleString();
  const fechaDiv = document.createElement("p");
  fechaDiv.className = "text-end text-muted";
  fechaDiv.innerHTML = `<strong>Fecha de generación:</strong> ${fechaHoraActual}`;
  clone.prepend(fechaDiv);  // Lo añade al principio

  const wrapper = document.createElement("div");
  wrapper.appendChild(clone);

  const opt = {
    margin:       0.3,
    filename:     'estado_fondo .pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 3, scrollY: 0 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(wrapper).save();
}


function imprimirEstadoFondo() {
  const contenido = document.getElementById("estadoFondo").innerHTML;
  const fechaHoraActual = new Date().toLocaleString();

  const ventana = window.open('', '_blank');
  const doc = ventana.document;

  const html = doc.documentElement;
  const head = doc.head;
  const body = doc.body;

  // Crear elementos HEAD
  const title = doc.createElement('title');
  title.innerText = "Estado del Fondo";

  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';

  head.appendChild(title);
  head.appendChild(link);

  // Contenedor principal
  const container = doc.createElement('div');
  container.className = 'container mt-4';
  container.innerHTML = `
    <h3 class="text-center mb-3">📊 Estado Actual del Fondo</h3>
    <p class="text-end text-muted"><strong>Generado:</strong> ${fechaHoraActual}</p>
    <div class="card p-4">
      ${contenido}
    </div>
  `;

  body.appendChild(container);

  // Imprimir al cargar
  ventana.onload = () => {
    ventana.print();
    ventana.onafterprint = () => ventana.close();
  };
}



