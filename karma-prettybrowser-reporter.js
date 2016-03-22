
$(function(){
	$("td[colspan=6]").find("table").hide();
	$("table[class=browsers]").click(function(event){
		event.stopPropagation();
		var $target=$(event.target); 
		$target.closest("tr").next().find("table").slideToggle(); 
	});
});

$(function () {
    $('#browser-pass-fail-container').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Browsers Pass/Fail Stats'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Browsers',
            colorByPoint: true,
            data: [{
                name: 'Fail',
                y: bFail*100,
                color: '#FF0000'
            },{
                name: 'Pass',
                y: bPass*100,
                sliced: false,
                selected: true,
                color: '#00A000'
            },{
                name: 'Error',
                y: bError*100,
                sliced: false,
                selected: true,
                color: '#858484'
            }]
        }]
    });
});
