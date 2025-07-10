$(function(){

$("#btnAgregarPago").click(function(){
     loadPage("pagos", "admin/");
});    
 
$("#btnDeudaMiembro").click(function(){
     loadPage("deudasMiembros", "admin/");     
})

$("#btnDeudaActividad").click(function(){
     loadPage("deudasPorActividad", "admin/");     
})

$("#btnAtras").click(function(){
     loadPage("homeAdmin");
})


})