$(document).ready(() => {
  cargarEntradasFondoU();
});
$("#atrasent").click(function(){
     loadPage("frontEntradaU", "usuario/");
})

  // Eventos de los botones
  $("#entradasM").on("click", function () {
    mostrarDiv("div1", this);
  });
  $("#entradasA").on("click", function () {
    mostrarDiv("div2", this);
  });
  $("#entradasMA").on("click", function () {
    mostrarDiv("div3", this);
  });