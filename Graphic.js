var chart;
var series = [];
var categorias = [];

var series1 = [];
var categorias1 = [];



function CrearGrafico(tipografico) {
    
    opciones = {
    chart: {
        type: tipografico,
        
        renderTo: "graficos",
        borderColor: '#a1a1a1',
        borderWidth: 4,
        borderRadius: 8,
        marginTop: 80,
        
        options3d: {
            enabled: true,
            alpha: 25,
            beta: 0
        }
    },
    plotOptions: {
        
        series: {
            animation: {
                duration: 1500,
                easing: 'swing'
            }
        },
        column: {
            colorByPoint: true,
            depth:25
        },
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            depth: 35,
            dataLabels: {
                enabled: true,
                format: '{point.name}: <b>{point.percentage:.1f}%</b>'
            }
        }
        
    },
    title: {
            text: ''
    },
    xAxis: {
        category: categorias,
        type: 'category',
        labels: {
            step: 1,
            rotation: -45
        },
        lineWidth: 2,
        tickWidth: 3,
        tickLength: 6,
        minorTickLength: 3,
        minorTickWidth: 1,
        minorTickColor: '#D8D8D8'
    },
    yAxis: {
        title: {
            text: 'Valor',
            rotation: 0,
            y: -20,
            margin: -25,
            align: 'high'
        },
        min: 0,
        lineWidth: 2,
        tickWidth: 3,
        tickLength: 6,
        minorTickLength: 3,
        minorTickWidth: 1,
        minorTickColor: '#D8D8D8'
    },
    credits: {
        position: {
            align: 'right',
            y: -15
        },
        text: 'Portal del Enfretamiento'
        
    },
    tooltip: {
        formatter: function () {
            var resp = '<b>' + this.x + '</b>' + ' : ' + this.y;
            if (tipografico == "pie") {
                resp = '<b>' + series[0].name + '</b>' + ' : ' + this.y;
            }
            return resp;
        }
    },
    legend: {
       enabled:false
    },
    series: [{}]
    }

    chart = new Highcharts.Chart(opciones);
    chart.series[0].setData(series);
    return chart;

    
}

function Clean() {

    if (chart) {
        chart.series[0].remove();
        series1 = series;
        categorias1 = categorias;

        series = [];
        categorias = [];

    }
}

function OrdMayorMenor() {

    var auxValor;
    var auxCategorias;
    
    for (var i = 0; i < series.length; i++) {
        for (var j = i; j < series.length; j++) {
            if (series[i].y < series[j].y) {
                auxValor = series[i].y;
                auxCategorias = categorias[i];
                //Valores
                series[i].y = series[j].y;
                categorias[i] = categorias[j];
                //Nombre
                series[j].y = auxValor;
                categorias[j] = auxCategorias;

            }
        }
        
    }
    
    chart.xAxis[0].setCategories(categorias);
    chart.series[0].update(series);
    chart.redraw();
    
}
function OrdMenorMayor() {

    var auxValor;
    var auxCategorias;
    
    for (var i = 0; i < series.length-1; i++) {
        for (var j = i+1; j < series.length; j++) {
            if (series[i].y > series[j].y ) {
                auxValor = series[i].y;
                auxCategorias = categorias[i];
                //Valores
                series[i].y = series[j].y;
                categorias[i] = categorias[j];
                //Nombre
                series[j].y = auxValor;
                categorias[j] = auxCategorias;

            }
        }

    }
    
    chart.xAxis[0].setCategories(categorias);
    chart.series[0].setData(series);
    chart.redraw();
}

function CambiarSpline() {
    
    var config = CrearGrafico("spline");
    
    config.xAxis[0].setCategories(categorias);
    config.series[0].setData(series);
    
    config.redraw();
    console.log(chart);

}

function CambiarLine() {

    var config = CrearGrafico("line");

    config.xAxis[0].setCategories(categorias);
    config.series[0].setData(series);

    config.redraw();
    console.log(chart);

}


function CambiarColumn() {

    var config = CrearGrafico("column");

    config.xAxis[0].setCategories(categorias);
    config.series[0].setData(series);

    config.redraw();
    console.log(chart);

}

function CambiarPie() {

    var config = CrearGrafico("pie");

    config.xAxis[0].setCategories(categorias);

    var data = [];

    for (var i = 0; i < series.length; i++) {

        var datos = { name: categorias[i], data: series[i] };
        data.push(datos);
    }
    
    config.series[0].setData(data);

    config.redraw();
    console.log(chart);

}