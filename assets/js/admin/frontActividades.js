$(function(){

 $("#btnNuevaAct").click(function(){
    loadPage("actividades", "admin/");
 })
  $("#btnVerLista").click(function(){
    loadPage("listaActividades", "admin/");
 })
   $("#btnAgregarGasto").click(function(){
    loadPage("asigGasto", "admin/");
 })
    $("#btnAtras").click(function(){
    loadPage("homeAdmin");
})


})