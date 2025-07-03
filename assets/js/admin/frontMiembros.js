$(function(){

 $("#btnNuevoMiembro").click(function(){
    loadPage("miembros", "admin/");
 })
  $("#btnVerLista").click(function(){
    loadPage("listaMiembros", "admin/");
 })
   $("#btnAsigUsuarios").click(function(){
    loadPage("asignarUsuario", "admin/");
 })
    $("#btnAtras").click(function(){
    loadPage("homeAdmin");
})


})