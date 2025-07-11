$(function(){
  cargarSalidasFondoU();
})


    $("#atras").click(function(){
    loadPage("frontSalidaU", "usuario/");
    });

      // Eventos de los botones
  $("#salidasM").on("click", function () {
    mostrarDiv("div1", this);
  });
  $("#salidasA").on("click", function () {
    mostrarDiv("div2", this);
  });
  $("#salidasMA").on("click", function () {
    mostrarDiv("div3", this);
  });  