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

   $("#btnDistActividades").click(function(){
    loadPage("distActividades", "admin/");    
 })
    $("#btnAtras").click(function(){
    loadPage("homeAdmin");
})


})