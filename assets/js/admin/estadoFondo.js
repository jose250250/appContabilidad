$(function(){
cargarEstadoFondo();
})

    $("#atras").click(function(){
    loadPage("frontFondo", "admin/");
    });

function descargarEstadoPDF() {
  const element = document.getElementById("estadoFondo");

  const opt = {
    margin:       0.3,
    filename:     'estado_fondo.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 3, scrollY: 0 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(element).save();
}

