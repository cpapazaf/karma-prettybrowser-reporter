
$(function(){
	$("td[colspan=6]").find("table").hide();
	$("table[class=browsers]").click(function(event){
		event.stopPropagation();
		var $target=$(event.target); 
		$target.closest("tr").next().find("table").slideToggle(); 
	});
});