$(function(){

$("#btnAgregarPago").click(function(){
     loadPage("pagos", "admin/");
});    
 
$("#btnDeudaMiembro").click(function(){
     loadPage("deudasMiembros", "admin/");     
})
$("#btnAtras").click(function(){
     loadPage("homeAdmin");
})


})