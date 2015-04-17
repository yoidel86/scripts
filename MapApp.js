var app = {
    $tree: null,
    map: null,
    layerCaller: [],
    layersMap: [],

    init: function () {
        /*****MAP INITIALIZATION*****/

        app.initMap();

        /*****GLOBAL SETTINGS*****/

        $('li.level1').click(function () {
            var title = $(this).find('a').attr("title");
            if ($.inArray(title, app.layerCaller) < 0)
                app.service.call(title);
        });

        $("button.ol-zoom-in span").text("Aumentar zoom");
        $("button.ol-zoom-out span").text("Disminuir zoom");

        $("ul.navbar-nav li").click(function () {
            $("div.navbar-collapse.collapse").removeClass("in");
        });

        app.$tree = $("div.mapContainer_jstree").detach();

        var actualHeight = $(document).innerHeight();
        var navHeight = $("nav").outerHeight();
        var charmHeight = actualHeight - navHeight;
        var charmHeaderHeight = $("#charm header").outerHeight();
        var charmContentHeight = charmHeight - navHeight - charmHeaderHeight - 15;

        $("#charmContent").height(charmContentHeight);

        $(window).resize(function () {
            actualHeight = $(document).innerHeight();
            charmHeight = actualHeight - navHeight;
            charmContentHeight = charmHeight - navHeight - charmHeaderHeight - 15;

            $("#charmContent").height(charmContentHeight);
        });

        $("#charm i.icon-left").click(function () {
            app.charm.openClose();
        });

        $("nav.navbar.navbar-fixed-top li").click(function () {
            app.charm.click(this);
        });
    },

    initMap: function () {
        app.map = new Map({
            target: 'mapCt',
            showCoordinates: true,
            showScalebar: true,
            initialZoom: 7,
            _layervisible: false,
            startAt: [-79.053491, 21.212557],
            layers: [
                {
                    //FisicoCuba, GoogleEarthPlusBaseCuba
                    type: 'TileWMS',
                    url: 'http://..../WMSServer',
                    layers: ['0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55'],
                    attributes: {
                        visible: true,
                        name: 'Layer_Base_Cuba',
                        id: 'Mapa_Base_Cuba',
                        image: '/Content/images//Map/mapa-1.png'
                    }
                },
                {
                    //FisicoCuba, GoogleEarthPlusBaseCuba
                    type: 'TileWMS',
                    url: 'http://.../WMSServer',
                    layers: ['0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51'],
                    attributes: {
                        visible: false,
                        name: 'Layer_Google_Cuba',
                        id: 'Mapa_Google_Cuba',
                        image: '/Content/images//Map/mapa-1.png'
                    }
                },
                {
                    //FisicoCuba, GoogleEarthPlusBaseCuba
                    type: 'TileWMS',
                    url: 'http://.../WMSServer',
                    layers: ['0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51'],
                    attributes: {
                        visible: false,
                        name: 'Layer_CN_Cuba',
                        id: 'Mapa_CN_Cuba',
                        image: '/Content/images//Map/mapa-1.png'
                    }
                }/*,
                {
                    //FisicoCuba, GoogleEarthPlusBaseCuba
                    type: 'TileWMS',
                    url: 'http://..../WMSServer',
                    layers: ['0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51'],
                    attributes: {
                        visible: false,
                        name: 'Layer_DPA_Cuba',
                        id: 'Mapa_DPA_Cuba',
                        image: '/Content/images//Map/mapa-1.png'
                    }
                },
                {
                    //FisicoCuba, GoogleEarthPlusBaseCuba
                    type: 'TileWMS',
                    url: 'http://.../MapServer/WMSServer',
                    layers: ['0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51'],
                    attributes: {
                        visible: false,
                        name: 'Layer_FisicoCuba_Cuba',
                        id: 'Mapa_FisicoCuba_Cuba',
                        image: '/Content/images//Map/mapa-1.png'
                    }
                },
                {
                    //FisicoCuba, GoogleEarthPlusBaseCuba
                    type: 'TileWMS',
                    url: 'http://.../WMSServer',
                    layers: ['0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51'],
                    attributes: {
                        visible: false,
                        name: 'Layer_FisicoCuba_Cuba',
                        id: 'Mapa_FisicoCuba_Cuba',
                        image: '/Content/images//Map/mapa-1.png'
                    }
                }*/
            ]/*,
            graticule: true*/
        });

        app.map.addGraphicLayer('Hoteles', '../ClientBin/Images/NHotel.png', { name: 'Hoteles' });
        app.map.hideLayer("Hoteles");

        app.map.addGraphicLayer('Barcos', '../ClientBin/Images/NBarco.png', { name: 'Barcos' });
        app.map.hideLayer("Barcos");

       

        app.map.addGraphicLayer('PuntosControl', '../ClientBin/Images/NPuntoControl.png', { name: 'Puntos de Control' });
        app.map.hideLayer("PuntosControl");


        app.map.addGraphicLayer('Aeropuertos', '../ClientBin/Images/NAereopuerto.png', { name: 'Aeropuertos' });
        app.map.hideLayer("Aeropuertos");

        app.map.showTree();
    },

    initPartials: {
        initBuscarPartial: function () { },
        initFiltrarPartial: function () { },
        initTapizPartial: function () {
            var $itemsMenu = $('#tapiz li');

            var layerMapVisibleId;

            $.each(app.map._layers, function (index, layer) {
                if (layer.attributes.visible) {
                    layerMapVisibleId = layer.attributes.id;
                }
            });

            $itemsMenu.each(function() {
                if ('Mapa_' + $(this).data('layerMapId') + '_Cuba' == layerMapVisibleId) {
                    $(this).addClass('nav-item-selected');
                }
            });

            $itemsMenu.click(function () {
                var layerMapId = 'Mapa_' + $(this).data('layerMapId') + '_Cuba';

                $.each(app.map._layers, function (index, layer) {
                    var layerId = layer.attributes.id;

                    if (layerId == layerMapId) {
                        app.map.showLayer(layerId);
                    } else {
                        app.map.hideLayer(layerId);
                    }
                });

                $(this).addClass('nav-item-selected');
                $(this).siblings().removeClass('nav-item-selected');
            });
        },
        initClusterPartial: function () { },
        initClasificacionesPartial: function () { }
    },

    charm: {
        $charm: $("#charm"),
        title: "",
        contentHistory: {},
        click: function (elem) {
            var title = $(elem).data('actionName');
            if (!this.isOpened())
                this.openClose();

            if (this.title == title)
                this.openClose();
            else {
                if ($('#charmTitle').text().length != 0) {
                    this.contentHistory[$('#charmTitle').text()] = this.$charm.children('#charmContent').children().first().detach();
                }

                $('#charmTitle').text(title);
                this.title = title;

                if (title == 'Capas') {
                    if (this.contentHistory[title]) {
                        this.$charm.children('#charmContent').append(this.contentHistory[title]);
                    } else {
                        this.$charm.children('#charmContent').append(app.$tree);
                    }
                } else {
                    if (this.contentHistory[title]) {
                        this.$charm.children('#charmContent').append(this.contentHistory[title]);
                    } else {
                        this.showHideIndicator(true);
                        this.loadContent(title, $(elem).data('actionUrl'));
                    }
                }
            }
        },
        isOpened: function () {
            if (this.$charm.css("opacity") == 0)
                return false;
            return true;
        },
        openClose: function () {
            if (!this.isOpened()) {
                this.$charm.animate(
                {
                    right: 0,
                    opacity: 1
                }, 100);
            } else {
                this.$charm.animate(
                {
                    right: -this.$charm.outerWidth(),
                    opacity: 0
                }, 100);
            }
        },
        loadContent: function (title, url, params) {
            $(this.$charm.children("#charmContent")).load(url, params, function () {
                app.charm.showHideIndicator(false);

                var initPartialFuncName = 'app.initPartials.init' + title + 'Partial()';
                app.utils.callFunction(initPartialFuncName);
            });
        },
        showHideIndicator: function (flag) {
            $("#indicator").toggleClass("indicator-show", flag);
        }
    },

    service: {
        call: function (title) {
            app.charm.showHideIndicator(true);

            //Se construlle el camino a las peticiones de servicio para llamarlas de forma dinamica
            var func = 'app.service.get' + title.replace(/ /g, "") + "()";

            //Se procede a llamar a las peticiones de servicio de forma dinamica
            app.utils.callFunction(func);

            app.layerCaller.push(title);
        },
        getHoteles: function () {
            $.getJSON("Hoteles", {},
                function (data) {

                    var hoteles = app.utils.sortBykey(data, "Provincia");

                    for (var i = 0; i < hoteles.length; i++) {


                        var provin = hoteles[i].Provincia == "" ? "Sin Provincia" : hoteles[i].Provincia;
                        var titulo = hoteles[i].Titulo == "" ? "Sin nombre" : hoteles[i].Titulo;
                        var cadena = hoteles[i].Cadena == "" ? "Sin cadena" : hoteles[i].Cadena;


                        var lparov = app.map.getGraphicLayerById(provin);
                        if (!lparov) {
                            app.map.addGraphicLayer(provin, '../ClientBin/Images/NHotel.png', { parent: 'Hoteles', nombre: provin, name: provin, addLayerControl: false });

                        }
                        var lcadena = app.map.getGraphicLayerById(provin + cadena);
                        if (!lcadena) {
                            app.map.addGraphicLayer(provin + cadena, '../ClientBin/Images/NHotel.png', { parent: provin, nombre: cadena, name: cadena, addLayerControl: false });

                        }


                        // console.log("pro:"+provin +"nombre:"+titulo+"cadena:"+cadena);
                        app.map.addPoint(hoteles[i].X.replace(",", ".") * 1, hoteles[i].Y.replace(",", ".") * 1, "<p>" + titulo + "</p>", null, null, { idLayer: provin + cadena, name: titulo, descripcion: cadena });
                        //console.log(app.map);
                    }

                    // app.map.hideLayer("Hoteles");

                    app.charm.showHideIndicator(false);
                });
        },
        getBarcos: function () {
            $.getJSON("Barcos", {},
                function (barc) {
                    for (var i = 0; i < barc.length; i++) {
                        var titulo = barc[i].Titulo == "" ? "Sin nombre" : barc[i].Titulo;
                        app.map.addPoint(barc[i].X.replace(",", ".") * 1, barc[i].Y.replace(",", ".") * 1, "<p>" + titulo + "</p>", null, null, { idLayer: "Barcos", name: titulo, descripcion: titulo });
                    }
                    // app.map.hideLayer("Barcos");

                    app.charm.showHideIndicator(false);
                });

        },
      
        getPuntosdeControl: function () {
            $.getJSON("PuntosControl", {},
                function (data) {

                    // var pcontrol = app.utils.sortBykey(data, "Provincia");

                    for (var i = 0; i < data.length; i++) {


                        var provin = data[i].Provincia == "" ? "Sin Provincia" : data[i].Provincia;
                        var titulo = data[i].Titulo == "" ? "Sin nombre" : data[i].Titulo;
                        var hubicacion = data[i].Hubicacion == "" ? "Sin hubicacion" : data[i].Hubicacion;


                        var lparov = app.map.getGraphicLayerById(provin);
                        if (!lparov) {
                            app.map.addGraphicLayer(provin, '../ClientBin/Images/NPuntoControl.png', { parent: 'PuntosControl', nombre: provin, name: provin, addLayerControl: false });

                        }
                        //var lhubic = app.map.getGraphicLayerById(provin + hubicacion);
                        //if (!lhubic) {
                        //    app.map.addGraphicLayer(provin + hubicacion, '../ClientBin/Images/NPuntoControl.png', { parent: provin, nombre: hubicacion, name: hubicacion, addLayerControl: false });

                        //}


                        // console.log("pro:"+provin +"nombre:"+titulo+"cadena:"+cadena);
                        app.map.addPoint(data[i].X.replace(",", ".") * 1, data[i].Y.replace(",", ".") * 1, "<p>" + titulo + "</p>", null, null, { idLayer: provin, name: titulo, descripcion: hubicacion });
                        ////console.log(app.map);
                    }

                    // app.map.hideLayer("Hoteles");

                    app.charm.showHideIndicator(false);

                });
        },
     
        getAeropuertos: function () {
            $.getJSON("Aeropuertos ", {},
                function (data) {

                  
                    for (var i = 0; i < data.length; i++) {
                   
                        var titulo = data[i].Titulo == "" ? "Sin nombre" : data[i].Titulo;
                       
                        app.map.addPoint(data[i].X.replace(",", ".") * 1, data[i].Y.replace(",", ".") * 1, "<p>" + titulo + "</p>", null, null, { idLayer: "Aeropuertos", name: titulo, descripcion: titulo });
                        ////console.log(app.map);
                    }

              
                    app.charm.showHideIndicator(false);

                });
        }
    },

    utils: {
        sortBykey: function (array, key) {
            return array.sort(function (a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        },
        normalizar: function (str) {

            if (str[str.length - 1] == '.')
                str = str.substr(0, str.length - 1);

            str = str.replace('/', '-');
            return str;
        },
        callFunction: function (func) {
            //Con el siguiente codigo se llama de forma dinamica a las funciones nombradas en el parametro func
            var caller = "constructor";
            caller[caller][caller](func)();
        }
    }
};

$(document).ready(app.init());