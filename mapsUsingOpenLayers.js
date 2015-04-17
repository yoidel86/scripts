var Map = function (config) {
    this._target = config.target;
    this._showCoordinates = config.showCoordinates;
    this._showOptionsTools = config.showOptionsTools == undefined ? true : config.showOptionsTools;
    this._showScalebar = config.showScalebar == undefined ? false : config.showScalebar;    
    this._layers = config.layers || [];
    this._initialZoom = config.initialZoom;
    this._startAt = config.startAt;
    this._myMap = null;
    this._layervisible = null;
    this._arrBasicLayers = new Array();
    this._context = this;
    this._graticule = config.graticule;
    this._treeVisble = false;
    this._Tree = null;    
    this._onAddPoint = config.onAddPoint;
    this._onAddPolygon = config.onAddPolygon;
    this._onAddLyne = config.onAddLyne;
    this._toolbarsActivate = false;
    this._onPan = config.onPan;
    this._onAddCircle = config.onAddCircle;
    this._allGraphicAux = [];
    var graphicId = 1;
    var _context = this;
    var draw = null;
    var divAux = null;
    var divAux1 = null;
    /////////////////////////////////////Faltan////////////////////////////////////////////   
    this._onZoom = config.onZoom;
    this._onAddMultiPoint = config.onAddMultiPoint;
    this._showOverview = config.showOverview == undefined ? false : config.showOverview;  
   
    /////////////////////////////////////Layers////////////////////////////////////////////    
    this.addGraphicLayer = function (idLayer, icom, attributes) {
        var attr = { isGraphicLayer: true, isVolumenLayer: false, convert: true, children: [], addLayerControl: true, defaults: { offset: [0.5, 0.5] },visible:true };
        $.extend(attr, attributes);
        attr.id = idLayer || 'Capa_Dinamica';
        attr.icom = icom ? icom : '/Content/images/Osiris/Map/marker.png';
        attr.parent = attr.parent == undefined ? 'raiz' : attributes.parent;
        var parent = this.getGraphicLayerById(attr.parent);
        if (parent) {
            _.defaults(attr.defaults, parent.attributes.defaults);
        }       
        attr.parent = attr.parent == 'raiz' ? 'raiz' : 'layer' + attributes.parent;
        attr.name = attr.name || attr.id;
        var vectorSource = new ol.source.Vector({
            features: []
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });
        vectorLayer.attributes = attr;
        if (parent) {
            parent.attributes.children.push(vectorLayer);            
        }
        this._myMap.addLayer(vectorLayer);
        var _template = _.template('<div id="<%=id%>" title="<%=name%>" class="layer-graphic-ct"><img style="vertical-align: middle;z-index: -1;height: 20px;width: 20px" src="<%=icon%>" /></div>');
        if (this._zTree.getNodeByParam('id', attr.parent)) {
            this._zTree.addNodes(this._zTree.getNodeByParam('id', attr.parent), { id: 'layer' + attr.id, name: attr.name, icon: attr.icom, isLayer: true, checked: true });
        }      
      
        var node = this._zTree.getNodeByParam('id', attr.parent);
        if (node && !node.checked) {
            this.hideLayer(attr.id);
        }  
        if (attr.addLayerControl) {
            var h = _template({
                id: attr.id,
                icon: attr.icom,
                name: attr.name
            })
            if (attr.id != 'cuba') {
                this._layerControlCt.append(h);
                $("#" + attr.id).click(function () {
                    if ($(this).hasClass('div-selected')) {
                        $('.layer-graphic-ct.div-selected').removeClass('div-selected');
                        _context._layerGraphicCtOptions.remove();
                    }
                    else {
                        $('.layer-graphic-ct.div-selected').removeClass('div-selected');
                        $(this).addClass('div-selected');
                        if (_context._layerGraphicCtOptions) {
                            _context._layerGraphicCtOptions.remove();
                        }
                        var btn = $(this);
                        var offset = btn.offset()
                        offset.top += btn.outerHeight() + 5;
                        _context._layerGraphicCtOptions = $('<div id="layer-graphic-ct-options' + attr.id + '" class="layer-graphic-ct-options hidde">').appendTo($('#' + _context._target));
                        _context._layerGraphicCtOptions.offset(offset);
                        _context._layerGraphicCtOptions.toggleClass('hidde');
                        var arrow = $('<span class="map-up-arrow"></span>').appendTo($(_context._layerGraphicCtOptions));
                        var divShowHideLayer = $('<div title="show/hide-layer" class="div-show-hide-layer">').appendTo($(_context._layerGraphicCtOptions));
                        $(divShowHideLayer).click(function () {
                            var layer = _context.getGraphicLayerById(attr.id);
                            if (layer) {
                                if (layer.getVisible()) {
                                    _context.hideLayer(attr.id);
                                }
                                else {
                                    _context.showLayer(attr.id);
                                }
                            }
                        });
                        var divClusterLayer = $('<div title="cluster layer" class="div-cluster-layer">').appendTo($(_context._layerGraphicCtOptions));
                        $(divClusterLayer).click(function () {
                            var layer = _context.getGraphicLayerById(attr.id);
                            if (layer) {
                                if (layer.attributes.isClusterLayer) {
                                    _context.convertToGraphicLayer(attr.id);
                                }
                                else {
                                    _context.convertToClusterLayer(attr.id);
                                }
                                
                            }
                        });
                        var divHeatLayer = $('<div title="heat layer" class="div-heat-layer">').appendTo($(_context._layerGraphicCtOptions));
                        $(divHeatLayer).click(function () {
                            var layer = _context.getGraphicLayerById(attr.id);
                            if (layer) {
                                if (layer.attributes.isHeatLayer) {
                                    _context.convertToGraphicLayer(attr.id);
                                }
                                else {
                                    _context.convertToHeatLayer(attr.id);
                                }
                                
                            }
                        });
                        var divGraphicLayer = $('<div title="graphic layer" class="div-graphic-layer">').appendTo($(_context._layerGraphicCtOptions));
                        $(divGraphicLayer).click(function () {
                            var layer = _context.getGraphicLayerById(attr.id);
                            if (layer) {
                                _context.convertToGraphicLayer(attr.id);
                            }
                        });
                        var divVolumenLayer = $('<div title="volumen layer" class="div-volumen-layer">').appendTo($(_context._layerGraphicCtOptions));
                        $(divVolumenLayer).click(function () {
                            var layer = _context.getGraphicLayerById(attr.id);
                            if (layer) {
                                if (layer.attributes.isVolumenLayer) {
                                    _context.convertToGraphicLayer(attr.id);
                                }
                                else {
                                    _context.addVolumeProvinceLayer(attr.id);
                                }
                                
                            }
                        });
                    }
                });
            }        
        } 
        return vectorLayer;
    };
    this.addLayer = function (layer) {
        switch (layer.type) {
            case "TileWMS": {
                var newLayer = new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url: layer.url,
                        params: { 'LAYERS': layer.layers, VERSION: '1.1.1' }
                    })
                });
                var attr = { isBasicLayer: true,  };
                $.extend(attr, layer.attributes);
                newLayer.attributes = attr;
                if (!newLayer.attributes.id) {
                    newLayer.attributes.id = 'layerBaseUndefined';
                }
                this._myMap.addLayer(newLayer);
                if (attr.visible) {
                    this.layeractivo = newLayer;
                }
                else {
                    newLayer.setVisible(false);
                }
                this._arrBasicLayers.push(newLayer);
                var template;
                if (attr.image) {
                    if (attr.visible) {
                        this._tapizCt = $('<div title=' + attr.id + ' id=' + attr.id + ' class="tapiz-ct div-selected"></div>').appendTo(this._tapizControlCt);
                    }
                    else {
                        this._tapizCt = $('<div id=' + attr.id + ' class="tapiz-ct"></div>').appendTo(this._tapizControlCt);
                    }
                    template = $('<img style="height: 75px;width: 75px;" src=' + attr.image + ' />');
                    template.appendTo(this._tapizCt);
                } else {
                    this._tapizCt = $('<div id=' + attr.id + ' class="tapiz-ct"></div>').appendTo(this._tapizControlCt);
                    template = $('<img style="vertical-align: middle;z-index: -1;height: 75px;width: 75px" src="/Content/images/Osiris/Map/mapa-1.png" />');
                    template.appendTo(this._tapizCt);
                }
                $(template).click(function () {
                    var layer = _context.getBasicLayerById(template.parent().attr('id'));
                    if (layer.getVisible()) {
                        _context.hideLayer(template.parent().attr('id'));
                    }
                    else {
                        _context.showLayer(template.parent().attr('id'));
                        _context.layeractivo = layer;
                    }
                });
                break;
            }
            default:
        }

    };
    this.deleteLayer = function (id, aux) {
        aux = aux == undefined ? true : aux;
        var layer = this.getGraphicLayerById(id);
        if (layer) {           
            this.deleteLayerRecursive(layer,aux);
        }
        else {
            layer = this.getBasicLayerById(id);
            if (layer) {
                this._myMap.removeLayer(layer);
                $("div[name$=" + id + "]").remove();
            }
            else {
                console.log('Este layer no existe');
            }
        }
    };
    this.deleteLayerRecursive = function (layer, aux) {
        if (!layer) {
            return;
        }
        else {
            if (aux) {
                $('#' + layer.attributes.id).remove();
            }
            var layer = this.getGraphicLayerById(layer.attributes.id);
            if (layer) {
                this._myMap.removeLayer(layer);
                if (this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id)) {
                    this._zTree.removeNode(this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id));
                }
                $.each(layer.attributes.children, function (i, o) {                   
                    _context.deleteLayerRecursive(o, aux);
                });
            }           
        }
    }
    this.changeBasicLayer = function () {
        var aux;
        if (this._arrBasicLayers.length == 0) {
            return;
        }
        for (var i = 0; i < this._arrBasicLayers.length; i++) {
            if (this._arrBasicLayers[i] == this.layeractivo) {
                this._arrBasicLayers[i].setVisible(false);
                aux = i;
            }
        }
        if (aux == this._arrBasicLayers.length - 1 || this.layeractivo == undefined) {
            this.layeractivo = this._arrBasicLayers[0];
            this._arrBasicLayers[0].setVisible(true);
        }
        else {
            this.layeractivo = this._arrBasicLayers[aux + 1];
            this._arrBasicLayers[aux + 1].setVisible(true);
        }
    };
    this.hideLayer = function (id) {
        var layer = this.getGraphicLayerById(id);
        if (layer) {
            this.hideLayerRecursive(layer);
        }
        else {
            layer = this.getBasicLayerById(id);
            if (layer) {
                layer.attributes.visible = false;
                layer.setVisible(false);
                $("#" + id + '.tapiz-ct').toggleClass('div-selected');
            }
            else {
                console.log('Este layer no existe');
            }
        }
    };
    this.hideLayerRecursive = function (layer) {//Falta ver cuando esta clusterizado
        if (!layer) {
            return;
        }
        else {
            var layer = this.getGraphicLayerById(layer.attributes.id);
            if (layer) {
                layer.setVisible(false);
                layer.attributes.visible = false;
                if (this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id)) {
                    this._zTree.checkNode(this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id), false, true);
                }
                $.each(layer.getSource().getFeatures(), function (i, o) {
                    if (o.values_.attributes) {
                        _context.hideGraphic(o.values_.attributes.id);
                    }
                });
                if ($("#" + layer.attributes.id + '.layer-graphic-ct')) {
                    $("#" + layer.attributes.id + '.layer-graphic-ct').addClass('layer-hidden');
                }
                $.each(layer.attributes.children, function (i, o) {
                    _context.hideLayerRecursive(o);
                });
            }
                              
        }

    }
    this.showLayer = function (id) {
        var layer = this.getGraphicLayerById(id);
        if (layer) {
            this.showLayerRecursive(layer);
        }
        else {
            layer = this.getBasicLayerById(id);
            if (layer) {
                layer.attributes.visible = true;
                layer.setVisible(true);
               
                $("#" + id + '.tapiz-ct').toggleClass('div-selected');
            }
            else {
                console.log('Este layer no existe');
            }
        }
    };
    this.showLayerRecursive = function (layer) {
        if (!layer) {
            return;
        }
        else {
            var layer = this.getGraphicLayerById(layer.attributes.id);
            if (layer) {
                layer.attributes.visible = true;
                layer.setVisible(true);
                if (this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id)) {
                    this._zTree.checkNode(this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id), true, true);
                }
                $.each(layer.getSource().getFeatures(), function (i, o) {
                    if (o.values_.attributes) {
                        _context.showGraphic(o.values_.attributes.id);
                    }
                });
                $("#" + layer.attributes.id + '.layer-graphic-ct').removeClass('layer-hidden');
                if (!layer.attributes.isClusterLayer) {
                    $.each(layer.attributes.children, function (i, o) {
                        _context.showLayerRecursive(o);
                    });
                }
            }
        }

    }
    this.hideAllLayersGraphic = function () {
        var layers = this.getGraphicLayers();
        for (var i = 0; i < layers.length; i++) {
            this.hideLayer(layers[i].attributes.id);
        }
    };
    this.showAllLayersGraphic = function () {
        var layers = this.getGraphicLayers();
        for (var i = 0; i < layers.length; i++) {
            this.showLayer(layers[i].attributes.id);
        }
    };
    this.getBasicLayers = function () {
        var allLayers = this._myMap.getLayers().getArray();
        var ret = [];
        for (var i = 0; i < allLayers.length; i++) {
            if (allLayers[i].attributes.isBasicLayer) {
                ret.push(allLayers[i]);
            }
        }
        return ret;
    };
    this.getBasicLayerById = function (id) {
        var layers = this.getBasicLayers();
        var existe = false;
        var dev;
        $.each(layers, function (i, j) {
            if (j.attributes.id == id) {
                dev = j;
                existe = true;
            }
        });
        if (!existe) {
            console.log('Este layer no existe');
        }
        else {
            return dev;
        }
    };
    this.getGraphicLayers = function () {
        var allLayers = this._myMap.getLayers().getArray();
        var ret = [];
        $.each(allLayers, function (i,o) {
            if (o.attributes.isGraphicLayer || o.attributes.isClusterLayer || o.attributes.isHeatLayer) {
                ret.push(o);
            }
        });
        return ret;
    };
    this.getGraphicLayerById = function (id) {
        var layers = this.getGraphicLayers();
        var existe = false;
        var dev;
        $.each(layers, function (i, j) {
            if (j.attributes.id == id) {
                dev = j;
                existe = true;
            }
        });
        if (existe) {
            return dev;
        }
    };
    this.convertToClusterLayer = function (id, distancia) {
        var layer = this.getGraphicLayerById(id);
        if (layer && (layer.attributes.isGraphicLayer || layer.attributes.isHeatLayer) && layer.attributes.convert) {
            if (layer.attributes.isVolumenLayer) {
                this.deleteVolumeProvinceLayer();
            }
            $("#" + id + '.layer-graphic-ct').removeClass('layer-convert-graphic');
            $("#" + id + '.layer-graphic-ct').removeClass('layer-convert-heat');
            $("#" + id + '.layer-graphic-ct').addClass('layer-convert-cluster');
            var distCluster = distancia || 40;
            if (layer.attributes.isClusterLayer || layer.attributes.isHeatLayer) {
                var features = layer.attributes.features;
            }
            else {               
                var features = layer.getSource().getFeatures();               
            }
            var allGraphic = this.getGraphicsByLayer(id);            
            var source = new ol.source.Vector({
                features: allGraphic
            });
            var clusterSource = new ol.source.Cluster({
                distance: distCluster,
                source: source
            });
            var styleCache = {};
            var clusters = new ol.layer.Vector({
                source: clusterSource,
                style: function (feature, resolution) {
                    var size = feature.get('features').length;
                    var style = styleCache[size];
                    if (!style) {
                        if (size == 1) {
                            style = [feature.get('features')[0].getStyle()];                            
                            styleCache[size] = style;
                        }
                        else if (size <= 100 && size > 1) {
                            style = [new ol.style.Style({
                                image: new ol.style.Icon({
                                    src: '/Content/images/Osiris/Map/BluePin1LargeB.png',
                                }),
                                text: new ol.style.Text({
                                    text: size.toString(),
                                    fill: new ol.style.Fill({
                                        color: '#fff'
                                    })                                    
                                })
                            })];
                            styleCache[size] = style;
                        }
                        else if (size > 100 && size <= 1000) {
                            style = [new ol.style.Style({
                                image: new ol.style.Icon({
                                    src: '/Content/images/Osiris/Map/GreenPin1LargeB.png',
                                    anchor: [0.5, 1],
                                }),
                                text: new ol.style.Text({
                                    text: size.toString(),
                                    fill: new ol.style.Fill({
                                        color: '#fff'
                                    })
                                })
                            })];
                            styleCache[size] = style;
                        }
                        else {
                            style = [new ol.style.Style({
                                image: new ol.style.Icon({
                                    src: '/Content/images/Osiris/Map/RedPin1LargeB.png',
                                    anchor: [0.5, 1],
                                }),
                                text: new ol.style.Text({
                                    text: size.toString(),
                                    fill: new ol.style.Fill({
                                        color: '#fff'
                                    })
                                })
                            })];
                            styleCache[size] = style;
                        }
                    }
                    return style;
                }
            });
            clusters.attributes = layer.attributes;
            clusters.attributes.isClusterLayer = true;
            clusters.attributes.isGraphicLayer = false;
            clusters.attributes.isHeatLayer = false;
            clusters.attributes.isVolumenLayer = false;
            clusters.attributes.allFeatures = allGraphic;
            clusters.attributes.features = features;
            this.deleteLayer(layer.attributes.id, false);
            this._myMap.addLayer(clusters);
            this._zTree.addNodes(this._zTree.getNodeByParam('id', clusters.attributes.parent), { id: 'layer' + clusters.attributes.id, name: 'Cluster ' + clusters.attributes.name, icon: clusters.attributes.icom, isLayer: true, checked: true });
            if (!clusters.attributes.visible) {
                this.hideLayer(clusters.attributes.id);
            }
                               
        }
    };
    this.convertToGraphicLayer = function (id) {
        var layer = this.getGraphicLayerById(id);
        if (layer.attributes.isVolumenLayer) {
            this.deleteVolumeProvinceLayer();
            layer.attributes.isVolumenLayer = false;
        }
        else 
        {
            if (layer && !layer.attributes.isGraphicLayer) 
            {
                if (layer.attributes.isClusterLayer || layer.attributes.isHeatLayer) {
                    var features = layer.attributes.features
                }
                else {
                    var features = layer.getSource().getFeatures();
                }
                $("#" + id + '.layer-graphic-ct').addClass('layer-convert-graphic');
                $("#" + id + '.layer-graphic-ct').removeClass('layer-convert-heat');
                $("#" + id + '.layer-graphic-ct').removeClass('layer-convert-cluster');
               
                var vectorSource = new ol.source.Vector({
                    features: []
                });
                var newLayer = new ol.layer.Vector({
                    source: vectorSource
                });
                newLayer.getSource().addFeatures(features);
                newLayer.attributes = layer.attributes;
                newLayer.attributes.isGraphicLayer = true;
                newLayer.attributes.isClusterLayer = false;
                newLayer.attributes.isHeatLayer = false;
                newLayer.attributes.isVolumenLayer = false;
                newLayer.attributes.convert = true;
                this.deleteLayer(id, false);               
                this._convertToGraphicLayerRecursive(newLayer, false);
                if (!newLayer.attributes.visible) {
                    this.hideLayer(newLayer.attributes.id);
                }
            }
        }        
    };
    this._convertToGraphicLayerRecursive = function (layer,aux) {
        if (layer == null) {
            return;
        }
        else {
            this._myMap.addLayer(layer);
            if (this._zTree.getNodeByParam('id', layer.attributes.parent)) {
                this._zTree.addNodes(this._zTree.getNodeByParam('id', layer.attributes.parent), { id: 'layer' + layer.attributes.id, name: layer.attributes.name, icon: layer.attributes.icom, isLayer: true, checked: true });
            }
            if (layer.attributes.isClusterLayer || layer.attributes.isHeatLayer) {
                var features = layer.attributes.features;
            }
            else {
                var features = layer.getSource().getFeatures();
            }           
            $.each(features, function (i, o) {
                var aux = o;
                _context.deleteGraphic(o.id_);
                var layerAux = _context.getGraphicLayerById(aux.values_.attributes.idLayer);
                if (layerAux) {
                    layerAux.getSource().addFeature(aux);
                    if (_context._zTree.getNodeByParam('id', 'layer' + layerAux.attributes.id)) {
                        _context._zTree.addNodes(_context._zTree.getNodeByParam('id', 'layer' + layerAux.attributes.id), { id: aux.id_, name: aux.values_.attributes.name, isPoint: true, icon: aux.values_.attributes.icom, checked: true });
                    }
                }
            });
            $.each(layer.attributes.children, function (i, o) {
                _context._convertToGraphicLayerRecursive(o,true);
            });
        }
    };
    this.convertToHeatLayer = function (id, radio) {
        var layer = this.getGraphicLayerById(id);
        if (layer && (layer.attributes.isClusterLayer || layer.attributes.isGraphicLayer) && layer.attributes.convert) {
            if (layer.attributes.isVolumenLayer) {            
                this.deleteVolumeProvinceLayer();
            }
            if (this._scaleColor) {
                this._scaleColor.remove();
            }
            $("#" + id + '.layer-graphic-ct').removeClass('layer-convert-graphic');
            $("#" + id + '.layer-graphic-ct').addClass('layer-convert-heat');
            $("#" + id + '.layer-graphic-ct').removeClass('layer-convert-cluster');
            var dis = radio || 15;
            if (layer.attributes.isClusterLayer || layer.attributes.isHeatLayer) {
                var features = layer.attributes.features;
            }
            else {
                var features = layer.getSource().getFeatures();
            }
            var allGraphic = this.getGraphicsByLayer(id);   
            var newfeatures = [];
          
            for (var i = 0; i < allGraphic.length; i++) {
                var iconFeature = new ol.Feature({
                    geometry: allGraphic[i].values_.geometry
                    //attributes: features[i].values_.attributes,
                    //content: features[i].values_.content
                });
                newfeatures.push(iconFeature);
            }
            var source = new ol.source.Vector({
                features: newfeatures,
                projection: 'EPSG:4326',
            });
            var heatLayer = new ol.layer.Heatmap({
                source: source,
                radius: dis
            });
            heatLayer.attributes = layer.attributes;
            heatLayer.attributes.isHeatLayer = true;
            heatLayer.attributes.isGraphicLayer = false;
            heatLayer.attributes.isClusterLayer = false;
            heatLayer.attributes.isVolumenLayer = false;
            heatLayer.attributes.allFeatures = allGraphic;
            heatLayer.attributes.features = features;
            this.deleteLayer(layer.attributes.id, false);
            this._myMap.addLayer(heatLayer);
            this._zTree.addNodes(this._zTree.getNodeByParam('id', heatLayer.attributes.parent), { id: 'layer' + heatLayer.attributes.id, name: 'Heat ' + heatLayer.attributes.name, icon: heatLayer.attributes.icom, isLayer: true, checked: true });
            if (!heatLayer.attributes.visible) {
                this.hideLayer(heatLayer.attributes.id);
            }
        } 
    };
    this.addVolumeProvinceLayer = function (idlayer) {
        if (idlayer) {
            var layer = this.getGraphicLayerById(idlayer);
            if (layer && layer.attributes.convert) {
                if (this._volumenProvinceLayerVisible) {
                    this.deleteVolumeProvinceLayer();
                }
                layer.attributes.isVolumenLayer = true;
                this._ZoomCenterAux = {};
                this._ZoomCenterAux.zoom = this._myMap.getView().getZoom();
                this._ZoomCenterAux.center = this._myMap.getView().getCenter();
                this.centerAt(-80, 22, null, 7);
                _context._layerVolumenProvinceCt.toggleClass('div-selected');
                this._layerBaseVisibleAux = [];
                $.each(this._arrBasicLayers, function (i, o) {
                    if (o.getVisible()) {
                        _context._layerBaseVisibleAux.push(o.attributes.id);
                    }
                });
                this._layerGraphicVisibleAux = [];
                for (var i = 0; i < length; i++) {
                    $.each(this.getGraphicLayers(), function (i, o) {
                        if (o.getVisible()) {
                            _context._layerGraphicVisibleAux.push(o.attributes.id);
                        }
                    });
                }
                this.hideAllLayersGraphic();
                for (var i = 0; i < this._arrBasicLayers.length; i++) {
                    if (this._arrBasicLayers[0].getVisible()) {
                        this.hideLayer(this._arrBasicLayers[i].attributes.id);
                    }
                }
                var arrIsla = [[-83.0915451887119, 21.78129421029], [-83.0868854592274, 21.7921669124206], [-83.0853322160659, 21.8038162361319], [-83.0736828923546, 21.8240083972315], [-83.0573738391587, 21.8488602878157], [-83.0433946507051, 21.8581797467847], [-83.0294154622515, 21.8706056920768], [-83.0045635716674, 21.8939043394994], [-82.9936908695368, 21.898564068984], [-82.9502000610146, 21.9234159595681], [-82.9463169531108, 21.9311821753757], [-82.9587428984029, 21.9319587969564], [-82.9688389789527, 21.9373951480217], [-82.9960207342791, 21.9272990674719], [-83.0014570853444, 21.9327354185372], [-82.9750519515987, 21.9451613638293], [-82.9688389789527, 21.9436081206678], [-82.9618493847259, 21.9389483911832], [-82.9439870883685, 21.9389483911832], [-82.9354442509802, 21.9319587969564], [-82.9269014135919, 21.9327354185372], [-82.9199118193651, 21.9288523106334], [-82.8989430366848, 21.9304055537949], [-82.8818573619081, 21.9272990674719], [-82.8748677676814, 21.9304055537949], [-82.857005471324, 21.9296289322142], [-82.850792498678, 21.9350652832794], [-82.8181743922863, 21.9226393379874], [-82.8080783117365, 21.9210860948259], [-82.7863329074753, 21.9055536632108], [-82.7785666916678, 21.9164263653413], [-82.7731303406025, 21.9032237984685], [-82.7575979089874, 21.898564068984], [-82.742842098953, 21.9071069063723], [-82.7242031810149, 21.8892446100149], [-82.7032343983346, 21.8900212315957], [-82.6884785883002, 21.8838082589496], [-82.6706162919428, 21.8612862331077], [-82.6900318314617, 21.825561640393], [-82.6744993998466, 21.8185720461662], [-82.6651799408776, 21.8022629929704], [-82.6504241308432, 21.7999331282281], [-82.6061567007402, 21.775081237644], [-82.571985351187, 21.7346969154447], [-82.5999437280942, 21.6624711084345], [-82.5587827843142, 21.6415023257542], [-82.5253880563417, 21.5762661129708], [-82.5385906232145, 21.5576271950326], [-82.6014969712557, 21.5242324670602], [-82.6310085913244, 21.5125831433489], [-82.6667331840391, 21.5032636843798], [-82.7125538573036, 21.4830715232802], [-82.7676939895372, 21.4636559837613], [-82.8399197965474, 21.4426872010809], [-82.8911768208772, 21.4364742284349], [-82.9269014135919, 21.4465703089847], [-82.9944674911176, 21.4589962542768], [-83.0418414075436, 21.461326119019], [-83.0861088376466, 21.4714221995689], [-83.1140672145538, 21.5133597649296], [-83.1443554562033, 21.5273389533832], [-83.176973562595, 21.578595977713], [-83.1676541036259, 21.5925751661666], [-83.1987189668561, 21.6275231373006], [-83.1901761294678, 21.6337361099466], [-83.1661008604644, 21.6158738135892], [-83.1257165382651, 21.5894686798436], [-83.1109607282308, 21.57548949139], [-83.0496076233512, 21.5646167892594], [-83.0037869500866, 21.5747128698092], [-82.9766051947602, 21.5941284093281], [-82.9905843832138, 21.6368425962696], [-83.0232024896055, 21.6795567832111], [-83.0325219485746, 21.6904294853417], [-83.0907685671312, 21.7774111023862], [-83.0915451887119, 21.78129421029]];
                var arrStgo = [[-77.0384092429306, 19.8956848380554], [-77.0570475637024, 19.9515998003709], [-76.9700687334339, 19.9702381211427], [-76.920366544709, 20.0323658570488], [-76.8147493936687, 20.0572169514112], [-76.6221534123599, 20.0261530834582], [-76.5476001292726, 20.0634297250018], [-76.429557431051, 20.1131319137267], [-76.4357702046416, 20.2311746119482], [-76.4047063366886, 20.2560257063107], [-76.2680253176952, 20.4672600083913], [-76.1996848081985, 20.4361961404383], [-76.1189187515206, 20.4858983291631], [-76.0567910156145, 20.5790899330223], [-75.9884505061178, 20.5418132914786], [-75.9138972230305, 20.504536649935], [-75.8579822607151, 20.4113450460759], [-75.7585778832653, 20.4734727819819], [-75.6653862794062, 20.4548344612101], [-75.6156840906814, 20.5293877442974], [-75.4852158452786, 20.5542388386598], [-75.3858114678289, 20.5542388386598], [-75.3858114678289, 20.4921111027538], [-75.4106625621913, 20.4734727819819], [-75.3733859206477, 20.4237705932571], [-75.3671731470571, 20.3989194988946], [-75.4603647509162, 20.3181534422167], [-75.447939203735, 20.2808768006731], [-75.447939203735, 20.1690468760421], [-75.4168753357819, 20.1131319137267], [-75.4230881093725, 20.075855272183], [-75.4727902980974, 20.0385786306394], [-75.4603647509162, 19.9888764419145], [-75.3423220526946, 19.8894720644648], [-75.3609603734664, 19.870833743693], [-75.6156840906814, 19.8770465172836], [-75.7150884681311, 19.9391742531897], [-75.8890461286681, 19.9578125739615], [-75.9635994117554, 19.9391742531897], [-76.1064932043394, 19.9453870267803], [-76.2245359025609, 19.9702381211427], [-76.3425786007825, 19.9391742531897], [-76.5600256764538, 19.9267487060084], [-76.6656428274941, 19.9391742531897], [-76.7836855257157, 19.9205359324178], [-76.8582388088029, 19.9143231588272], [-76.9141537711184, 19.8770465172836], [-77.0135581485681, 19.8770465172836], [-77.0384092429306, 19.8956848380554]];
                var arrGranma = [[-77.063260337293, 19.9391742531897], [-77.0384092429306, 19.8894720644648], [-77.1067497524273, 19.8894720644648], [-77.3117712809173, 19.8832592908742], [-77.4049628847764, 19.8273443285587], [-77.4608778470919, 19.8521954229211], [-77.5105800358168, 19.8335571021493], [-77.5913460924947, 19.8397698757399], [-77.665899375582, 19.8149187813775], [-77.7404526586693, 19.8459826493305], [-77.7590909794411, 19.8832592908742], [-77.5913460924947, 20.0820680457736], [-77.5167928094074, 20.1504085552703], [-77.411175658367, 20.2125362911764], [-77.2558563186018, 20.2995151214449], [-77.1937285826958, 20.3119406686261], [-77.1253880731991, 20.4051322724852], [-77.1005369788367, 20.4548344612101], [-77.1564519411521, 20.504536649935], [-77.2558563186018, 20.5293877442974], [-77.2620690921925, 20.5790899330223], [-77.2247924506488, 20.6163665745659], [-77.2807074129643, 20.678494310472], [-77.2434307714206, 20.7033454048344], [-77.2434307714206, 20.7841114615123], [-77.1005369788367, 20.8089625558748], [-77.03219646934, 20.7592603671499], [-76.8023238464875, 20.7654731407405], [-76.7712599785344, 20.7157709520156], [-76.715345016219, 20.7592603671499], [-76.5662384500444, 20.7033454048344], [-76.5413873556819, 20.678494310472], [-76.5476001292726, 20.647430442519], [-76.3922807895074, 20.6039410273847], [-76.3363658271919, 20.5728771594317], [-76.2493869969234, 20.5418132914786], [-76.1872592610173, 20.4921111027538], [-76.1624081666549, 20.4361961404383], [-76.2121103553797, 20.392706725304], [-76.255599770514, 20.392706725304], [-76.2680253176952, 20.3492173101698], [-76.2928764120576, 20.3492173101698], [-76.3363658271919, 20.3492173101698], [-76.3674296951449, 20.2373873855388], [-76.398493563098, 20.218749064767], [-76.3798552423261, 20.1566213288609], [-76.3798552423261, 20.0882808193642], [-76.4109191102792, 20.0696424985924], [-76.5165362613195, 20.0261530834582], [-76.5973023179974, 20.0013019890957], [-76.6967066954471, 20.0013019890957], [-76.7961110728969, 20.0137275362769], [-76.8768771295748, 19.9950892155051], [-76.9327920918902, 19.9764508947333], [-76.9452176390715, 19.9515998003709], [-77.0135581485681, 19.932961479599], [-77.063260337293, 19.9391742531897]];
                var arrPinarRio = [[-84.810589004781, 21.9521128965466], [-84.6739079857877, 21.976963990909], [-84.4999503252506, 22.0701555947682], [-84.3881204006197, 22.0577300475869], [-84.3694820798479, 22.0950066891306], [-84.4564609101164, 22.2006238401709], [-84.4129714949821, 22.3373048591643], [-84.3073543439418, 22.4864114253389], [-84.2576521552169, 22.5609647084262], [-84.0153539851832, 22.6976457274196], [-83.7916941359213, 22.8032628784599], [-83.5183320979346, 22.8902417087284], [-83.226331739176, 23.0144971805406], [-82.9778207955517, 23.0269227277218], [-82.9219058332362, 22.9834333125875], [-82.9219058332362, 22.8716033879566], [-82.909480286055, 22.8529650671848], [-82.909480286055, 22.8281139728223], [-82.9529697011893, 22.7846245576881], [-82.8970547388738, 22.7100712746008], [-82.8225014557865, 22.5920285763792], [-82.909480286055, 22.5361136140637], [-83.0461613050484, 22.4864114253389], [-83.1455656824981, 22.3248793119831], [-83.2511828335385, 22.3186665383925], [-83.3133105694445, 22.2441132553052], [-83.3567999845788, 22.2130493873521], [-83.4313532676661, 22.1695599722179], [-83.4996937771628, 22.1695599722179], [-83.5556087394782, 22.2006238401709], [-83.6363747961561, 22.1571344250367], [-83.7047153056528, 22.1633471986273], [-83.7544174943777, 22.1571344250367], [-83.8413963246462, 22.1571344250367], [-83.8973112869617, 22.1571344250367], [-83.9470134756865, 22.119857783493], [-83.9532262492771, 22.0639428211775], [-83.9470134756865, 22.0266661796339], [-83.971864570049, 21.9645384437278], [-83.9842901172302, 21.9272618021842], [-84.0215667587738, 21.8899851606405], [-84.1147583626329, 21.914836255003], [-84.2576521552169, 21.8899851606405], [-84.4253970421633, 21.7657296888284], [-84.5123758724318, 21.7470913680565], [-84.5372269667943, 21.7657296888284], [-84.4688864572976, 21.8651340662781], [-84.4813120044788, 21.8961979342311], [-84.5682908347473, 21.9210490285936], [-84.6490568914252, 21.8899851606405], [-84.7173974009219, 21.8589212926875], [-84.7608868160562, 21.8278574247345], [-84.779525136828, 21.8092191039626], [-84.9286317030026, 21.8154318775532], [-84.9659083445462, 21.8651340662781], [-84.810589004781, 21.9521128965466]];
                var arrCiegoAvila = [[-78.9270924144754, 22.3994325950704], [-78.7841986218914, 22.405645368661], [-78.6972197916229, 22.3807942742986], [-78.5978154141732, 22.3310920855737], [-78.4114322064549, 22.2689643496676], [-78.3058150554146, 22.1944110665803], [-78.1815595836024, 22.1571344250367], [-78.0821552061527, 22.0950066891306], [-78.0759424325621, 22.0390917268151], [-78.1691340364212, 21.9707512173184], [-78.2499000930991, 21.9272618021842], [-78.1504957156494, 21.8154318775532], [-78.15670848924, 21.771942462419], [-78.2312617723273, 21.7595169152378], [-78.2747511874615, 21.7843680096002], [-78.2809639610522, 21.8092191039626], [-78.330666149777, 21.7843680096002], [-78.3244533761864, 21.7284530472847], [-78.4238577536361, 21.6414742170162], [-78.473559942361, 21.597984801882], [-78.6350920557168, 21.5172187452041], [-78.7779858483008, 21.5358570659759], [-78.7469219803477, 21.6041975754726], [-78.8773902257505, 21.5855592547007], [-79.0078584711533, 21.5855592547007], [-78.9892201503814, 21.6476869906068], [-79.0078584711533, 21.6663253113786], [-79.0824117542406, 21.6663253113786], [-79.1196883957842, 21.6663253113786], [-79.1321139429654, 21.7160275001035], [-79.1259011693748, 21.7905807831908], [-79.0513478862875, 21.945900122956], [-79.0140712447439, 21.9583256701372], [-79.0016456975627, 22.0266661796339], [-79.0699862070593, 22.1136450099024], [-78.9705818296096, 22.3435176327549], [-78.9270924144754, 22.3994325950704]];
                var arrCienfuegos = [[-80.923129537758, 22.3896574038953], [-80.8982784433956, 22.4673170737779], [-80.847023061273, 22.4999341351285], [-80.7615974244022, 22.4812958143567], [-80.6544270799642, 22.4750830407661], [-80.5814269902746, 22.484402201152], [-80.5519163157192, 22.5387639700698], [-80.4400863910882, 22.5946789323853], [-80.3857246221704, 22.560508677637], [-80.3577671410127, 22.5434235502628], [-80.3235968862643, 22.5667214512276], [-80.2878734381183, 22.5931257389877], [-80.2350648625982, 22.560508677637], [-80.2102137682357, 22.448678753006], [-80.213320155031, 22.3974233708835], [-80.2195329286216, 22.3648063095328], [-80.1558519993179, 22.3492743755563], [-80.1356604851484, 22.3228700877962], [-80.1434264521367, 22.3088913472174], [-80.1014902304001, 22.2576359650948], [-80.0642135888564, 22.2483168047089], [-80.0704263624471, 22.2250189037441], [-80.0937242634118, 22.1892954555982], [-80.07508594264, 22.1691039414287], [-80.0906178766165, 22.1302741064874], [-80.0735327492424, 22.0914442715461], [-80.079745522833, 22.065039983786], [-80.0486816548799, 22.0479548564118], [-80.0347029143011, 21.9734015733245], [-80.0176177869269, 21.9532100591551], [-80.0253837539152, 21.9299121581903], [-80.0455752680846, 21.9143802242138], [-80.0844051030259, 21.8771035826701], [-80.0890646832189, 21.8398269411265], [-80.1045966171954, 21.8180822335593], [-80.1278945181602, 21.814975846764], [-80.1651711597038, 21.8227418137523], [-80.2148733484287, 21.8522524883077], [-80.2940862117089, 21.8957419034419], [-80.3267032730596, 21.9345717383832], [-80.356213947615, 21.9640824129386], [-80.4043629429422, 22.0029122478799], [-80.4183416835211, 22.0168909884588], [-80.4230012637141, 22.0277633422423], [-80.4447459712812, 22.02931653564], [-80.4587247118601, 22.0572740167977], [-80.4618310986554, 22.0370825026283], [-80.4866821930178, 22.0370825026283], [-80.5457035421286, 22.0541676300024], [-80.5767674100816, 22.0510612432071], [-80.5891929572628, 22.0479548564118], [-80.601618504444, 22.0665931771836], [-80.6124908582276, 22.100763431932], [-80.6342355657947, 22.1194017527038], [-80.6544270799642, 22.1209549461015], [-80.6885973347125, 22.1209549461015], [-80.7227675894609, 22.1209549461015], [-80.8221719669106, 22.1458060404639], [-80.8625549952496, 22.1877422622005], [-80.9029380235885, 22.2234657103465], [-80.9169167641674, 22.2529763849019], [-80.9200231509627, 22.3399552151704], [-80.9262359245533, 22.3477211821587], [-80.9386614717345, 22.3477211821587], [-80.923129537758, 22.3896574038953]];
                var arrCamaguey = [[-78.4923818704327, 21.6379117994317], [-78.4457860685031, 21.6845076013613], [-78.3774455590064, 21.7466353372673], [-78.3463816910534, 21.8056566863781], [-78.2966795023285, 21.8367205543312], [-78.2562964739896, 21.7808055920157], [-78.2780411815567, 21.9423377053715], [-78.2283389928318, 21.9796143469151], [-78.1165090682009, 22.02931653564], [-78.0947643606338, 22.0945506583414], [-77.9487641812545, 21.9702951865292], [-77.8679981245766, 21.9516568657574], [-77.8120831622611, 21.8926355166466], [-77.7623809735362, 21.8926355166466], [-77.7344234923785, 21.8211886203546], [-77.5791041526133, 21.7901247524016], [-77.433103973234, 21.6876139881566], [-77.3399123693749, 21.6751884409754], [-77.1970185767909, 21.6782948277707], [-77.1255716804989, 21.6596565069988], [-77.0634439445928, 21.6037415446834], [-77.0075289822774, 21.5447201955726], [-77.0292736898445, 21.3987200161933], [-77.0727631049788, 21.3925072426027], [-77.1069333597271, 21.3490178274684], [-77.116252520113, 21.3148475727201], [-77.0634439445928, 21.3148475727201], [-77.1193589069083, 21.2278687424516], [-77.1535291616567, 21.1005068838441], [-77.2001249635862, 21.0725494026864], [-77.2436143787205, 21.0632302423005], [-77.3026357278313, 20.9824641856226], [-77.3368059825796, 20.9824641856226], [-77.4051464920763, 21.0011025063944], [-77.4486359072105, 21.0104216667803], [-77.5791041526133, 20.9234428365118], [-77.6412318885194, 20.9079109025353], [-77.6381255017241, 20.8675278741963], [-77.790338454694, 20.8147192986762], [-77.8058703886705, 20.7681234967466], [-77.821402322647, 20.7246340816123], [-77.8804236717578, 20.7028893740452], [-77.9518705680498, 20.6811446664781], [-78.0481685587042, 20.6935702136593], [-78.1102962946103, 20.7339532419983], [-78.1724240305164, 20.7712298835419], [-78.2128070588553, 20.8209320722668], [-78.2531900871943, 20.8240384590621], [-78.2842539551473, 20.8892725817635], [-78.3929774929829, 20.9420811572836], [-78.4861690968421, 21.0321663743474], [-78.5514032195434, 21.2806773179718], [-78.597999021473, 21.4235711105557], [-78.6414884366073, 21.5074435540289], [-78.4923818704327, 21.6379117994317]];
                var arrGtmo = [[-75.3775429418648, 20.4330256433987], [-75.32784075314, 20.4532171575681], [-75.2703725974268, 20.4237064830127], [-75.2377555360761, 20.4423448037846], [-75.2066916681231, 20.4873874123165], [-75.1212660312522, 20.4951533793047], [-75.0544787151532, 20.4687490915446], [-75.0109893000189, 20.4532171575681], [-74.9939041726448, 20.4749618651353], [-74.9286700499434, 20.4765150585329], [-74.8339252526866, 20.4376852235916], [-74.7873294507571, 20.5153448934742], [-74.7096697808745, 20.5712598557897], [-74.6941378468979, 20.5495151482226], [-74.5636696014952, 20.462536317954], [-74.5294993467468, 20.4206000962174], [-74.4580524504548, 20.3584723603114], [-74.3104990776779, 20.3103233649841], [-74.2887543701108, 20.3227489121654], [-74.2142010870235, 20.328961685756], [-74.1443073841291, 20.2699403366452], [-74.122562676562, 20.2186849545227], [-74.198669153047, 20.1363657044471], [-74.225073440807, 20.119280577073], [-74.229733021, 20.0851103223246], [-74.3073926908826, 20.0587060345645], [-74.3291373984497, 20.0695783883481], [-74.3695204267887, 20.0757911619387], [-74.475137577829, 20.0571528411669], [-74.5636696014952, 20.0416209071904], [-74.6102654034247, 20.043174100588], [-74.6397760779801, 20.0354081335997], [-74.7081165874768, 20.0416209071904], [-74.8013081913359, 20.0229825864185], [-74.8479039932655, 20.0214293930209], [-74.8743082810256, 19.9934719118631], [-74.903818955581, 19.976386784489], [-74.9442019839199, 19.9639612373078], [-74.9768190452706, 19.9142590485829], [-75.0839893897086, 19.8909611476181], [-75.0964149368898, 19.8956207278111], [-75.1010745170828, 19.9593016571148], [-75.1896065407489, 19.9686208175007], [-75.2284363756902, 19.9297909825594], [-75.2299895690879, 19.8987271146064], [-75.3045428521752, 19.8738760202439], [-75.3666705880812, 19.8754292136416], [-75.3915216824437, 19.8894079542205], [-75.4691813523263, 19.9670676241031], [-75.5049048004723, 20.0167698128279], [-75.501798413677, 20.0726847751434], [-75.4707345457239, 20.0882167091199], [-75.4443302579638, 20.1084082232894], [-75.4847132863028, 20.1845146997743], [-75.4878196730981, 20.2450892422828], [-75.4738409325192, 20.3010042045982], [-75.4831600929052, 20.3336212659489], [-75.4334579041803, 20.3740042942879], [-75.425691937192, 20.4050681622409], [-75.4070536164202, 20.4097277424339], [-75.3775429418648, 20.4330256433987]];
                var arrVC = [[-80.0235556139941, 21.9437204477121], [-79.9148320761585, 21.9996354100276], [-79.8185340855041, 21.9685715420746], [-79.7439808024168, 22.0772950799102], [-79.7626191231886, 22.1642739101787], [-79.7067041608731, 22.1704866837693], [-79.6476828117624, 22.1642739101787], [-79.5513848211079, 22.1332100422257], [-79.4861506984065, 22.1549547497928], [-79.4550868304535, 22.2326144196754], [-79.4022782549333, 22.238827193266], [-79.3308313586413, 22.2201888724942], [-79.296661103893, 22.3009549291721], [-79.3867463209568, 22.3444443443063], [-79.3774271605709, 22.4500614953467], [-79.6414700381717, 22.7669129484677], [-79.7657255099839, 22.7979768164207], [-79.9427895573162, 22.8787428730986], [-80.0359811611753, 22.9564025429812], [-80.1074280574673, 22.9688280901624], [-80.1850877273499, 23.0029983449108], [-80.2689601708231, 23.0402749864544], [-80.3528326142963, 22.9936791845249], [-80.4180667369977, 22.984360024139], [-80.5951307843301, 23.0806580147934], [-80.6137691051019, 23.086870788384], [-80.6324074258737, 23.0558069204309], [-80.635513812669, 23.0278494392732], [-80.7504501240953, 22.9905727977296], [-80.7566628976859, 22.9532961561859], [-80.7690884448671, 22.8818492598939], [-80.7442373505046, 22.8445726183503], [-80.6634712938267, 22.7824448824442], [-80.5982371711254, 22.801083203216], [-80.5764924635582, 22.7575937880818], [-80.5982371711254, 22.7172107597428], [-80.5671733031723, 22.6768277314039], [-80.5733860767629, 22.6115936087025], [-80.5392158220146, 22.5681041935682], [-80.5205775012428, 22.5308275520246], [-80.4367050577696, 22.5681041935682], [-80.4025348030212, 22.5184020048434], [-80.3714709350682, 22.4997636840715], [-80.3093431991621, 22.5277211652293], [-80.2907048783903, 22.5681041935682], [-80.2596410104372, 22.4749125897091], [-80.2503218500513, 22.4065720802124], [-80.2689601708231, 22.3848273726453], [-80.2316835292795, 22.3382315707157], [-80.1633430197828, 22.3040613159674], [-80.1074280574673, 22.2201888724942], [-80.1229599914439, 22.1549547497928], [-80.1105344442626, 22.1176781082492], [-80.0981088970814, 22.0679759195243], [-80.073257802719, 22.0306992779806], [-80.0608322555378, 21.9809970892558], [-80.0484067083566, 21.9561459948934], [-80.0235556139941, 21.9437204477121]];
                var arrHolguin = [[-76.7463175449485, 20.8129956542215], [-76.7121472902001, 20.8564850693558], [-76.7028281298142, 20.9341447392384], [-76.690402582633, 20.9838469279632], [-76.6375940071128, 20.9838469279632], [-76.4947002145288, 21.0801449186176], [-76.4232533182369, 21.1174215601613], [-76.3549128087402, 21.145379041319], [-76.342487261559, 21.2044003904298], [-76.3083170068106, 21.2696345131312], [-76.1871679217938, 21.2012940036345], [-76.1157210255018, 21.1640173620908], [-76.087763544344, 21.1329534941378], [-75.9604016857366, 21.1236343337519], [-75.8175078931526, 21.145379041319], [-75.7740184780183, 21.1422726545237], [-75.6590821665921, 21.1081023997754], [-75.6093799778672, 21.0894640790036], [-75.565890562733, 21.0055916355303], [-75.5814224967095, 20.9434638996243], [-75.6093799778672, 20.8937617108994], [-75.4571670248973, 20.7726126258825], [-75.3142732323134, 20.7415487579295], [-75.2366135624307, 20.7353359843389], [-75.1682730529341, 20.7198040503624], [-75.0875069962562, 20.7104848899765], [-75.003634552783, 20.7166976635671], [-74.7458044487727, 20.6452507672751], [-74.717846967615, 20.5738038709831], [-74.7520172223633, 20.511676135077], [-74.7675491563399, 20.4712931067381], [-74.7768683167258, 20.4371228519897], [-74.8110385714741, 20.4184845312179], [-74.8483152130178, 20.4029525972414], [-74.8949110149473, 20.4122717576273], [-74.9384004300816, 20.4371228519897], [-74.9787834584205, 20.4557611727615], [-74.9725706848299, 20.3998462104461], [-75.0129537131689, 20.4122717576273], [-75.1216772510045, 20.4712931067381], [-75.1744858265247, 20.4557611727615], [-75.1993369208871, 20.4557611727615], [-75.2241880152495, 20.4246973048085], [-75.2304007888401, 20.3936334368555], [-75.2614646567932, 20.3874206632649], [-75.3453371002664, 20.4309100783991], [-75.4385287041255, 20.5303144558488], [-75.4789117324645, 20.5303144558488], [-75.5006564400316, 20.5054633614864], [-75.5596777891424, 20.4899314275099], [-75.6000608174813, 20.4837186539193], [-75.6062735910719, 20.4433356255803], [-75.6404438458203, 20.4340164651944], [-75.7367418364747, 20.4278036916038], [-75.7833376384042, 20.4278036916038], [-75.8175078931526, 20.3998462104461], [-76.0380613556192, 20.5178889086676], [-76.0473805160051, 20.4899314275099], [-76.0660188367769, 20.4526547859662], [-76.1001890915253, 20.4153781444226], [-76.1188274122971, 20.3874206632649], [-76.2772531388576, 20.4992505878958], [-76.3766575163073, 20.5427400030301], [-76.5692534976161, 20.6203996729127], [-76.5941045919786, 20.654569927661], [-76.6065301391598, 20.6701018616375], [-76.6562323278847, 20.6701018616375], [-76.6841898090424, 20.6918465692046], [-76.7121472902001, 20.7042721163859], [-76.7463175449485, 20.8129956542215]];
                var arrSS = [[-79.9770702975044, 21.9882857287947], [-79.9227085285866, 22.031775143929], [-79.7844743161956, 22.2088391912613], [-79.7394317076636, 22.2243711252378], [-79.6540060707928, 22.201073224273], [-79.6369209434186, 22.2041796110683], [-79.6074102688632, 22.1808817101036], [-79.5623676603313, 22.174668936513], [-79.5266442121853, 22.1808817101036], [-79.4148142875544, 22.2663073469744], [-79.3744312592154, 22.2569881865885], [-79.3526865516483, 22.2880520545415], [-79.4023887403732, 22.3191159224946], [-79.421027061145, 22.4278394603302], [-79.380644032806, 22.455796941488], [-79.3588993252389, 22.4309458471255], [-79.2843460421516, 22.4029883659678], [-79.1585373769418, 22.3921160121842], [-79.1367926693747, 22.4107543329561], [-79.0901968674451, 22.3952223989795], [-79.0203031645508, 22.4060947527631], [-78.9410903012705, 22.3952223989795], [-78.9084732399198, 22.3967755923772], [-78.9177924003057, 22.3703713046171], [-78.9768137494165, 22.2492222196002], [-79.0482606457085, 22.1047752336186], [-78.9643882022353, 22.0519666580984], [-78.9488562682588, 22.0240091769407], [-78.9768137494165, 21.9479027004558], [-78.992345683393, 21.9183920259004], [-79.0420478721179, 21.9308175730816], [-79.0824309004569, 21.8391791626201], [-79.0793245136616, 21.8081152946671], [-79.1103883816146, 21.745987558761], [-79.0855372872522, 21.7273492379892], [-79.0886436740475, 21.6931789832408], [-79.0436010655156, 21.6931789832408], [-79.0265159381414, 21.7242428511939], [-78.9892392965977, 21.7071577238197], [-78.9550690418494, 21.6947321766385], [-78.9535158484517, 21.6667746954808], [-78.9783669428142, 21.6046469595747], [-79.0063244239719, 21.5875618322005], [-79.0358350985273, 21.5813490586099], [-79.0560266126968, 21.5844554454052], [-79.1026224146263, 21.5658171246334], [-79.13989905617, 21.5456256104639], [-79.1911544382925, 21.5409660302709], [-79.2222183062455, 21.5394128368733], [-79.2672609147774, 21.5456256104639], [-79.3744312592154, 21.5968809925864], [-79.4117079007591, 21.5860086388029], [-79.4350058017239, 21.5875618322005], [-79.5204314385947, 21.6310512473348], [-79.5390697593665, 21.6108597331653], [-79.5701336273196, 21.6326044407324], [-79.6011974952726, 21.6341576341301], [-79.6322613632257, 21.6729874690714], [-79.6741975849623, 21.6807534360596], [-79.70215506612, 21.6667746954808], [-79.7316657406754, 21.679200242662], [-79.7642828020261, 21.6962853700361], [-79.7984530567744, 21.6993917568314], [-79.8124317973533, 21.6916257898432], [-79.8155381841486, 21.6698810822761], [-79.8217509577392, 21.6605619218902], [-79.8497084388969, 21.6729874690714], [-79.8636871794758, 21.6854130162526], [-79.8900914672359, 21.6838598228549], [-79.9040702078148, 21.7133704974103], [-79.9661979437208, 21.7242428511939], [-79.9724107173114, 21.7164768842056], [-80.0019213918668, 21.7242428511939], [-80.0298788730246, 21.7382215917727], [-80.0360916466152, 21.7692854597258], [-80.0516235805917, 21.7987961342812], [-80.1168577032931, 21.8205408418483], [-80.1090917363048, 21.8453919362107], [-80.1044321561119, 21.8702430305732], [-80.0873470287377, 21.9028600919239], [-80.0656023211706, 21.9214984126957], [-80.0454108070011, 21.9370303466722], [-80.0360916466152, 21.9510090872511], [-79.9770702975044, 21.9882857287947]];
                var arrLasTunas = [[-77.7786546068132, 20.8789747280787], [-77.7227396444977, 20.882081114874], [-77.6761438425682, 20.8991662422481], [-77.6606119085917, 20.9706131385401], [-77.6202288802527, 20.9581875913589], [-77.587611818902, 20.953528011166], [-77.5845054321067, 20.9861450725166], [-77.5363564367795, 21.0218685206626], [-77.4928670216452, 21.0125493602767], [-77.4742287008734, 21.0622515490016], [-77.4431648329204, 21.0964218037499], [-77.4105477715697, 21.0715707093875], [-77.4012286111838, 21.0467196150251], [-77.3717179366284, 21.0311876810486], [-77.3437604554707, 21.0141025536744], [-77.2614412053951, 21.087102643364], [-77.2334837242374, 21.1010813839429], [-77.1822283421149, 21.1135069311241], [-77.1449517005712, 21.2424219831292], [-77.127866573197, 21.2765922378776], [-77.1433985071736, 21.2936773652517], [-77.1542708609571, 21.3107624926259], [-77.1402921203782, 21.368230648339], [-77.1201006062088, 21.3775498087249], [-77.1123346392205, 21.4101668700756], [-77.1092282524252, 21.439677544631], [-77.0548664835074, 21.4319115776428], [-77.0206962287591, 21.4241456106545], [-76.9647812664436, 21.4660818323911], [-76.9476961390694, 21.48006057297], [-76.9104194975258, 21.4552094786075], [-76.8653768889939, 21.439677544631], [-76.8249938606549, 21.4256988040522], [-76.6758872944803, 21.3759966153273], [-76.6308446859484, 21.3495923275672], [-76.6168659453695, 21.3262944266024], [-76.5125629036357, 21.2983369454447], [-76.4553338320137, 21.2983369454447], [-76.3932060961076, 21.2890177850588], [-76.3031208790438, 21.261060303901], [-76.3000144922485, 21.2315496293457], [-76.3217591998157, 21.1305920584983], [-76.4460146716278, 21.0684643225922], [-76.4662061857973, 21.0405068414345], [-76.4553338320137, 21.0218685206626], [-76.4770785395809, 21.0187621338673], [-76.5019296339433, 21.015655747072], [-76.5065892141362, 20.9908046527096], [-76.5128019877268, 20.9737195253354], [-76.534546695294, 20.9659535583472], [-76.6090999783813, 20.9550812045636], [-76.6494830067202, 20.9504216243706], [-76.6712277142874, 20.9504216243706], [-76.6789936812756, 20.9379960771894], [-76.6805468746733, 20.908485402634], [-76.6821000680709, 20.882081114874], [-76.6821000680709, 20.8494640535233], [-76.6898660350592, 20.8323789261491], [-76.708504355831, 20.7997618647984], [-76.7147171294216, 20.7842299308219], [-76.6821000680709, 20.7485064826759], [-76.677440487878, 20.7376341288923], [-76.6852064548662, 20.7314213553017], [-76.7364618369887, 20.7112298411322], [-76.7613129313512, 20.6894851335651], [-76.7815044455206, 20.6863787467698], [-76.8001427662925, 20.6863787467698], [-76.8048023464854, 20.7360809354947], [-76.918185464514, 20.73918732229], [-77.0191430353614, 20.7360809354947], [-77.0346749693379, 20.7236553883135], [-77.202603387926, 20.7531679588569], [-77.2024198562843, 20.7298681619041], [-77.203973049682, 20.7127830345299], [-77.2101858232726, 20.6863787467698], [-77.2226113704538, 20.6661872326003], [-77.2428028846233, 20.6553148788168], [-77.2536752384068, 20.6397829448403], [-77.2692071723834, 20.6382297514426], [-77.3095902007223, 20.6739531995886], [-77.4509307999086, 20.6692936193956], [-77.4695691206805, 20.6661872326003], [-77.5037393754288, 20.6646340392027], [-77.5534415641537, 20.6801659731792], [-77.5845054321067, 20.6879319401675], [-77.6155693000597, 20.6755063929863], [-77.6839098095564, 20.6801659731792], [-77.7211864511001, 20.6801659731792], [-77.7460375454625, 20.6817191665769], [-77.7724418332226, 20.6910383269628], [-77.8112716681639, 20.6941447137581], [-77.8236972153451, 20.7050170675416], [-77.8345695691287, 20.7096766477346], [-77.7786546068132, 20.8789747280787]];
                var arrLaHabana = [[-82.5301207599152, 23.0634494915838], [-82.5293441383345, 23.0723806397624], [-82.5196363685751, 23.0805351663604], [-82.4893481269256, 23.0964559087658], [-82.413627522802, 23.138781784917], [-82.3911054969602, 23.1492661762572], [-82.3763496869258, 23.1469363115149], [-82.3573224581973, 23.1566440812743], [-82.3231511086441, 23.1698466481472], [-82.3010173935926, 23.1729531344702], [-82.2361694915996, 23.1822725934392], [-82.2132591549673, 23.18304921502], [-82.1441398342801, 23.1745063776317], [-82.0994840933867, 23.1764479315836], [-82.0979308502252, 23.1671284726145], [-82.1107451063077, 23.1620804323396], [-82.1169580789537, 23.1597505675973], [-82.1173463897441, 23.1550908381128], [-82.1076386199847, 23.1558674596936], [-82.0936594315311, 23.1504311086283], [-82.0913295667888, 23.1430532036111], [-82.0901646344177, 23.1364519201747], [-82.0901646344177, 23.1290740151575], [-82.0905529452081, 23.1216961101404], [-82.095600985483, 23.1108234080098], [-82.1014256473386, 23.10072732746], [-82.1185113221152, 23.1026688814119], [-82.1251126055516, 23.1034455029926], [-82.1313255781977, 23.0941260440236], [-82.1387034832149, 23.0890780037487], [-82.1453047666513, 23.0851948958449], [-82.1596722658952, 23.086359828216], [-82.1682151032835, 23.086359828216], [-82.169768346445, 23.0817000987315], [-82.1686034140739, 23.0766520584566], [-82.1771462514622, 23.0677209102779], [-82.1728748327681, 23.0607313160511], [-82.1880189535928, 23.0568482081473], [-82.1973384125618, 23.0572365189377], [-82.207822803902, 23.0591780728896], [-82.2136474657577, 23.0630611807934], [-82.2218019923556, 23.0607313160511], [-82.222190303146, 23.0502469247109], [-82.225296789469, 23.0366560470477], [-82.2249084786786, 23.0281132096594], [-82.2249084786786, 23.0195703722711], [-82.2218019923556, 23.015298953577], [-82.2117059118058, 23.0086976701405], [-82.2117059118058, 22.9962717248485], [-82.219083816823, 22.9931652385254], [-82.2287915865824, 22.9857873335083], [-82.2353928700188, 22.9799626716526], [-82.2466538829398, 22.9764678745392], [-82.2555850311184, 22.9729730774258], [-82.2555850311184, 22.965983483199], [-82.2555850311184, 22.9593821997626], [-82.2746122598469, 22.9551107810685], [-82.2866498943486, 22.9543341594877], [-82.2940277993658, 22.9578289566011], [-82.3033472583349, 22.9613237537145], [-82.3095602309809, 22.9655951724087], [-82.3153848928366, 22.9655951724087], [-82.3318416956337, 22.9593605848065], [-82.342566648163, 22.9582172673915], [-82.3616522988945, 22.9644594391888], [-82.3720782682317, 22.9640419292471], [-82.3674185387471, 22.9547224702781], [-82.3666419171664, 22.9473445652609], [-82.3670302279567, 22.9419082141956], [-82.3736315113932, 22.9407432818245], [-82.3845042135237, 22.9395783494534], [-82.4015898883003, 22.9376367955015], [-82.4097444148983, 22.9430731465668], [-82.4159573875443, 22.9465679436802], [-82.4268300896749, 22.9469562544705], [-82.4369261702247, 22.9465679436802], [-82.4450806968226, 22.9473445652609], [-82.4462456291937, 22.9527809163262], [-82.4443040752418, 22.9702549018932], [-82.4446923860322, 22.9842340903468], [-82.4551767773724, 22.9815159148141], [-82.4602248176473, 22.9791860500719], [-82.4648845471318, 22.9799626716526], [-82.4761455600528, 22.97724449612], [-82.4811936003277, 22.9749146313777], [-82.4874065729737, 22.974138009797], [-82.4975026535236, 22.9939418601062], [-82.5091519772349, 23.0207353046422], [-82.5060454909118, 23.0238417909653], [-82.4982792751043, 23.0285015204498], [-82.4874065729737, 23.0323846283536], [-82.4827468434892, 23.0354911146766], [-82.4881831945545, 23.0432573304841], [-82.4924546132486, 23.0502469247109], [-82.4920663024583, 23.0572365189377], [-82.4916779916679, 23.0673325994875], [-82.4967260319428, 23.0708273966009], [-82.5110935311868, 23.068885842649], [-82.513423395929, 23.0650027347453], [-82.5196363685751, 23.0630611807934], [-82.5289558275441, 23.0618962484222], [-82.5312856922864, 23.0634494915838], [-82.5301207599152, 23.0634494915838]];
                var arrArtemisa = [[-83.3780626827425, 22.8983401651828], [-83.4060210596497, 22.8408701682069], [-83.4060210596497, 22.7958261165231], [-83.4044678164882, 22.767867739616], [-83.3842756553886, 22.7569950374854], [-83.3982548438421, 22.7088444994786], [-83.3547640353199, 22.7135042289631], [-83.3407848468663, 22.685545852056], [-83.3190394426052, 22.6575874751488], [-83.2491435003372, 22.6762263930869], [-83.2305045823991, 22.6544809888258], [-83.208759178138, 22.6373953140492], [-83.0813932388942, 22.4743047820907], [-82.964900001781, 22.5193488337744], [-82.9431545975199, 22.5379877517125], [-82.8732586552519, 22.5674993717812], [-82.80957568563, 22.5970109918499], [-82.7754043360768, 22.6296290982416], [-82.7598719044617, 22.6808861225714], [-82.7319135275546, 22.701078283671], [-82.6791032600632, 22.685545852056], [-82.5796956977266, 22.6762263930869], [-82.5486308344964, 22.6622472046333], [-82.4600959742904, 22.6762263930869], [-82.4150519226066, 22.6777796362484], [-82.39796624783, 22.7414626058703], [-82.4197116520912, 22.7507820648394], [-82.4383505700293, 22.7632080101314], [-82.4367973268678, 22.7911663870386], [-82.4523297584828, 22.8066988186537], [-82.4414570563523, 22.8688285451141], [-82.4228181384142, 22.9076596241518], [-82.4212648952527, 22.932511514736], [-82.4321375973832, 22.9495971895126], [-82.4352440837063, 22.9744490800967], [-82.4352440837063, 22.9946412411963], [-82.4523297584828, 22.9977477275194], [-82.477181649067, 22.9868750253888], [-82.4911608375206, 23.0024074570039], [-82.4896075943591, 23.0194931317805], [-82.4678621900979, 23.0303658339111], [-82.483394621713, 23.0723033992718], [-82.4989270533281, 23.0800696150794], [-82.5144594849432, 23.0738566424333], [-82.5439711050119, 23.0707501561103], [-82.5812489408881, 23.0645371834643], [-82.6278462357334, 23.0490047518492], [-82.7024019074859, 23.0427917792031], [-82.7334667707161, 23.0303658339111], [-82.7598719044617, 23.0319190770726], [-82.8235548740836, 23.0319190770726], [-82.8841313573825, 23.0288125907496], [-82.9416013543584, 23.0225996181035], [-82.97421946075, 23.0225996181035], [-83.0425621598565, 23.0163866454575], [-83.0860529683787, 23.0101736728114], [-83.1217775610935, 23.0055139433269], [-83.1497359380006, 22.9961944843579], [-83.1683748559387, 22.9930879980348], [-83.1963332328459, 22.9993009706809], [-83.2165253939455, 23.0039607001654], [-83.2475902571757, 22.9993009706809], [-83.2677824182753, 22.9853217822273], [-83.3050602541516, 22.9651296211277], [-83.3345718742203, 22.9511504326741], [-83.3625302511274, 22.9247452989284], [-83.3718497100965, 22.9029998946673], [-83.3780626827425, 22.8983401651828]];
                var arrMayabeque = [[-81.7101665130454, 23.1625267124459], [-81.7987013732514, 23.1547604966383], [-81.8685973155193, 23.1578669829613], [-81.9322802851412, 23.1640799556074], [-81.9788775799865, 23.1796123872225], [-82.0052827137322, 23.1951448188376], [-82.0720721696771, 23.1920383325146], [-82.1000305465842, 23.18737860303], [-82.1109032487148, 23.1702929282534], [-82.1015837897457, 23.1376748218617], [-82.1031370329073, 23.1143761744391], [-82.1204708056669, 23.0800945933499], [-82.2042728437079, 23.0817580680474], [-82.2413756742816, 23.0786515817244], [-82.2398224311201, 23.0273945573946], [-82.3081651302265, 22.9963296941644], [-82.3423364797797, 22.9776907762262], [-82.3718480998484, 22.9776907762262], [-82.4184453946937, 22.9683713172572], [-82.4417440421163, 22.9606051014496], [-82.4448505284393, 22.9279869950579], [-82.4603829600544, 22.8938156455047], [-82.474362148508, 22.8720702412436], [-82.4867880938001, 22.848771593821], [-82.4697024190235, 22.8146002442678], [-82.4697024190235, 22.7835353810376], [-82.4665959327005, 22.7493640314844], [-82.4339778263088, 22.7307251135462], [-82.4231051241782, 22.6981070071545], [-82.4262116105012, 22.6794680892164], [-82.0441137927699, 22.6546161986323], [-81.9850905526325, 22.6561694417938], [-81.8701505586808, 22.6639356576013], [-81.7225924583374, 22.6126786332715], [-81.6589094887155, 22.5583151226187], [-81.5921200327706, 22.6421902533402], [-81.5843538169631, 22.6701486302474], [-81.5703746285095, 22.696553763993], [-81.5921200327706, 22.7167459250927], [-81.6247381391623, 22.7276186272232], [-81.6293978686469, 22.7804288947145], [-81.6402705707774, 22.8021742989757], [-81.6651224613616, 22.8347924053674], [-81.6837613792997, 22.85809105279], [-81.6651224613616, 22.9202207792504], [-81.6837613792997, 22.9450726698345], [-81.7039535403993, 22.9637115877727], [-81.7086132698838, 22.9870102351953], [-81.6930808382688, 23.0118621257795], [-81.6558030023925, 23.0708853659168], [-81.6620159750386, 23.092630770178], [-81.6697821908461, 23.1190359039236], [-81.6666757045231, 23.1454410376693], [-81.6682289476846, 23.1532072534768], [-81.7101665130454, 23.1625267124459]];
                var arrMtz = [[-81.6889037619545, 23.1567914884517], [-81.7168621388616, 23.1039812209604], [-81.7386075431228, 23.0480644671461], [-81.772778892676, 23.0014671723008], [-81.7168621388616, 22.9175920415793], [-81.7106491662156, 22.7865896703781], [-81.6826907893084, 22.7591612391053], [-81.6702648440164, 22.703244485291], [-81.6423064671092, 22.6877120536759], [-81.6547324124013, 22.6069434092774], [-81.6733713303394, 22.5603461144321], [-81.6951167346005, 22.5106423332638], [-81.9622745583801, 22.4671515247415], [-82.0461496891017, 22.4516190931264], [-82.1455572514383, 22.4516190931264], [-82.1673026556994, 22.4329801751883], [-82.1331313061462, 22.3211466675596], [-82.0585756343937, 22.2931882906525], [-81.9653810447032, 22.2621234274223], [-81.8815059139817, 22.224845591546], [-81.8504410507515, 22.1751418103777], [-81.769672406353, 22.1596093787626], [-81.7044361935696, 22.1658223514087], [-81.5232427566634, 22.1658223514087], [-81.4279589108209, 22.1627158650857], [-81.4155329655288, 22.1099055975943], [-81.2971749644393, 22.0757342480411], [-81.1670140596873, 22.146838921407], [-81.1390556827801, 22.0881601933332], [-81.0645000110277, 22.0695212753951], [-81.0272221751514, 22.057095330103], [-80.6047400352208, 22.0353499258419], [-80.5581427403756, 22.0353499258419], [-80.5829946309597, 22.0788407343641], [-80.5954205762518, 22.1316510018555], [-80.7103605702035, 22.1533964061166], [-80.7600643513718, 22.1565028924396], [-80.8190875915092, 22.1875677556698], [-80.8408329957703, 22.2279520778691], [-80.8718978590005, 22.2372715368381], [-80.8812173179695, 22.2931882906525], [-80.8843238042925, 22.4081282846042], [-80.8625784000314, 22.4454061204804], [-80.7445319197567, 22.4578320657725], [-80.6699762480042, 22.4578320657725], [-80.5113717674619, 22.5297559270143], [-80.4866935549461, 22.5665590870781], [-80.5115454455303, 22.6100498956004], [-80.5457167950835, 22.6659666494147], [-80.5363973361144, 22.709457457937], [-80.5270778771454, 22.7591612391053], [-80.5426103087605, 22.8088650202736], [-80.5643557130216, 22.8368233971808], [-80.5861011172827, 22.867888260411], [-80.6824021932963, 22.8399298835038], [-80.7258930018186, 22.8554623151189], [-80.7041475975575, 22.8958466373181], [-80.6979346249114, 22.9331244731944], [-80.7072540838805, 22.9610828501015], [-80.5887206982787, 22.9672958227476], [-80.5892076036057, 23.0232125765619], [-80.5954205762518, 23.0698098714072], [-80.5985270625748, 23.0946617619914], [-80.6575503027122, 23.1101941936065], [-80.7352124607876, 23.1101941936065], [-80.7849162419559, 23.1257266252215], [-80.8190875915092, 23.0977682483144], [-80.9091756948767, 23.0946617619914], [-80.9433470444299, 23.0760228440532], [-80.961985962368, 23.0946617619914], [-80.9806248803061, 23.1195136525755], [-81.0738194699967, 23.1195136525755], [-81.123523251165, 23.0946617619914], [-81.1763335186563, 23.0915552756683], [-81.2011854092405, 23.1070877072834], [-81.2539956767318, 23.1412590568366], [-81.3130189168692, 23.1661109474208], [-81.3502967527454, 23.1692174337438], [-81.4031070202367, 23.1443655431597], [-81.4869821509582, 23.1381525705136], [-81.5149405278654, 23.1319395978676], [-81.5559537694454, 23.1661109474208], [-81.6329870081401, 23.1723239200668], [-81.6671583576933, 23.1754304063899], [-81.6889037619545, 23.1567914884517]];
                this._polygonIsla = this.addPolygon(arrIsla, 'Isla de La Juventud', { idLayer: 'cuba', name: 'IslaJuventud' });
                this._contIsla = 0;
                this._polygonHabana = this.addPolygon(arrLaHabana, 'La Habana', { idLayer: "cuba", name: 'LaHabana' });
                this._contHabana = 0;
                this._polygonStgo = this.addPolygon(arrStgo, 'Santiago de Cuba', { idLayer: "cuba", name: 'StgoCuba' });
                this._contStgo = 0;
                this._polygonGranma = this.addPolygon(arrGranma, 'Granma', { idLayer: "cuba", name: 'Granma' });
                this._contGranma = 0;
                this._polygonPR = this.addPolygon(arrPinarRio, 'Pinar del Río', { idLayer: "cuba", name: 'PinarRio' });
                this._contPR = 0;
                this._polygonCA = this.addPolygon(arrCiegoAvila, 'Ciego de Avila', { idLayer: "cuba", name: 'CiegoAvila' });
                this._contCA = 0;
                this._polygonCienf = this.addPolygon(arrCienfuegos, 'Cienfuegos', { idLayer: "cuba", name: 'Cienfuegos' });
                this._contCienf = 0;
                this._polygonCama = this.addPolygon(arrCamaguey, 'Camaguey', { idLayer: "cuba", name: 'Camaguey' });
                this._contCama = 0;
                this._polygonGtmo = this.addPolygon(arrGtmo, 'Guantanamo', { idLayer: "cuba", name: 'Guantanamo' });
                this._contGtmo = 0;
                this._polygonVC = this.addPolygon(arrVC, 'Villa Clara', { idLayer: "cuba", name: 'VillaClara' });
                this._contVC = 0;
                this._polygonHolguin = this.addPolygon(arrHolguin, 'Holguin', { idLayer: "cuba", name: 'Holguin' });
                this._contHolguin = 0;
                this._polygonMtz = this.addPolygon(arrMtz, 'Matanzas', { idLayer: "cuba", name: 'Matanzas' });
                this._contMtz = 0;
                this._polygonSS = this.addPolygon(arrSS, 'Sancti Spiritus', { idLayer: "cuba", name: 'SanctiSpiritus' });
                this._contSS = 0;
                this._polygonLT = this.addPolygon(arrLasTunas, 'Las Tunas', { idLayer: "cuba", name: 'LasTunas' });
                this._contLT = 0;
                this._polygonArte = this.addPolygon(arrArtemisa, 'Artemisa', { idLayer: "cuba", name: 'Artemisa' });
                this._contArte = 0;
                this._polygonMay = this.addPolygon(arrMayabeque, 'Mayabeque', { idLayer: "cuba", name: 'Mayabeque' });
                this._contMay = 0;
                this.showLayer('cuba');
                var layer = this.getGraphicLayerById('cuba');
                layer.attributes.isVolumenLayer = true;
                var graphics = this.getGraphicsByLayer(idlayer);
                for (var i = 0; i < graphics.length; i++) {
                    if (graphics[i].values_.attributes.isPoint) {
                        this._auxContGraphicContainer(graphics[i]);
                    }
                }
                this._setColorAndShowTooltipVolumeProvinceLayer();
                this._volumenProvinceLayerVisible = true;
            }
        }
        else {
            this._ZoomCenterAux = {};
            this._ZoomCenterAux.zoom = this._myMap.getView().getZoom();
            this._ZoomCenterAux.center = this._myMap.getView().getCenter();
            this.centerAt(-80, 22, null, 7);
            if (this._volumenProvinceLayerVisible) {
                this.deleteVolumeProvinceLayer();
            }
            _context._layerVolumenProvinceCt.toggleClass('div-selected');
            this._layerBaseVisibleAux = [];
            $.each(this._arrBasicLayers, function (i, o) {
                if (o.getVisible()) {
                    _context._layerBaseVisibleAux.push(o.attributes.id);
                }
            });
            this._layerGraphicVisibleAux = [];
            for (var i = 0; i < length; i++) {
                $.each(this.getGraphicLayers(), function (i, o) {
                    if (o.getVisible()) {
                        _context._layerGraphicVisibleAux.push(o.attributes.id);
                    }
                });
            }
            this.hideAllLayersGraphic();
            for (var i = 0; i < this._arrBasicLayers.length; i++) {
                if (this._arrBasicLayers[0].getVisible()) {
                    this.hideLayer(this._arrBasicLayers[i].attributes.id);
                }
            }
            var arrIsla = [[-83.0915451887119, 21.78129421029], [-83.0868854592274, 21.7921669124206], [-83.0853322160659, 21.8038162361319], [-83.0736828923546, 21.8240083972315], [-83.0573738391587, 21.8488602878157], [-83.0433946507051, 21.8581797467847], [-83.0294154622515, 21.8706056920768], [-83.0045635716674, 21.8939043394994], [-82.9936908695368, 21.898564068984], [-82.9502000610146, 21.9234159595681], [-82.9463169531108, 21.9311821753757], [-82.9587428984029, 21.9319587969564], [-82.9688389789527, 21.9373951480217], [-82.9960207342791, 21.9272990674719], [-83.0014570853444, 21.9327354185372], [-82.9750519515987, 21.9451613638293], [-82.9688389789527, 21.9436081206678], [-82.9618493847259, 21.9389483911832], [-82.9439870883685, 21.9389483911832], [-82.9354442509802, 21.9319587969564], [-82.9269014135919, 21.9327354185372], [-82.9199118193651, 21.9288523106334], [-82.8989430366848, 21.9304055537949], [-82.8818573619081, 21.9272990674719], [-82.8748677676814, 21.9304055537949], [-82.857005471324, 21.9296289322142], [-82.850792498678, 21.9350652832794], [-82.8181743922863, 21.9226393379874], [-82.8080783117365, 21.9210860948259], [-82.7863329074753, 21.9055536632108], [-82.7785666916678, 21.9164263653413], [-82.7731303406025, 21.9032237984685], [-82.7575979089874, 21.898564068984], [-82.742842098953, 21.9071069063723], [-82.7242031810149, 21.8892446100149], [-82.7032343983346, 21.8900212315957], [-82.6884785883002, 21.8838082589496], [-82.6706162919428, 21.8612862331077], [-82.6900318314617, 21.825561640393], [-82.6744993998466, 21.8185720461662], [-82.6651799408776, 21.8022629929704], [-82.6504241308432, 21.7999331282281], [-82.6061567007402, 21.775081237644], [-82.571985351187, 21.7346969154447], [-82.5999437280942, 21.6624711084345], [-82.5587827843142, 21.6415023257542], [-82.5253880563417, 21.5762661129708], [-82.5385906232145, 21.5576271950326], [-82.6014969712557, 21.5242324670602], [-82.6310085913244, 21.5125831433489], [-82.6667331840391, 21.5032636843798], [-82.7125538573036, 21.4830715232802], [-82.7676939895372, 21.4636559837613], [-82.8399197965474, 21.4426872010809], [-82.8911768208772, 21.4364742284349], [-82.9269014135919, 21.4465703089847], [-82.9944674911176, 21.4589962542768], [-83.0418414075436, 21.461326119019], [-83.0861088376466, 21.4714221995689], [-83.1140672145538, 21.5133597649296], [-83.1443554562033, 21.5273389533832], [-83.176973562595, 21.578595977713], [-83.1676541036259, 21.5925751661666], [-83.1987189668561, 21.6275231373006], [-83.1901761294678, 21.6337361099466], [-83.1661008604644, 21.6158738135892], [-83.1257165382651, 21.5894686798436], [-83.1109607282308, 21.57548949139], [-83.0496076233512, 21.5646167892594], [-83.0037869500866, 21.5747128698092], [-82.9766051947602, 21.5941284093281], [-82.9905843832138, 21.6368425962696], [-83.0232024896055, 21.6795567832111], [-83.0325219485746, 21.6904294853417], [-83.0907685671312, 21.7774111023862], [-83.0915451887119, 21.78129421029]];
            var arrStgo = [[-77.0384092429306, 19.8956848380554], [-77.0570475637024, 19.9515998003709], [-76.9700687334339, 19.9702381211427], [-76.920366544709, 20.0323658570488], [-76.8147493936687, 20.0572169514112], [-76.6221534123599, 20.0261530834582], [-76.5476001292726, 20.0634297250018], [-76.429557431051, 20.1131319137267], [-76.4357702046416, 20.2311746119482], [-76.4047063366886, 20.2560257063107], [-76.2680253176952, 20.4672600083913], [-76.1996848081985, 20.4361961404383], [-76.1189187515206, 20.4858983291631], [-76.0567910156145, 20.5790899330223], [-75.9884505061178, 20.5418132914786], [-75.9138972230305, 20.504536649935], [-75.8579822607151, 20.4113450460759], [-75.7585778832653, 20.4734727819819], [-75.6653862794062, 20.4548344612101], [-75.6156840906814, 20.5293877442974], [-75.4852158452786, 20.5542388386598], [-75.3858114678289, 20.5542388386598], [-75.3858114678289, 20.4921111027538], [-75.4106625621913, 20.4734727819819], [-75.3733859206477, 20.4237705932571], [-75.3671731470571, 20.3989194988946], [-75.4603647509162, 20.3181534422167], [-75.447939203735, 20.2808768006731], [-75.447939203735, 20.1690468760421], [-75.4168753357819, 20.1131319137267], [-75.4230881093725, 20.075855272183], [-75.4727902980974, 20.0385786306394], [-75.4603647509162, 19.9888764419145], [-75.3423220526946, 19.8894720644648], [-75.3609603734664, 19.870833743693], [-75.6156840906814, 19.8770465172836], [-75.7150884681311, 19.9391742531897], [-75.8890461286681, 19.9578125739615], [-75.9635994117554, 19.9391742531897], [-76.1064932043394, 19.9453870267803], [-76.2245359025609, 19.9702381211427], [-76.3425786007825, 19.9391742531897], [-76.5600256764538, 19.9267487060084], [-76.6656428274941, 19.9391742531897], [-76.7836855257157, 19.9205359324178], [-76.8582388088029, 19.9143231588272], [-76.9141537711184, 19.8770465172836], [-77.0135581485681, 19.8770465172836], [-77.0384092429306, 19.8956848380554]];
            var arrGranma = [[-77.063260337293, 19.9391742531897], [-77.0384092429306, 19.8894720644648], [-77.1067497524273, 19.8894720644648], [-77.3117712809173, 19.8832592908742], [-77.4049628847764, 19.8273443285587], [-77.4608778470919, 19.8521954229211], [-77.5105800358168, 19.8335571021493], [-77.5913460924947, 19.8397698757399], [-77.665899375582, 19.8149187813775], [-77.7404526586693, 19.8459826493305], [-77.7590909794411, 19.8832592908742], [-77.5913460924947, 20.0820680457736], [-77.5167928094074, 20.1504085552703], [-77.411175658367, 20.2125362911764], [-77.2558563186018, 20.2995151214449], [-77.1937285826958, 20.3119406686261], [-77.1253880731991, 20.4051322724852], [-77.1005369788367, 20.4548344612101], [-77.1564519411521, 20.504536649935], [-77.2558563186018, 20.5293877442974], [-77.2620690921925, 20.5790899330223], [-77.2247924506488, 20.6163665745659], [-77.2807074129643, 20.678494310472], [-77.2434307714206, 20.7033454048344], [-77.2434307714206, 20.7841114615123], [-77.1005369788367, 20.8089625558748], [-77.03219646934, 20.7592603671499], [-76.8023238464875, 20.7654731407405], [-76.7712599785344, 20.7157709520156], [-76.715345016219, 20.7592603671499], [-76.5662384500444, 20.7033454048344], [-76.5413873556819, 20.678494310472], [-76.5476001292726, 20.647430442519], [-76.3922807895074, 20.6039410273847], [-76.3363658271919, 20.5728771594317], [-76.2493869969234, 20.5418132914786], [-76.1872592610173, 20.4921111027538], [-76.1624081666549, 20.4361961404383], [-76.2121103553797, 20.392706725304], [-76.255599770514, 20.392706725304], [-76.2680253176952, 20.3492173101698], [-76.2928764120576, 20.3492173101698], [-76.3363658271919, 20.3492173101698], [-76.3674296951449, 20.2373873855388], [-76.398493563098, 20.218749064767], [-76.3798552423261, 20.1566213288609], [-76.3798552423261, 20.0882808193642], [-76.4109191102792, 20.0696424985924], [-76.5165362613195, 20.0261530834582], [-76.5973023179974, 20.0013019890957], [-76.6967066954471, 20.0013019890957], [-76.7961110728969, 20.0137275362769], [-76.8768771295748, 19.9950892155051], [-76.9327920918902, 19.9764508947333], [-76.9452176390715, 19.9515998003709], [-77.0135581485681, 19.932961479599], [-77.063260337293, 19.9391742531897]];
            var arrPinarRio = [[-84.810589004781, 21.9521128965466], [-84.6739079857877, 21.976963990909], [-84.4999503252506, 22.0701555947682], [-84.3881204006197, 22.0577300475869], [-84.3694820798479, 22.0950066891306], [-84.4564609101164, 22.2006238401709], [-84.4129714949821, 22.3373048591643], [-84.3073543439418, 22.4864114253389], [-84.2576521552169, 22.5609647084262], [-84.0153539851832, 22.6976457274196], [-83.7916941359213, 22.8032628784599], [-83.5183320979346, 22.8902417087284], [-83.226331739176, 23.0144971805406], [-82.9778207955517, 23.0269227277218], [-82.9219058332362, 22.9834333125875], [-82.9219058332362, 22.8716033879566], [-82.909480286055, 22.8529650671848], [-82.909480286055, 22.8281139728223], [-82.9529697011893, 22.7846245576881], [-82.8970547388738, 22.7100712746008], [-82.8225014557865, 22.5920285763792], [-82.909480286055, 22.5361136140637], [-83.0461613050484, 22.4864114253389], [-83.1455656824981, 22.3248793119831], [-83.2511828335385, 22.3186665383925], [-83.3133105694445, 22.2441132553052], [-83.3567999845788, 22.2130493873521], [-83.4313532676661, 22.1695599722179], [-83.4996937771628, 22.1695599722179], [-83.5556087394782, 22.2006238401709], [-83.6363747961561, 22.1571344250367], [-83.7047153056528, 22.1633471986273], [-83.7544174943777, 22.1571344250367], [-83.8413963246462, 22.1571344250367], [-83.8973112869617, 22.1571344250367], [-83.9470134756865, 22.119857783493], [-83.9532262492771, 22.0639428211775], [-83.9470134756865, 22.0266661796339], [-83.971864570049, 21.9645384437278], [-83.9842901172302, 21.9272618021842], [-84.0215667587738, 21.8899851606405], [-84.1147583626329, 21.914836255003], [-84.2576521552169, 21.8899851606405], [-84.4253970421633, 21.7657296888284], [-84.5123758724318, 21.7470913680565], [-84.5372269667943, 21.7657296888284], [-84.4688864572976, 21.8651340662781], [-84.4813120044788, 21.8961979342311], [-84.5682908347473, 21.9210490285936], [-84.6490568914252, 21.8899851606405], [-84.7173974009219, 21.8589212926875], [-84.7608868160562, 21.8278574247345], [-84.779525136828, 21.8092191039626], [-84.9286317030026, 21.8154318775532], [-84.9659083445462, 21.8651340662781], [-84.810589004781, 21.9521128965466]];
            var arrCiegoAvila = [[-78.9270924144754, 22.3994325950704], [-78.7841986218914, 22.405645368661], [-78.6972197916229, 22.3807942742986], [-78.5978154141732, 22.3310920855737], [-78.4114322064549, 22.2689643496676], [-78.3058150554146, 22.1944110665803], [-78.1815595836024, 22.1571344250367], [-78.0821552061527, 22.0950066891306], [-78.0759424325621, 22.0390917268151], [-78.1691340364212, 21.9707512173184], [-78.2499000930991, 21.9272618021842], [-78.1504957156494, 21.8154318775532], [-78.15670848924, 21.771942462419], [-78.2312617723273, 21.7595169152378], [-78.2747511874615, 21.7843680096002], [-78.2809639610522, 21.8092191039626], [-78.330666149777, 21.7843680096002], [-78.3244533761864, 21.7284530472847], [-78.4238577536361, 21.6414742170162], [-78.473559942361, 21.597984801882], [-78.6350920557168, 21.5172187452041], [-78.7779858483008, 21.5358570659759], [-78.7469219803477, 21.6041975754726], [-78.8773902257505, 21.5855592547007], [-79.0078584711533, 21.5855592547007], [-78.9892201503814, 21.6476869906068], [-79.0078584711533, 21.6663253113786], [-79.0824117542406, 21.6663253113786], [-79.1196883957842, 21.6663253113786], [-79.1321139429654, 21.7160275001035], [-79.1259011693748, 21.7905807831908], [-79.0513478862875, 21.945900122956], [-79.0140712447439, 21.9583256701372], [-79.0016456975627, 22.0266661796339], [-79.0699862070593, 22.1136450099024], [-78.9705818296096, 22.3435176327549], [-78.9270924144754, 22.3994325950704]];
            var arrCienfuegos = [[-80.923129537758, 22.3896574038953], [-80.8982784433956, 22.4673170737779], [-80.847023061273, 22.4999341351285], [-80.7615974244022, 22.4812958143567], [-80.6544270799642, 22.4750830407661], [-80.5814269902746, 22.484402201152], [-80.5519163157192, 22.5387639700698], [-80.4400863910882, 22.5946789323853], [-80.3857246221704, 22.560508677637], [-80.3577671410127, 22.5434235502628], [-80.3235968862643, 22.5667214512276], [-80.2878734381183, 22.5931257389877], [-80.2350648625982, 22.560508677637], [-80.2102137682357, 22.448678753006], [-80.213320155031, 22.3974233708835], [-80.2195329286216, 22.3648063095328], [-80.1558519993179, 22.3492743755563], [-80.1356604851484, 22.3228700877962], [-80.1434264521367, 22.3088913472174], [-80.1014902304001, 22.2576359650948], [-80.0642135888564, 22.2483168047089], [-80.0704263624471, 22.2250189037441], [-80.0937242634118, 22.1892954555982], [-80.07508594264, 22.1691039414287], [-80.0906178766165, 22.1302741064874], [-80.0735327492424, 22.0914442715461], [-80.079745522833, 22.065039983786], [-80.0486816548799, 22.0479548564118], [-80.0347029143011, 21.9734015733245], [-80.0176177869269, 21.9532100591551], [-80.0253837539152, 21.9299121581903], [-80.0455752680846, 21.9143802242138], [-80.0844051030259, 21.8771035826701], [-80.0890646832189, 21.8398269411265], [-80.1045966171954, 21.8180822335593], [-80.1278945181602, 21.814975846764], [-80.1651711597038, 21.8227418137523], [-80.2148733484287, 21.8522524883077], [-80.2940862117089, 21.8957419034419], [-80.3267032730596, 21.9345717383832], [-80.356213947615, 21.9640824129386], [-80.4043629429422, 22.0029122478799], [-80.4183416835211, 22.0168909884588], [-80.4230012637141, 22.0277633422423], [-80.4447459712812, 22.02931653564], [-80.4587247118601, 22.0572740167977], [-80.4618310986554, 22.0370825026283], [-80.4866821930178, 22.0370825026283], [-80.5457035421286, 22.0541676300024], [-80.5767674100816, 22.0510612432071], [-80.5891929572628, 22.0479548564118], [-80.601618504444, 22.0665931771836], [-80.6124908582276, 22.100763431932], [-80.6342355657947, 22.1194017527038], [-80.6544270799642, 22.1209549461015], [-80.6885973347125, 22.1209549461015], [-80.7227675894609, 22.1209549461015], [-80.8221719669106, 22.1458060404639], [-80.8625549952496, 22.1877422622005], [-80.9029380235885, 22.2234657103465], [-80.9169167641674, 22.2529763849019], [-80.9200231509627, 22.3399552151704], [-80.9262359245533, 22.3477211821587], [-80.9386614717345, 22.3477211821587], [-80.923129537758, 22.3896574038953]];
            var arrCamaguey = [[-78.4923818704327, 21.6379117994317], [-78.4457860685031, 21.6845076013613], [-78.3774455590064, 21.7466353372673], [-78.3463816910534, 21.8056566863781], [-78.2966795023285, 21.8367205543312], [-78.2562964739896, 21.7808055920157], [-78.2780411815567, 21.9423377053715], [-78.2283389928318, 21.9796143469151], [-78.1165090682009, 22.02931653564], [-78.0947643606338, 22.0945506583414], [-77.9487641812545, 21.9702951865292], [-77.8679981245766, 21.9516568657574], [-77.8120831622611, 21.8926355166466], [-77.7623809735362, 21.8926355166466], [-77.7344234923785, 21.8211886203546], [-77.5791041526133, 21.7901247524016], [-77.433103973234, 21.6876139881566], [-77.3399123693749, 21.6751884409754], [-77.1970185767909, 21.6782948277707], [-77.1255716804989, 21.6596565069988], [-77.0634439445928, 21.6037415446834], [-77.0075289822774, 21.5447201955726], [-77.0292736898445, 21.3987200161933], [-77.0727631049788, 21.3925072426027], [-77.1069333597271, 21.3490178274684], [-77.116252520113, 21.3148475727201], [-77.0634439445928, 21.3148475727201], [-77.1193589069083, 21.2278687424516], [-77.1535291616567, 21.1005068838441], [-77.2001249635862, 21.0725494026864], [-77.2436143787205, 21.0632302423005], [-77.3026357278313, 20.9824641856226], [-77.3368059825796, 20.9824641856226], [-77.4051464920763, 21.0011025063944], [-77.4486359072105, 21.0104216667803], [-77.5791041526133, 20.9234428365118], [-77.6412318885194, 20.9079109025353], [-77.6381255017241, 20.8675278741963], [-77.790338454694, 20.8147192986762], [-77.8058703886705, 20.7681234967466], [-77.821402322647, 20.7246340816123], [-77.8804236717578, 20.7028893740452], [-77.9518705680498, 20.6811446664781], [-78.0481685587042, 20.6935702136593], [-78.1102962946103, 20.7339532419983], [-78.1724240305164, 20.7712298835419], [-78.2128070588553, 20.8209320722668], [-78.2531900871943, 20.8240384590621], [-78.2842539551473, 20.8892725817635], [-78.3929774929829, 20.9420811572836], [-78.4861690968421, 21.0321663743474], [-78.5514032195434, 21.2806773179718], [-78.597999021473, 21.4235711105557], [-78.6414884366073, 21.5074435540289], [-78.4923818704327, 21.6379117994317]];
            var arrGtmo = [[-75.3775429418648, 20.4330256433987], [-75.32784075314, 20.4532171575681], [-75.2703725974268, 20.4237064830127], [-75.2377555360761, 20.4423448037846], [-75.2066916681231, 20.4873874123165], [-75.1212660312522, 20.4951533793047], [-75.0544787151532, 20.4687490915446], [-75.0109893000189, 20.4532171575681], [-74.9939041726448, 20.4749618651353], [-74.9286700499434, 20.4765150585329], [-74.8339252526866, 20.4376852235916], [-74.7873294507571, 20.5153448934742], [-74.7096697808745, 20.5712598557897], [-74.6941378468979, 20.5495151482226], [-74.5636696014952, 20.462536317954], [-74.5294993467468, 20.4206000962174], [-74.4580524504548, 20.3584723603114], [-74.3104990776779, 20.3103233649841], [-74.2887543701108, 20.3227489121654], [-74.2142010870235, 20.328961685756], [-74.1443073841291, 20.2699403366452], [-74.122562676562, 20.2186849545227], [-74.198669153047, 20.1363657044471], [-74.225073440807, 20.119280577073], [-74.229733021, 20.0851103223246], [-74.3073926908826, 20.0587060345645], [-74.3291373984497, 20.0695783883481], [-74.3695204267887, 20.0757911619387], [-74.475137577829, 20.0571528411669], [-74.5636696014952, 20.0416209071904], [-74.6102654034247, 20.043174100588], [-74.6397760779801, 20.0354081335997], [-74.7081165874768, 20.0416209071904], [-74.8013081913359, 20.0229825864185], [-74.8479039932655, 20.0214293930209], [-74.8743082810256, 19.9934719118631], [-74.903818955581, 19.976386784489], [-74.9442019839199, 19.9639612373078], [-74.9768190452706, 19.9142590485829], [-75.0839893897086, 19.8909611476181], [-75.0964149368898, 19.8956207278111], [-75.1010745170828, 19.9593016571148], [-75.1896065407489, 19.9686208175007], [-75.2284363756902, 19.9297909825594], [-75.2299895690879, 19.8987271146064], [-75.3045428521752, 19.8738760202439], [-75.3666705880812, 19.8754292136416], [-75.3915216824437, 19.8894079542205], [-75.4691813523263, 19.9670676241031], [-75.5049048004723, 20.0167698128279], [-75.501798413677, 20.0726847751434], [-75.4707345457239, 20.0882167091199], [-75.4443302579638, 20.1084082232894], [-75.4847132863028, 20.1845146997743], [-75.4878196730981, 20.2450892422828], [-75.4738409325192, 20.3010042045982], [-75.4831600929052, 20.3336212659489], [-75.4334579041803, 20.3740042942879], [-75.425691937192, 20.4050681622409], [-75.4070536164202, 20.4097277424339], [-75.3775429418648, 20.4330256433987]];
            var arrVC = [[-80.0235556139941, 21.9437204477121], [-79.9148320761585, 21.9996354100276], [-79.8185340855041, 21.9685715420746], [-79.7439808024168, 22.0772950799102], [-79.7626191231886, 22.1642739101787], [-79.7067041608731, 22.1704866837693], [-79.6476828117624, 22.1642739101787], [-79.5513848211079, 22.1332100422257], [-79.4861506984065, 22.1549547497928], [-79.4550868304535, 22.2326144196754], [-79.4022782549333, 22.238827193266], [-79.3308313586413, 22.2201888724942], [-79.296661103893, 22.3009549291721], [-79.3867463209568, 22.3444443443063], [-79.3774271605709, 22.4500614953467], [-79.6414700381717, 22.7669129484677], [-79.7657255099839, 22.7979768164207], [-79.9427895573162, 22.8787428730986], [-80.0359811611753, 22.9564025429812], [-80.1074280574673, 22.9688280901624], [-80.1850877273499, 23.0029983449108], [-80.2689601708231, 23.0402749864544], [-80.3528326142963, 22.9936791845249], [-80.4180667369977, 22.984360024139], [-80.5951307843301, 23.0806580147934], [-80.6137691051019, 23.086870788384], [-80.6324074258737, 23.0558069204309], [-80.635513812669, 23.0278494392732], [-80.7504501240953, 22.9905727977296], [-80.7566628976859, 22.9532961561859], [-80.7690884448671, 22.8818492598939], [-80.7442373505046, 22.8445726183503], [-80.6634712938267, 22.7824448824442], [-80.5982371711254, 22.801083203216], [-80.5764924635582, 22.7575937880818], [-80.5982371711254, 22.7172107597428], [-80.5671733031723, 22.6768277314039], [-80.5733860767629, 22.6115936087025], [-80.5392158220146, 22.5681041935682], [-80.5205775012428, 22.5308275520246], [-80.4367050577696, 22.5681041935682], [-80.4025348030212, 22.5184020048434], [-80.3714709350682, 22.4997636840715], [-80.3093431991621, 22.5277211652293], [-80.2907048783903, 22.5681041935682], [-80.2596410104372, 22.4749125897091], [-80.2503218500513, 22.4065720802124], [-80.2689601708231, 22.3848273726453], [-80.2316835292795, 22.3382315707157], [-80.1633430197828, 22.3040613159674], [-80.1074280574673, 22.2201888724942], [-80.1229599914439, 22.1549547497928], [-80.1105344442626, 22.1176781082492], [-80.0981088970814, 22.0679759195243], [-80.073257802719, 22.0306992779806], [-80.0608322555378, 21.9809970892558], [-80.0484067083566, 21.9561459948934], [-80.0235556139941, 21.9437204477121]];
            var arrHolguin = [[-76.7463175449485, 20.8129956542215], [-76.7121472902001, 20.8564850693558], [-76.7028281298142, 20.9341447392384], [-76.690402582633, 20.9838469279632], [-76.6375940071128, 20.9838469279632], [-76.4947002145288, 21.0801449186176], [-76.4232533182369, 21.1174215601613], [-76.3549128087402, 21.145379041319], [-76.342487261559, 21.2044003904298], [-76.3083170068106, 21.2696345131312], [-76.1871679217938, 21.2012940036345], [-76.1157210255018, 21.1640173620908], [-76.087763544344, 21.1329534941378], [-75.9604016857366, 21.1236343337519], [-75.8175078931526, 21.145379041319], [-75.7740184780183, 21.1422726545237], [-75.6590821665921, 21.1081023997754], [-75.6093799778672, 21.0894640790036], [-75.565890562733, 21.0055916355303], [-75.5814224967095, 20.9434638996243], [-75.6093799778672, 20.8937617108994], [-75.4571670248973, 20.7726126258825], [-75.3142732323134, 20.7415487579295], [-75.2366135624307, 20.7353359843389], [-75.1682730529341, 20.7198040503624], [-75.0875069962562, 20.7104848899765], [-75.003634552783, 20.7166976635671], [-74.7458044487727, 20.6452507672751], [-74.717846967615, 20.5738038709831], [-74.7520172223633, 20.511676135077], [-74.7675491563399, 20.4712931067381], [-74.7768683167258, 20.4371228519897], [-74.8110385714741, 20.4184845312179], [-74.8483152130178, 20.4029525972414], [-74.8949110149473, 20.4122717576273], [-74.9384004300816, 20.4371228519897], [-74.9787834584205, 20.4557611727615], [-74.9725706848299, 20.3998462104461], [-75.0129537131689, 20.4122717576273], [-75.1216772510045, 20.4712931067381], [-75.1744858265247, 20.4557611727615], [-75.1993369208871, 20.4557611727615], [-75.2241880152495, 20.4246973048085], [-75.2304007888401, 20.3936334368555], [-75.2614646567932, 20.3874206632649], [-75.3453371002664, 20.4309100783991], [-75.4385287041255, 20.5303144558488], [-75.4789117324645, 20.5303144558488], [-75.5006564400316, 20.5054633614864], [-75.5596777891424, 20.4899314275099], [-75.6000608174813, 20.4837186539193], [-75.6062735910719, 20.4433356255803], [-75.6404438458203, 20.4340164651944], [-75.7367418364747, 20.4278036916038], [-75.7833376384042, 20.4278036916038], [-75.8175078931526, 20.3998462104461], [-76.0380613556192, 20.5178889086676], [-76.0473805160051, 20.4899314275099], [-76.0660188367769, 20.4526547859662], [-76.1001890915253, 20.4153781444226], [-76.1188274122971, 20.3874206632649], [-76.2772531388576, 20.4992505878958], [-76.3766575163073, 20.5427400030301], [-76.5692534976161, 20.6203996729127], [-76.5941045919786, 20.654569927661], [-76.6065301391598, 20.6701018616375], [-76.6562323278847, 20.6701018616375], [-76.6841898090424, 20.6918465692046], [-76.7121472902001, 20.7042721163859], [-76.7463175449485, 20.8129956542215]];
            var arrSS = [[-79.9770702975044, 21.9882857287947], [-79.9227085285866, 22.031775143929], [-79.7844743161956, 22.2088391912613], [-79.7394317076636, 22.2243711252378], [-79.6540060707928, 22.201073224273], [-79.6369209434186, 22.2041796110683], [-79.6074102688632, 22.1808817101036], [-79.5623676603313, 22.174668936513], [-79.5266442121853, 22.1808817101036], [-79.4148142875544, 22.2663073469744], [-79.3744312592154, 22.2569881865885], [-79.3526865516483, 22.2880520545415], [-79.4023887403732, 22.3191159224946], [-79.421027061145, 22.4278394603302], [-79.380644032806, 22.455796941488], [-79.3588993252389, 22.4309458471255], [-79.2843460421516, 22.4029883659678], [-79.1585373769418, 22.3921160121842], [-79.1367926693747, 22.4107543329561], [-79.0901968674451, 22.3952223989795], [-79.0203031645508, 22.4060947527631], [-78.9410903012705, 22.3952223989795], [-78.9084732399198, 22.3967755923772], [-78.9177924003057, 22.3703713046171], [-78.9768137494165, 22.2492222196002], [-79.0482606457085, 22.1047752336186], [-78.9643882022353, 22.0519666580984], [-78.9488562682588, 22.0240091769407], [-78.9768137494165, 21.9479027004558], [-78.992345683393, 21.9183920259004], [-79.0420478721179, 21.9308175730816], [-79.0824309004569, 21.8391791626201], [-79.0793245136616, 21.8081152946671], [-79.1103883816146, 21.745987558761], [-79.0855372872522, 21.7273492379892], [-79.0886436740475, 21.6931789832408], [-79.0436010655156, 21.6931789832408], [-79.0265159381414, 21.7242428511939], [-78.9892392965977, 21.7071577238197], [-78.9550690418494, 21.6947321766385], [-78.9535158484517, 21.6667746954808], [-78.9783669428142, 21.6046469595747], [-79.0063244239719, 21.5875618322005], [-79.0358350985273, 21.5813490586099], [-79.0560266126968, 21.5844554454052], [-79.1026224146263, 21.5658171246334], [-79.13989905617, 21.5456256104639], [-79.1911544382925, 21.5409660302709], [-79.2222183062455, 21.5394128368733], [-79.2672609147774, 21.5456256104639], [-79.3744312592154, 21.5968809925864], [-79.4117079007591, 21.5860086388029], [-79.4350058017239, 21.5875618322005], [-79.5204314385947, 21.6310512473348], [-79.5390697593665, 21.6108597331653], [-79.5701336273196, 21.6326044407324], [-79.6011974952726, 21.6341576341301], [-79.6322613632257, 21.6729874690714], [-79.6741975849623, 21.6807534360596], [-79.70215506612, 21.6667746954808], [-79.7316657406754, 21.679200242662], [-79.7642828020261, 21.6962853700361], [-79.7984530567744, 21.6993917568314], [-79.8124317973533, 21.6916257898432], [-79.8155381841486, 21.6698810822761], [-79.8217509577392, 21.6605619218902], [-79.8497084388969, 21.6729874690714], [-79.8636871794758, 21.6854130162526], [-79.8900914672359, 21.6838598228549], [-79.9040702078148, 21.7133704974103], [-79.9661979437208, 21.7242428511939], [-79.9724107173114, 21.7164768842056], [-80.0019213918668, 21.7242428511939], [-80.0298788730246, 21.7382215917727], [-80.0360916466152, 21.7692854597258], [-80.0516235805917, 21.7987961342812], [-80.1168577032931, 21.8205408418483], [-80.1090917363048, 21.8453919362107], [-80.1044321561119, 21.8702430305732], [-80.0873470287377, 21.9028600919239], [-80.0656023211706, 21.9214984126957], [-80.0454108070011, 21.9370303466722], [-80.0360916466152, 21.9510090872511], [-79.9770702975044, 21.9882857287947]];
            var arrLasTunas = [[-77.7786546068132, 20.8789747280787], [-77.7227396444977, 20.882081114874], [-77.6761438425682, 20.8991662422481], [-77.6606119085917, 20.9706131385401], [-77.6202288802527, 20.9581875913589], [-77.587611818902, 20.953528011166], [-77.5845054321067, 20.9861450725166], [-77.5363564367795, 21.0218685206626], [-77.4928670216452, 21.0125493602767], [-77.4742287008734, 21.0622515490016], [-77.4431648329204, 21.0964218037499], [-77.4105477715697, 21.0715707093875], [-77.4012286111838, 21.0467196150251], [-77.3717179366284, 21.0311876810486], [-77.3437604554707, 21.0141025536744], [-77.2614412053951, 21.087102643364], [-77.2334837242374, 21.1010813839429], [-77.1822283421149, 21.1135069311241], [-77.1449517005712, 21.2424219831292], [-77.127866573197, 21.2765922378776], [-77.1433985071736, 21.2936773652517], [-77.1542708609571, 21.3107624926259], [-77.1402921203782, 21.368230648339], [-77.1201006062088, 21.3775498087249], [-77.1123346392205, 21.4101668700756], [-77.1092282524252, 21.439677544631], [-77.0548664835074, 21.4319115776428], [-77.0206962287591, 21.4241456106545], [-76.9647812664436, 21.4660818323911], [-76.9476961390694, 21.48006057297], [-76.9104194975258, 21.4552094786075], [-76.8653768889939, 21.439677544631], [-76.8249938606549, 21.4256988040522], [-76.6758872944803, 21.3759966153273], [-76.6308446859484, 21.3495923275672], [-76.6168659453695, 21.3262944266024], [-76.5125629036357, 21.2983369454447], [-76.4553338320137, 21.2983369454447], [-76.3932060961076, 21.2890177850588], [-76.3031208790438, 21.261060303901], [-76.3000144922485, 21.2315496293457], [-76.3217591998157, 21.1305920584983], [-76.4460146716278, 21.0684643225922], [-76.4662061857973, 21.0405068414345], [-76.4553338320137, 21.0218685206626], [-76.4770785395809, 21.0187621338673], [-76.5019296339433, 21.015655747072], [-76.5065892141362, 20.9908046527096], [-76.5128019877268, 20.9737195253354], [-76.534546695294, 20.9659535583472], [-76.6090999783813, 20.9550812045636], [-76.6494830067202, 20.9504216243706], [-76.6712277142874, 20.9504216243706], [-76.6789936812756, 20.9379960771894], [-76.6805468746733, 20.908485402634], [-76.6821000680709, 20.882081114874], [-76.6821000680709, 20.8494640535233], [-76.6898660350592, 20.8323789261491], [-76.708504355831, 20.7997618647984], [-76.7147171294216, 20.7842299308219], [-76.6821000680709, 20.7485064826759], [-76.677440487878, 20.7376341288923], [-76.6852064548662, 20.7314213553017], [-76.7364618369887, 20.7112298411322], [-76.7613129313512, 20.6894851335651], [-76.7815044455206, 20.6863787467698], [-76.8001427662925, 20.6863787467698], [-76.8048023464854, 20.7360809354947], [-76.918185464514, 20.73918732229], [-77.0191430353614, 20.7360809354947], [-77.0346749693379, 20.7236553883135], [-77.202603387926, 20.7531679588569], [-77.2024198562843, 20.7298681619041], [-77.203973049682, 20.7127830345299], [-77.2101858232726, 20.6863787467698], [-77.2226113704538, 20.6661872326003], [-77.2428028846233, 20.6553148788168], [-77.2536752384068, 20.6397829448403], [-77.2692071723834, 20.6382297514426], [-77.3095902007223, 20.6739531995886], [-77.4509307999086, 20.6692936193956], [-77.4695691206805, 20.6661872326003], [-77.5037393754288, 20.6646340392027], [-77.5534415641537, 20.6801659731792], [-77.5845054321067, 20.6879319401675], [-77.6155693000597, 20.6755063929863], [-77.6839098095564, 20.6801659731792], [-77.7211864511001, 20.6801659731792], [-77.7460375454625, 20.6817191665769], [-77.7724418332226, 20.6910383269628], [-77.8112716681639, 20.6941447137581], [-77.8236972153451, 20.7050170675416], [-77.8345695691287, 20.7096766477346], [-77.7786546068132, 20.8789747280787]];
            var arrLaHabana = [[-82.5301207599152, 23.0634494915838], [-82.5293441383345, 23.0723806397624], [-82.5196363685751, 23.0805351663604], [-82.4893481269256, 23.0964559087658], [-82.413627522802, 23.138781784917], [-82.3911054969602, 23.1492661762572], [-82.3763496869258, 23.1469363115149], [-82.3573224581973, 23.1566440812743], [-82.3231511086441, 23.1698466481472], [-82.3010173935926, 23.1729531344702], [-82.2361694915996, 23.1822725934392], [-82.2132591549673, 23.18304921502], [-82.1441398342801, 23.1745063776317], [-82.0994840933867, 23.1764479315836], [-82.0979308502252, 23.1671284726145], [-82.1107451063077, 23.1620804323396], [-82.1169580789537, 23.1597505675973], [-82.1173463897441, 23.1550908381128], [-82.1076386199847, 23.1558674596936], [-82.0936594315311, 23.1504311086283], [-82.0913295667888, 23.1430532036111], [-82.0901646344177, 23.1364519201747], [-82.0901646344177, 23.1290740151575], [-82.0905529452081, 23.1216961101404], [-82.095600985483, 23.1108234080098], [-82.1014256473386, 23.10072732746], [-82.1185113221152, 23.1026688814119], [-82.1251126055516, 23.1034455029926], [-82.1313255781977, 23.0941260440236], [-82.1387034832149, 23.0890780037487], [-82.1453047666513, 23.0851948958449], [-82.1596722658952, 23.086359828216], [-82.1682151032835, 23.086359828216], [-82.169768346445, 23.0817000987315], [-82.1686034140739, 23.0766520584566], [-82.1771462514622, 23.0677209102779], [-82.1728748327681, 23.0607313160511], [-82.1880189535928, 23.0568482081473], [-82.1973384125618, 23.0572365189377], [-82.207822803902, 23.0591780728896], [-82.2136474657577, 23.0630611807934], [-82.2218019923556, 23.0607313160511], [-82.222190303146, 23.0502469247109], [-82.225296789469, 23.0366560470477], [-82.2249084786786, 23.0281132096594], [-82.2249084786786, 23.0195703722711], [-82.2218019923556, 23.015298953577], [-82.2117059118058, 23.0086976701405], [-82.2117059118058, 22.9962717248485], [-82.219083816823, 22.9931652385254], [-82.2287915865824, 22.9857873335083], [-82.2353928700188, 22.9799626716526], [-82.2466538829398, 22.9764678745392], [-82.2555850311184, 22.9729730774258], [-82.2555850311184, 22.965983483199], [-82.2555850311184, 22.9593821997626], [-82.2746122598469, 22.9551107810685], [-82.2866498943486, 22.9543341594877], [-82.2940277993658, 22.9578289566011], [-82.3033472583349, 22.9613237537145], [-82.3095602309809, 22.9655951724087], [-82.3153848928366, 22.9655951724087], [-82.3318416956337, 22.9593605848065], [-82.342566648163, 22.9582172673915], [-82.3616522988945, 22.9644594391888], [-82.3720782682317, 22.9640419292471], [-82.3674185387471, 22.9547224702781], [-82.3666419171664, 22.9473445652609], [-82.3670302279567, 22.9419082141956], [-82.3736315113932, 22.9407432818245], [-82.3845042135237, 22.9395783494534], [-82.4015898883003, 22.9376367955015], [-82.4097444148983, 22.9430731465668], [-82.4159573875443, 22.9465679436802], [-82.4268300896749, 22.9469562544705], [-82.4369261702247, 22.9465679436802], [-82.4450806968226, 22.9473445652609], [-82.4462456291937, 22.9527809163262], [-82.4443040752418, 22.9702549018932], [-82.4446923860322, 22.9842340903468], [-82.4551767773724, 22.9815159148141], [-82.4602248176473, 22.9791860500719], [-82.4648845471318, 22.9799626716526], [-82.4761455600528, 22.97724449612], [-82.4811936003277, 22.9749146313777], [-82.4874065729737, 22.974138009797], [-82.4975026535236, 22.9939418601062], [-82.5091519772349, 23.0207353046422], [-82.5060454909118, 23.0238417909653], [-82.4982792751043, 23.0285015204498], [-82.4874065729737, 23.0323846283536], [-82.4827468434892, 23.0354911146766], [-82.4881831945545, 23.0432573304841], [-82.4924546132486, 23.0502469247109], [-82.4920663024583, 23.0572365189377], [-82.4916779916679, 23.0673325994875], [-82.4967260319428, 23.0708273966009], [-82.5110935311868, 23.068885842649], [-82.513423395929, 23.0650027347453], [-82.5196363685751, 23.0630611807934], [-82.5289558275441, 23.0618962484222], [-82.5312856922864, 23.0634494915838], [-82.5301207599152, 23.0634494915838]];
            var arrArtemisa = [[-83.3780626827425, 22.8983401651828], [-83.4060210596497, 22.8408701682069], [-83.4060210596497, 22.7958261165231], [-83.4044678164882, 22.767867739616], [-83.3842756553886, 22.7569950374854], [-83.3982548438421, 22.7088444994786], [-83.3547640353199, 22.7135042289631], [-83.3407848468663, 22.685545852056], [-83.3190394426052, 22.6575874751488], [-83.2491435003372, 22.6762263930869], [-83.2305045823991, 22.6544809888258], [-83.208759178138, 22.6373953140492], [-83.0813932388942, 22.4743047820907], [-82.964900001781, 22.5193488337744], [-82.9431545975199, 22.5379877517125], [-82.8732586552519, 22.5674993717812], [-82.80957568563, 22.5970109918499], [-82.7754043360768, 22.6296290982416], [-82.7598719044617, 22.6808861225714], [-82.7319135275546, 22.701078283671], [-82.6791032600632, 22.685545852056], [-82.5796956977266, 22.6762263930869], [-82.5486308344964, 22.6622472046333], [-82.4600959742904, 22.6762263930869], [-82.4150519226066, 22.6777796362484], [-82.39796624783, 22.7414626058703], [-82.4197116520912, 22.7507820648394], [-82.4383505700293, 22.7632080101314], [-82.4367973268678, 22.7911663870386], [-82.4523297584828, 22.8066988186537], [-82.4414570563523, 22.8688285451141], [-82.4228181384142, 22.9076596241518], [-82.4212648952527, 22.932511514736], [-82.4321375973832, 22.9495971895126], [-82.4352440837063, 22.9744490800967], [-82.4352440837063, 22.9946412411963], [-82.4523297584828, 22.9977477275194], [-82.477181649067, 22.9868750253888], [-82.4911608375206, 23.0024074570039], [-82.4896075943591, 23.0194931317805], [-82.4678621900979, 23.0303658339111], [-82.483394621713, 23.0723033992718], [-82.4989270533281, 23.0800696150794], [-82.5144594849432, 23.0738566424333], [-82.5439711050119, 23.0707501561103], [-82.5812489408881, 23.0645371834643], [-82.6278462357334, 23.0490047518492], [-82.7024019074859, 23.0427917792031], [-82.7334667707161, 23.0303658339111], [-82.7598719044617, 23.0319190770726], [-82.8235548740836, 23.0319190770726], [-82.8841313573825, 23.0288125907496], [-82.9416013543584, 23.0225996181035], [-82.97421946075, 23.0225996181035], [-83.0425621598565, 23.0163866454575], [-83.0860529683787, 23.0101736728114], [-83.1217775610935, 23.0055139433269], [-83.1497359380006, 22.9961944843579], [-83.1683748559387, 22.9930879980348], [-83.1963332328459, 22.9993009706809], [-83.2165253939455, 23.0039607001654], [-83.2475902571757, 22.9993009706809], [-83.2677824182753, 22.9853217822273], [-83.3050602541516, 22.9651296211277], [-83.3345718742203, 22.9511504326741], [-83.3625302511274, 22.9247452989284], [-83.3718497100965, 22.9029998946673], [-83.3780626827425, 22.8983401651828]];
            var arrMayabeque = [[-81.7101665130454, 23.1625267124459], [-81.7987013732514, 23.1547604966383], [-81.8685973155193, 23.1578669829613], [-81.9322802851412, 23.1640799556074], [-81.9788775799865, 23.1796123872225], [-82.0052827137322, 23.1951448188376], [-82.0720721696771, 23.1920383325146], [-82.1000305465842, 23.18737860303], [-82.1109032487148, 23.1702929282534], [-82.1015837897457, 23.1376748218617], [-82.1031370329073, 23.1143761744391], [-82.1204708056669, 23.0800945933499], [-82.2042728437079, 23.0817580680474], [-82.2413756742816, 23.0786515817244], [-82.2398224311201, 23.0273945573946], [-82.3081651302265, 22.9963296941644], [-82.3423364797797, 22.9776907762262], [-82.3718480998484, 22.9776907762262], [-82.4184453946937, 22.9683713172572], [-82.4417440421163, 22.9606051014496], [-82.4448505284393, 22.9279869950579], [-82.4603829600544, 22.8938156455047], [-82.474362148508, 22.8720702412436], [-82.4867880938001, 22.848771593821], [-82.4697024190235, 22.8146002442678], [-82.4697024190235, 22.7835353810376], [-82.4665959327005, 22.7493640314844], [-82.4339778263088, 22.7307251135462], [-82.4231051241782, 22.6981070071545], [-82.4262116105012, 22.6794680892164], [-82.0441137927699, 22.6546161986323], [-81.9850905526325, 22.6561694417938], [-81.8701505586808, 22.6639356576013], [-81.7225924583374, 22.6126786332715], [-81.6589094887155, 22.5583151226187], [-81.5921200327706, 22.6421902533402], [-81.5843538169631, 22.6701486302474], [-81.5703746285095, 22.696553763993], [-81.5921200327706, 22.7167459250927], [-81.6247381391623, 22.7276186272232], [-81.6293978686469, 22.7804288947145], [-81.6402705707774, 22.8021742989757], [-81.6651224613616, 22.8347924053674], [-81.6837613792997, 22.85809105279], [-81.6651224613616, 22.9202207792504], [-81.6837613792997, 22.9450726698345], [-81.7039535403993, 22.9637115877727], [-81.7086132698838, 22.9870102351953], [-81.6930808382688, 23.0118621257795], [-81.6558030023925, 23.0708853659168], [-81.6620159750386, 23.092630770178], [-81.6697821908461, 23.1190359039236], [-81.6666757045231, 23.1454410376693], [-81.6682289476846, 23.1532072534768], [-81.7101665130454, 23.1625267124459]];
            var arrMtz = [[-81.6889037619545, 23.1567914884517], [-81.7168621388616, 23.1039812209604], [-81.7386075431228, 23.0480644671461], [-81.772778892676, 23.0014671723008], [-81.7168621388616, 22.9175920415793], [-81.7106491662156, 22.7865896703781], [-81.6826907893084, 22.7591612391053], [-81.6702648440164, 22.703244485291], [-81.6423064671092, 22.6877120536759], [-81.6547324124013, 22.6069434092774], [-81.6733713303394, 22.5603461144321], [-81.6951167346005, 22.5106423332638], [-81.9622745583801, 22.4671515247415], [-82.0461496891017, 22.4516190931264], [-82.1455572514383, 22.4516190931264], [-82.1673026556994, 22.4329801751883], [-82.1331313061462, 22.3211466675596], [-82.0585756343937, 22.2931882906525], [-81.9653810447032, 22.2621234274223], [-81.8815059139817, 22.224845591546], [-81.8504410507515, 22.1751418103777], [-81.769672406353, 22.1596093787626], [-81.7044361935696, 22.1658223514087], [-81.5232427566634, 22.1658223514087], [-81.4279589108209, 22.1627158650857], [-81.4155329655288, 22.1099055975943], [-81.2971749644393, 22.0757342480411], [-81.1670140596873, 22.146838921407], [-81.1390556827801, 22.0881601933332], [-81.0645000110277, 22.0695212753951], [-81.0272221751514, 22.057095330103], [-80.6047400352208, 22.0353499258419], [-80.5581427403756, 22.0353499258419], [-80.5829946309597, 22.0788407343641], [-80.5954205762518, 22.1316510018555], [-80.7103605702035, 22.1533964061166], [-80.7600643513718, 22.1565028924396], [-80.8190875915092, 22.1875677556698], [-80.8408329957703, 22.2279520778691], [-80.8718978590005, 22.2372715368381], [-80.8812173179695, 22.2931882906525], [-80.8843238042925, 22.4081282846042], [-80.8625784000314, 22.4454061204804], [-80.7445319197567, 22.4578320657725], [-80.6699762480042, 22.4578320657725], [-80.5113717674619, 22.5297559270143], [-80.4866935549461, 22.5665590870781], [-80.5115454455303, 22.6100498956004], [-80.5457167950835, 22.6659666494147], [-80.5363973361144, 22.709457457937], [-80.5270778771454, 22.7591612391053], [-80.5426103087605, 22.8088650202736], [-80.5643557130216, 22.8368233971808], [-80.5861011172827, 22.867888260411], [-80.6824021932963, 22.8399298835038], [-80.7258930018186, 22.8554623151189], [-80.7041475975575, 22.8958466373181], [-80.6979346249114, 22.9331244731944], [-80.7072540838805, 22.9610828501015], [-80.5887206982787, 22.9672958227476], [-80.5892076036057, 23.0232125765619], [-80.5954205762518, 23.0698098714072], [-80.5985270625748, 23.0946617619914], [-80.6575503027122, 23.1101941936065], [-80.7352124607876, 23.1101941936065], [-80.7849162419559, 23.1257266252215], [-80.8190875915092, 23.0977682483144], [-80.9091756948767, 23.0946617619914], [-80.9433470444299, 23.0760228440532], [-80.961985962368, 23.0946617619914], [-80.9806248803061, 23.1195136525755], [-81.0738194699967, 23.1195136525755], [-81.123523251165, 23.0946617619914], [-81.1763335186563, 23.0915552756683], [-81.2011854092405, 23.1070877072834], [-81.2539956767318, 23.1412590568366], [-81.3130189168692, 23.1661109474208], [-81.3502967527454, 23.1692174337438], [-81.4031070202367, 23.1443655431597], [-81.4869821509582, 23.1381525705136], [-81.5149405278654, 23.1319395978676], [-81.5559537694454, 23.1661109474208], [-81.6329870081401, 23.1723239200668], [-81.6671583576933, 23.1754304063899], [-81.6889037619545, 23.1567914884517]];
            this._polygonIsla = this.addPolygon(arrIsla, 'Isla de La Juventud', { idLayer: 'cuba', id: 'IslaJuventud' });
            this._contIsla = 0;
            this._polygonHabana = this.addPolygon(arrLaHabana, 'La Habana', { idLayer: "cuba", id: 'LaHabana' });
            this._contHabana = 0;
            this._polygonStgo = this.addPolygon(arrStgo, 'Santiago de Cuba', { idLayer: "cuba", id: 'StgoCuba' });
            this._contStgo = 0;
            this._polygonGranma = this.addPolygon(arrGranma, 'Granma', { idLayer: "cuba", id: 'Granma' });
            this._contGranma = 0;
            this._polygonPR = this.addPolygon(arrPinarRio, 'Pinar del Río', { idLayer: "cuba", id: 'PinarRio' });
            this._contPR = 0;
            this._polygonCA = this.addPolygon(arrCiegoAvila, 'Ciego de Avila', { idLayer: "cuba", id: 'CiegoAvila' });
            this._contCA = 0;
            this._polygonCienf = this.addPolygon(arrCienfuegos, 'Cienfuegos', { idLayer: "cuba", id: 'Cienfuegos' });
            this._contCienf = 0;
            this._polygonCama = this.addPolygon(arrCamaguey, 'Camaguey', { idLayer: "cuba", id: 'Camaguey' });
            this._contCama = 0;
            this._polygonGtmo = this.addPolygon(arrGtmo, 'Guantanamo', { idLayer: "cuba", id: 'Guantanamo' });
            this._contGtmo = 0;
            this._polygonVC = this.addPolygon(arrVC, 'Villa Clara', { idLayer: "cuba", id: 'VillaClara' });
            this._contVC = 0;
            this._polygonHolguin = this.addPolygon(arrHolguin, 'Holguin', { idLayer: "cuba", id: 'Holguin' });
            this._contHolguin = 0;
            this._polygonMtz = this.addPolygon(arrMtz, 'Matanzas', { idLayer: "cuba", id: 'Matanzas' });
            this._contMtz = 0;
            this._polygonSS = this.addPolygon(arrSS, 'Sancti Spiritus', { idLayer: "cuba", id: 'SanctiSpiritus' });
            this._contSS = 0;
            this._polygonLT = this.addPolygon(arrLasTunas, 'Las Tunas', { idLayer: "cuba", id: 'LasTunas' });
            this._contLT = 0;
            this._polygonArte = this.addPolygon(arrArtemisa, 'Artemisa', { idLayer: "cuba", id: 'Artemisa' });
            this._contArte = 0;
            this._polygonMay = this.addPolygon(arrMayabeque, 'Mayabeque', { idLayer: "cuba", id: 'Mayabeque' });
            this._contMay = 0;
            this.showLayer('cuba');
            var layer = this.getGraphicLayerById('cuba');
            layer.attributes.isVolumenLayer = true;
            var graphics = this.getGraphics();           
            for (var i = 0; i < graphics.length; i++) {
                if (graphics[i].values_.attributes.isPoint) {
                    this._auxContGraphicContainer(graphics[i]);
                }
            }
            this._setColorAndShowTooltipVolumeProvinceLayer();
            this._volumenProvinceLayerVisible = true;
        }   
    };
    this.deleteVolumeProvinceLayer = function () {
        var layer = this.getGraphicLayerById('cuba');
        if (layer) {
            _context._layerVolumenProvinceCt.toggleClass('div-selected');
            this.deleteLayer(layer.attributes.id);
            $.each(this._layerBaseVisibleAux, function (i, o) {
                _context.showLayer(o);
            });
            $.each(this._layerGraphicVisibleAux, function (i, o) {
                _context.showLayer(o);
            });
            this.centerAt(this._ZoomCenterAux.center[0], this._ZoomCenterAux.center[1], 'fly', this._ZoomCenterAux.zoom);
            this._volumenProvinceLayerVisible = false;
            if (_context._treeVisble) {
                this.deleteTree();
                this.showTree();
            }
        }

    };
    this._auxContGraphicContainer = function (graphic) {        
        if (this._polygonIsla.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contIsla++;
        }
        if (this._polygonCama.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contCama++;
        }
        if (this._polygonMay.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contMay++;
        }
        if (this._polygonArte.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contArte++;
        }
        if (this._polygonLT.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contLT++;
        }
        if (this._polygonSS.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contSS++;
        }
        if (this._polygonVC.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contVC++;
        }
        if (this._polygonMtz.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contMtz++;
        }
        if (this._polygonHolguin.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contHolguin++;
        }
        if (this._polygonGtmo.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contGtmo++;
        }
        if (this._polygonStgo.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contStgo++;
        }
        if (this._polygonHabana.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contHabana++;
        }
        if (this._polygonGranma.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contGranma++;
        }
        if (this._polygonPR.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contPR++;
        }
        if (this._polygonCA.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contCA++;
        }
        if (this._polygonCienf.values_.geometry.containsCoordinate(graphic.values_.geometry.flatCoordinates)) {
            this._contCienf++;
        }
        
    };
    this._setColorAndShowTooltipVolumeProvinceLayer = function () {
        var content  = this._polygonHabana.values_.content.split('-');
        if (content.length>1) {
            content[1] = this._contHabana;
            this._polygonHabana.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonHabana.values_.content = content + ' - ' + this._contHabana;
        }
        var content = this._polygonIsla.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contIsla;
            this._polygonIsla.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonIsla.values_.content = content + ' - ' + this._contIsla;
        }
        var content = this._polygonStgo.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contStgo;
            this._polygonStgo.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonStgo.values_.content = content + ' - ' + this._contStgo;
        }
        var content = this._polygonGranma.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contGranma;
            this._polygonGranma.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonGranma.values_.content = content + ' - ' + this._contGranma;
        }
        var content = this._polygonPR.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contPR;
            this._polygonPR.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonPR.values_.content = content + ' - ' + this._contPR;
        }
        var content = this._polygonCA.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contCA;
            this._polygonCA.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonCA.values_.content = content + ' - ' + this._contCA;
        }
        var content = this._polygonCienf.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contCienf;
            this._polygonCienf.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonCienf.values_.content = content + ' - ' + this._contCienf;
        }
        var content = this._polygonCama.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contCama;
            this._polygonCama.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonCama.values_.content = content + ' - ' + this._contCama;
        }
        var content = this._polygonGtmo.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contGtmo;
            this._polygonGtmo.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonGtmo.values_.content = content + ' - ' + this._contGtmo;
        }
        var content = this._polygonVC.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contVC;
            this._polygonVC.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonVC.values_.content = content + ' - ' + this._contVC;
        }
        var content = this._polygonHolguin.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contHolguin;
            this._polygonHolguin.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonHolguin.values_.content = content + ' - ' + this._contHolguin;
        }
        var content = this._polygonMtz.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contMtz;
            this._polygonMtz.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonMtz.values_.content = content + ' - ' + this._contMtz;
        }
        var content = this._polygonSS.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contSS;
            this._polygonSS.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonSS.values_.content = content + ' - ' + this._contSS;
        }
        var content = this._polygonLT.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contLT;
            this._polygonLT.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonLT.values_.content = content + ' - ' + this._contLT;
        }
        var content = this._polygonArte.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contArte;
            this._polygonArte.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonArte.values_.content = content + ' - ' + this._contArte;
        }
        var content = this._polygonMay.values_.content.split('-');
        if (content.length > 1) {
            content[1] = this._contMay;
            this._polygonMay.values_.content = content[0] + ' - ' + content[1];
        }
        else {
            this._polygonMay.values_.content = content + ' - ' + this._contMay;
        }
        this._objProv = [
              { 'provincia': this._polygonHabana, 'cant': this._contHabana },
              { 'provincia': this._polygonIsla, 'cant': this._contIsla },
              { 'provincia': this._polygonStgo, 'cant': this._contStgo },
              { 'provincia': this._polygonGranma, 'cant': this._contGranma },
              { 'provincia': this._polygonPR, 'cant': this._contPR },
              { 'provincia': this._polygonCA, 'cant': this._contCA },
              { 'provincia': this._polygonCienf, 'cant': this._contCienf },
              { 'provincia': this._polygonCama, 'cant': this._contCama },
              { 'provincia': this._polygonGtmo, 'cant': this._contGtmo },
              { 'provincia': this._polygonVC, 'cant': this._contVC },
              { 'provincia': this._polygonHolguin, 'cant': this._contHolguin },
              { 'provincia': this._polygonMtz, 'cant': this._contMtz },
              { 'provincia': this._polygonSS, 'cant': this._contSS },
              { 'provincia': this._polygonLT, 'cant': this._contLT },
              { 'provincia': this._polygonArte, 'cant': this._contArte },
              { 'provincia': this._polygonMay, 'cant': this._contMay },
        ];
        function compare(a, b) {
            if (a.cant < b.cant)
                return 1;
            if (a.cant > b.cant)
                return -1;
            return 0;
        }
        this._objProv.sort(compare);
        var total = this._objProv[0].cant;
        $.each(this._objProv, function (i, o) {
            var aux = o.cant * 100 / total;
            var a = 255 - (2.5 * aux);
            o.provincia.values_.attributes.fillColor = 'rgb(255, ' + Math.ceil(a) + ', 0)';
            o.provincia.getStyle().getFill().color_ = 'rgb(255, ' + Math.ceil(a) + ', 0)';
            var iconStyle = o.provincia.getStyle();
            o.provincia.setStyle(iconStyle);
        });
    };

    ////////////////////////////////Graphic///////////////////////////////////////////////
    this.addPoint = function (x, y, html, img, label, attributes) {
        x = x * 1;
        y = y * 1;
        var attr = { descripcion: '', id: 'graphic' + graphicId++, idLayer: 'Capa_Dinamica', x: x, y: y, isPoint: true, template: _.noop, visible: true };       
        $.extend(attr, attributes);
        if (!attr.name) {
            attr.name = attr.id;
        }
        var attrLayer = this.getGraphicLayerById(attr.idLayer).attributes.defaults;
        _.defaults(attr, attrLayer);
        label = label ? label : '';
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point([x, y]),
            attributes: attr,
            content: html ? html : attr.template(attr)
        });
        iconFeature.setId(attr.id);
        if (img) {
            var image = img;
        }
        else {           
            var layer = this.getGraphicLayerById(attr.idLayer);
            if (layer && layer.attributes.icom) {
                var image = layer.attributes.icom;
            }
            else {
                var image = '/Content/images/Osiris/Map/marker.png';
            }
        }
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({               
                src: image,
                anchor: attr.offset,                
            }),
            text: new ol.style.Text({
                font: '12px Calibri,sans-serif',
                text: label,
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 3
                }),
                textAlign: 'left',
                offsetX: 7
            })
        });
        iconFeature.setStyle(iconStyle);       
     
        attr.icom = image;
        var layer = this.getGraphicLayerById(attr.idLayer);
        if (!layer) {
            layer = this.addGraphicLayer(attr.idLayer);
            layer.getSource().addFeature(iconFeature);
        }
        else {
            if (layer.attributes.isClusterLayer) {
                layer.attributes.features.push(iconFeature);
                console.log(layer);
                layer.getSource().source_.addFeature(iconFeature);
            }
            if (layer.attributes.isGraphicLayer) {
                layer.getSource().addFeature(iconFeature);
                this._zTree.addNodes(this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id), { id: attr.id, name: attr.name, isPoint: true, icon: attr.icom, checked: true });
            }
            if (layer.attributes.isHeatLayer) {
                layer.attributes.features.push(iconFeature);
                var iconFeature1 = new ol.Feature({
                    geometry: iconFeature.values_.geometry
                });
                layer.source_.addFeature(iconFeature1);
            }          
                       
        }
        
        if (layer.attributes.isVolumenLayer) {
            _context._layerGraphicVisibleAux.push(attr.idLayer);
            this.hideGraphic(iconFeature.id_);
            this._auxContGraphicContainer(iconFeature);
            this._setColorAndShowTooltipVolumeProvinceLayer();
        }
        if (!layer.attributes.visible) {
            this.hideGraphic(attr.id);
        }
    };
    this.addPolygon = function (arr, html, attributes) {
        var attr = { descripcion: '', id: 'graphic' + graphicId++, idLayer: 'Capa_Dinamica', isPolygon: true, isGraphic: true, template: _.noop, visible: true };       
        $.extend(attr, attributes);
        if (!attr.name) {
            attr.name = attr.id;
        }
        var arrCoordinates = new Array();
        for (var i = 0; i < arr.length; i++) {
            var a = arr[i];
            arrCoordinates.push(a);
        }
        var polygon = new ol.Feature({
            geometry: new ol.geom.Polygon([arrCoordinates]),
            attributes: attr,
            content: html ? html : attr.template(attr)
        });
        polygon.setId(attr.id);
        var iconStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0)'
            }),
            stroke: new ol.style.Stroke({
                width: 0
            })
        });
        polygon.setStyle(iconStyle);
        var layer = this.getGraphicLayerById(attr.idLayer);
        if (!layer) {
            layer = this.addGraphicLayer(attr.idLayer);
            layer.attributes.convert = false;
            layer.getSource().addFeature(polygon);
        }
        else {
            var attrLayer = layer.attributes.defaults;
            _.defaults(polygon.attributes, attrLayer);
            layer.getSource().addFeature(polygon);
            layer.attributes.convert = false;
        }
        this._zTree.addNodes(this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id), { id: attr.id, name: attr.name, isGraphic: true, "icon": attr.icon, checked: true });
        if (!layer.attributes.visible) {
            this.hideGraphic(attr.id);
        }
        return polygon;
    };
    this.addCircle = function (x, y, r, html, attributes) {
        r = r * 1;
        var attr = { descripcion: '', id: 'graphic' + graphicId++, idLayer: 'Capa_Dinamica', isCircle: true, isGraphic: true, template: _.noop, visible: true };       
        var aux = r / 102.258;
        if (2000 < r && r < 10000) {
            aux = r/ 102.2;
        }
        $.extend(attr, attributes);
        if (!attr.name) {
            attr.name = attr.id;
        }
        var circle = new ol.Feature({
            geometry: new ol.geom.Circle([x, y], aux),
            attributes: attr,
            content: html ? html : attr.template(attr)
        });
        circle.setId(attr.id);
        var iconStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.4)'
            }),
            stroke: new ol.style.Stroke({
                width: 0
            })
        });
        circle.setStyle(iconStyle);
        var layer = this.getGraphicLayerById(attr.idLayer);
        if (!layer) {
            layer = this.addGraphicLayer(attr.idLayer);
            layer.attributes.convert = false;
            layer.getSource().addFeature(circle);
        }
        else {
            var attrLayer = layer.attributes.defaults;
            _.defaults(circle.attributes, attrLayer);
            layer.getSource().addFeature(circle);
            layer.attributes.convert = false;           
        }
        this._zTree.addNodes(this._zTree.getNodeByParam('id', 'layer' + layer.attributes.id), { id: attr.id, name: attr.name, isGraphic: true, "icon": attr.icon, checked: true });
        if (!layer.attributes.visible) {
            this.hideGraphic(attr.id);
        }
        return circle;

    };
    this.movePoint = function (id, x, y) {
        var point = this.getGraphicById(id);
        if (point) {
            point.values_.geometry.setCoordinates([x, y]);
        }
    };
    this.getGraphics = function () {
        var layers = this.getGraphicLayers();       
        var graphics = [];
        $.each(layers, function (i, o) {
            if (o.attributes.isClusterLayer || o.attributes.isHeatLayer) {
                var features = o.attributes.allFeatures;
            }
            else {
                var features = o.getSource().getFeatures();
            }           
            graphics = graphics.concat(features);            
        });
        return graphics;
    };
    this.getGraphicById = function (id) {
        var graphics = this.getGraphics();
        var dev;
        var existe = false;
        for (var i = 0; i < graphics.length; i++) {
            if (graphics[i].getId() == id) {
                return graphics[i];
            }
        }
        if (!existe) {
            console.log('El grafico no existe');
        }
    };
    this.deleteGraphic = function (id) {
        var graphic = this.getGraphicById(id);
        if (graphic) {
            var layer = this.getGraphicLayerById(graphic.values_.attributes.idLayer);
            layer.getSource().removeFeature(graphic);
            this._zTree.removeNode(this._zTree.getNodeByParam('id', id));
        }
    };
    this.hideGraphic = function (id) {
        var graphic = this.getGraphicById(id);
        if (graphic) {
            if (graphic.values_.attributes.isGraphic) {
                graphic.values_.attributes.visible = false;
                graphic.getStyle().getFill().color_ = null;
                var iconStyle = graphic.getStyle();
                graphic.setStyle(iconStyle);
                if (this._zTree.getNodeByParam('id', id)) {
                    this._zTree.checkNode(this._zTree.getNodeByParam('id', id), false, true);
                }
            }
            else {
                graphic.values_.attributes.visible = false;
                graphic.getStyle().getImage().opacity_ = 0;
                var iconStyle = graphic.getStyle();
                graphic.setStyle(iconStyle);
                if (this._zTree.getNodeByParam('id', id)) {
                    this._zTree.checkNode(this._zTree.getNodeByParam('id', id), false);
                }
            }
        }
    };
    this.showGraphic = function (id) {
        var graphic = this.getGraphicById(id);
        if (graphic && graphic.getStyle()) {
            if (graphic.values_.attributes && graphic.values_.attributes.isGraphic) {
                graphic.values_.attributes.visible = true;
                graphic.getStyle().getFill().color_ = graphic.values_.attributes.fillColor;
                var iconStyle = graphic.getStyle();
                graphic.setStyle(iconStyle);
                this._zTree.checkNode(this._zTree.getNodeByParam('id', id), true,true);
                var parent = _context.getGraphicLayerById(graphic.values_.attributes.idLayer);
                parent.setVisible(true);
                $("#" + graphic.values_.attributes.idLayer + '.layer-graphic-ct').removeClass('layer-hidden');
            }
            else {
                if (!graphic.getStyle().getImage().opacity_ == 1) {
                    graphic.values_.attributes.visible = true;
                    graphic.getStyle().getImage().opacity_ = 1;
                    var iconStyle = graphic.getStyle();
                    graphic.setStyle(iconStyle);
                }
                this._zTree.checkNode(this._zTree.getNodeByParam('id', id), true);

                var parent = _context.getGraphicLayerById(graphic.values_.attributes.idLayer);
                parent.setVisible(true);
                $("#" + graphic.values_.attributes.idLayer + '.layer-graphic-ct').removeClass('layer-hidden');
            }
        }
    };
    this.getGraphicsByLayer = function (idLayer) {
        this._allGraphicAux = [];
        var layer = this.getGraphicLayerById(idLayer);
        if (layer) {
            this._getGraphicsByLayerRecursivo(layer);
        }
        return this._allGraphicAux;
    };
    this._getGraphicsByLayerRecursivo = function (layer) {
        if (layer == null) {
            return;
        }
        else {
            if (layer.attributes.isGraphicLayer) {
                this._allGraphicAux = this._allGraphicAux.concat(layer.getSource().getFeatures());
            }
            else {
                this._allGraphicAux = this._allGraphicAux.concat(layer.attributes.features);               
            }            
            $.each(layer.attributes.children, function (i, o) {
                _context._getGraphicsByLayerRecursivo(o);
            });
        }             
    };    
   
    ////////////////////////////////Draw///////////////////////////////////////////////
    this.activateToolPoint = function (callback) {
        callback = callback || _.noop;
        if (this._toolbarsActivate) {
            _context._myMap.removeInteraction(draw);
        }
        this._toolbarsActivate = true;
        draw = new ol.interaction.Draw({
            type: 'Point'
        });
        this._myMap.addInteraction(draw);
        draw.on('drawend', function (evt) {
            _context._myMap.removeInteraction(draw);
            _context._toolbarsActivate = false;
            _context.addPoint(evt.feature.values_.geometry.flatCoordinates[0], evt.feature.values_.geometry.flatCoordinates[1]);
            if (_context._onAddPoint) _context._onAddPoint(evt.feature.values_.geometry.flatCoordinates[0], evt.feature.values_.geometry.flatCoordinates[1], evt.feature);
            callback(evt.feature);
        });
    };
    this.activateToolLine = function (html, attributes, callback) {
        callback = callback || _.noop;
        if (this._toolbarsActivate) {
            _context._myMap.removeInteraction(draw);
        }
        this._toolbarsActivate = true;
        draw = new ol.interaction.Draw({
            type: 'LineString'
        });
        this._myMap.addInteraction(draw);
        draw.on('drawend', function (evt) {
            _context._myMap.removeInteraction(draw);
            this._toolbarsActivate = false;
            var attr = { descripcion: '', id: 'graphic' + graphicId++, idLayer: 'Capa_Dinamica', isGraphic: true, isLine: true, template: _.noop, visible: true };           
            $.extend(attr, attributes);
            if (!attr.name) {
                attr.name = attr.id;
            }
            var layer = _context.getGraphicLayerById(attr.idLayer);
            if (!layer) {
                layer = _context.addGraphicLayer(attr.idLayer);
                layer.attributes.convert = false;
                evt.feature.setId(attr.id);
                evt.feature.values_.attributes = attr;
                evt.feature.values_.content = html ? html : attr.template(attr);
                var iconStyle = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0)'
                    }),
                    stroke: new ol.style.Stroke({
                        width: 2
                    })
                });
                evt.feature.setStyle(iconStyle);
                layer.getSource().addFeature(evt.feature);
            }
            else {
                var attrLayer = layer.attributes.defaults;
                _.defaults(attr, attrLayer);
                evt.feature.setId(attr.id);
                evt.feature.values_.attributes = attr;
                evt.feature.values_.content = html ? html : attr.template(attr);
                var iconStyle = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0)'
                    }),
                    stroke: new ol.style.Stroke({
                        width: 0
                    })
                });
                evt.feature.setStyle(iconStyle);
                layer.getSource().addFeature(evt.feature);
                layer.attributes.convert = false;
            }
            _context._zTree.addNodes(_context._zTree.getNodeByParam('id', 'layer' + layer.attributes.id), { id: attr.id, name: attr.name, isGraphic: true, "icon": attr.icon, checked: true });
            if (!layer.attributes.visible) {
                this.hideGraphic(attr.id);
            }
            var coordinates = evt.feature.values_.geometry.getCoordinates();           
            var suma1 = _context.distanceTwoPoints(coordinates[0][1], coordinates[0][0], coordinates[1][1], coordinates[1][0]);           
            if (_context._onAddLyne) _context._onAddLyne(evt.feature);
            callback(evt.feature);
        });
    };
    this.activateToolPolygon = function (html, attributes, callback) {        
        callback = callback || _.noop;
        if (this._toolbarsActivate) {
            _context._myMap.removeInteraction(draw);
        }
        this._toolbarsActivate = true;
        draw = new ol.interaction.Draw({
            type: 'Polygon'
        });
        this._myMap.addInteraction(draw);
        draw.on('drawend', function (evt) {
            _context._myMap.removeInteraction(draw);
            this._toolbarsActivate = false;
            var attr = { descripcion: '', id: 'graphic' + graphicId++, idLayer: 'Capa_Dinamica', isPolygon: true, isGraphic: true, template: _.noop, visible: true };           
            $.extend(attr, attributes);
            if (!attr.name) {
                attr.name = attr.id;
            }
            var layer = _context.getGraphicLayerById(attr.idLayer);
            if (!layer) {
                layer = _context.addGraphicLayer(attr.idLayer);
                layer.attributes.convert = false;
                evt.feature.setId(attr.id);
                evt.feature.values_.attributes = attr;
                evt.feature.values_.content = html ? html : attr.template(attr);
                var iconStyle = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0)'
                    }),
                    stroke: new ol.style.Stroke({
                        width: 0
                    })
                });
                evt.feature.setStyle(iconStyle);
                layer.getSource().addFeature(evt.feature);
            }
            else {
                var attrLayer = layer.attributes.defaults;
                _.defaults(attr, attrLayer);
                evt.feature.setId(attr.id);
                evt.feature.values_.attributes = attr;
                evt.feature.values_.content = html ? html : attr.template(attr);
                var iconStyle = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0)'
                    }),
                    stroke: new ol.style.Stroke({
                        width: 0
                    })
                });
                evt.feature.setStyle(iconStyle);
                layer.getSource().addFeature(evt.feature);
                layer.attributes.convert = false;
            }
            _context._zTree.addNodes(_context._zTree.getNodeByParam('id', 'layer' + layer.attributes.id), { id: attr.id, name: attr.name, isGraphic: true, "icon": attr.icon, checked: true });
            if (!layer.attributes.visible) {
                this.hideGraphic(attr.id);
            }
            var area = evt.feature.getGeometry().getArea();
            if (_context._onAddPolygon) _context._onAddPolygon(evt.feature);
            callback(evt.feature);

        });       
    };
    this.activateToolCircle = function (r, html, attributes, callback) {
        callback = callback || _.noop;
        if (this._toolbarsActivate) {
            _context._myMap.removeInteraction(draw);
        }
        this._toolbarsActivate = true;
        draw = new ol.interaction.Draw({
            type: 'Point'
        });
        this._myMap.addInteraction(draw);
        draw.on('drawend', function (evt) {
            _context._myMap.removeInteraction(draw);
            _context._toolbarsActivate = false;
            _context.addCircle(evt.feature.values_.geometry.flatCoordinates[0], evt.feature.values_.geometry.flatCoordinates[1], r, html, attributes);
            var center = evt.feature.values_.geometry.getLastCoordinate();
            //var suma = _context.distanceTwoPoints(center[1], center[0], pointfinal[1], pointfinal[0]);
            if (_context._onAddCircle) _context._onAddCircle(evt.feature.getGeometry().getCoordinates(),evt.feature);
            callback(evt.feature.getGeometry().getCoordinates(),evt.feature);
        });

    };
    
    this.activateToolMultiPoint = function () {
        if (this._toolbarsActivate) {
            _context._myMap.removeInteraction(draw);
        }
        this._toolbarsActivate = true;
        draw = new ol.interaction.Draw({
            type: 'MultiPoint'
        });
        this._myMap.addInteraction(draw);
        draw.on('drawend', function (evt) {
            _context._myMap.removeInteraction(draw);
            this._toolbarsActivate = false;           
            //if (this._onAddMultiPoint) this._onAddMultiPoint();
        });
    };//Falta ver cuando para como obtener todos los puntos 

    //////////////////////////////Tree/////////////////////////////////////////////////
    this.initTree = function () {       
        _context._divContainerTree = $('<div class="mapContainer_jstree hideen-tree"></div>');
        _context._divTree = $('<div id="map_jstree" class="map_jstree ztree"></div>');
        var divBtnBuscar = $('<div id="btnBuscarTree"></div>')
        var textBtnBuscar = $('<input type="text" value="" id="textBtnBuscar_tree" placeholder="Search"  />');
        $(_context._divContainerTree).append(divBtnBuscar);
        $(_context._divContainerTree).append(_context._divTree);
        $(divBtnBuscar).append(textBtnBuscar);
        $('#' + this._target).append(_context._divContainerTree);
        var setting = {
            check: {
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            view: {
                dblClickExpand: false,
            },
            callback: {
                onClick: function (evt, time, node, num) {
                    if (!(node.id == 'raiz' || node.isLayer)) {
                        var gra = _context.getGraphicById(node.id);
                        _context.centerAt(gra.values_.geometry.flatCoordinates[0], gra.values_.geometry.flatCoordinates[1], 'fly', 18);

                        $(_context._element).popover('destroy');                       
                        _context._popup.setPosition(gra.values_.geometry.flatCoordinates);                            
                        var content = gra.values_.content; 
                        $(_context._element).popover({
                            'placement': 'top',
                            'html': true,
                            'content': content
                        });
                        $(_context._element).popover('show');
                    }
                    else {
                        _context._zTree.expandNode(node);
                    }
                },
                onCheck: function (evt, id, node) {
                    if (!node.checked && node.name == "Clasificaciones") {
                        _context.hideAllLayersGraphic();
                    }
                    if (node.checked && node.name == "Clasificaciones") {
                        _context.showAllLayersGraphic();
                    }
                    if (!node.checked && node.isLayer) {
                        var id = node.id.substring(5, node.id.length);
                        _context.hideLayer(id);
                    }
                    if (node.checked && node.isLayer) {
                        var id = node.id.substring(5, node.id.length);
                        _context.showLayer(id);
                    }
                    if (!node.checked && (node.isPoint || node.isGraphic)) {
                        _context.hideGraphic(node.id);
                    }
                    if (node.checked && (node.isPoint || node.isGraphic)) {
                        _context.showGraphic(node.id);
                    }
                }
            }
        };

        var zNodes = [
            { id: 'raiz', name: "Clasificaciones", open: true, checked:true},
        ];
        $.fn.zTree.init($("#map_jstree"), setting, zNodes);
        this._zTree = $.fn.zTree.getZTreeObj("map_jstree");
        this._zTree.setting.check.chkboxType = { "Y": "ps", "N": "ps" };
        var lastValue = "", nodeList = [], fontCss = {};
        function searchNode() {            
            var value = $.trim(key.get(0).value);
            var keyType = 'name';
            if (lastValue === value) return;
            lastValue = value;
            nodeList = _context._zTree.getNodesByParamFuzzy(keyType, value);
            var nodes = _context._zTree.transformToArray(_context._zTree.getNodes())
            _context._zTree.hideNodes(nodes);
            _context._zTree.showNodes([_context._zTree.getNodeByParam('id', 'raiz')]);
            for (var i = 0, l = nodeList.length; i < l; i++) {
                _context._zTree.showNodes([nodeList[i]]);
                var aux = nodeList[i].getParentNode();
                while (aux) {
                    _context._zTree.showNodes([aux]);
                    aux = aux.getParentNode();
                }
            }
        }
        var key = $('#textBtnBuscar_tree');
        key.bind("input", searchNode);
    };
    this.showTree = function () {
        if (!_context._treeVisble) {
            _context._divContainerTree.toggleClass('hideen-tree');
            _context._treeVisble = true;
        }
    };
    this.deleteTree = function () {
        if (_context._treeVisble) {
            _context._divContainerTree.toggleClass('hideen-tree');
            _context._treeVisble = false;
        }
    };

    ///////////////////////////Search///////////////////////////////////////////////
    this.searchByFunction = function (userFunction, layer) {
        var result = [];
        if (layer) {
            var allGraphic = this.getGraphicsByLayer(layer);
        } else {
            var allGraphic = this.getGraphics();
        }
        if (allGraphic) {
            $.each(allGraphic, function (i, j) {
                if (userFunction(j)) result.push(j);
            });
        }
        return result;
    };
    this.searchById = function (id, layer) {
        var result = [];
        if (jQuery.isNumeric(id)) {
            var idAux = id.toString().toLowerCase();
        } else {
            var idAux = id.toLowerCase();
        }
        if (layer) {
            var allGraphic = this.getGraphicsByLayer(layer);
        } else {
            var allGraphic = this.getGraphics();
        }
        if (allGraphic) {
            $.each(allGraphic, function (i, gra) {
                if (gra.values_.attributes && gra.values_.attributes.id) {
                    var aux = "";
                    if (jQuery.isNumeric(gra.values_.attributes.id)) {
                        aux = gra.values_.attributes.id.toString().toLowerCase();
                    } else {
                        aux = gra.values_.attributes.id.toLowerCase();
                    }
                    if (aux.search(idAux) != -1) {
                        result.push(gra);
                    }
                }
            });
            return result;
        }
    };
    this.searchByDescription = function (text, layer) {
        var result = [];
        var textAux = text.toLowerCase();
        if (layer) {
            var allGraphic = this.getGraphicsByLayer(layer);
        } else {
            var allGraphic = this.getGraphics();
        }
        if (allGraphic) {
            if (allGraphic) {
                $.each(allGraphic, function (i, gra) {
                    if (gra.values_.attributes && gra.values_.attributes.descripcion) {
                        var aux = gra.values_.attributes.descripcion.toLowerCase();
                        if (aux.search(textAux) != -1) {
                            result.push(gra);
                        }
                    }
                });
            }
            return result;
        }
    };
    this.searchByName = function (name, layer) {
        var result = [];
        var nameAux = name.toLowerCase();
        if (layer) {
            var allGraphic = this.getGraphicsByLayer(layer);
        } else {
            var allGraphic = this.getGraphics();
        }
        if (allGraphic) {
            $.each(allGraphic, function (i, gra) {
                if (gra.values_.attributes && gra.values_.attributes.nombre) {
                    var aux = gra.values_.attributes.nombre.toLowerCase();
                    if (aux.search(nameAux) != -1) {
                        result.push(gra);
                    }
                }
            });
            return result;
        }
    };

    ///////////////////////////////Distancia////////////////////////////////////////
    this.distanceTwoPoints = function (latP1, longP1, latP2, longP2) {
        var degtorad = 0.01745329;
        var radtodeg = 57.29577951;

        var lat1 = parseFloat(latP1);
        var lat2 = parseFloat(latP2);
        var long1 = parseFloat(longP1);
        var long2 = parseFloat(longP2);

        var dlong = (long1 - long2);
        var dvalue = (Math.sin(lat1 * degtorad) * Math.sin(lat2 * degtorad))
            + (Math.cos(lat1 * degtorad) * Math.cos(lat2 * degtorad)
                * Math.cos(dlong * degtorad));
        var dd = Math.acos(dvalue) * radtodeg;
        //var miles = (dd * 69.16);
        //miles = (miles * 100) / 100;
        var km = (dd * 111.302);
        km = (km * 100) / 100;
        return km;
    };    
    this.distanceRoute = function (arrPoint) {
        var distance = 0;
        for (var i = 0; i < arrPoint.length - 1; i++) {
            distance += this.distanceTwoPoints(arrPoint[i][1], arrPoint[i][0], arrPoint[i + 1][1], arrPoint[i + 1][0]);
        }
        return distance;
    };

    /////////////////////////Otros///////////////////////////////////////////////////
    this.getZoom = function () {
        return this._myMap.getView().getZoom();
    };
    this.centerAt = function (x, y, modo, zoom) {
        if (zoom) {
            this._myMap.getView().setZoom(zoom);
        }
        function bounce(t) {
            var s = 7.5625, p = 2.75, l;
            if (t < (1 / p)) {
                l = s * t * t;
            } else {
                if (t < (2 / p)) {
                    t -= (1.5 / p);
                    l = s * t * t + 0.75;
                } else {
                    if (t < (2.5 / p)) {
                        t -= (2.25 / p);
                        l = s * t * t + 0.9375;
                    } else {
                        t -= (2.625 / p);
                        l = s * t * t + 0.984375;
                    }
                }
            }
            return l;
        };
        function elastic(t) {
            return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
        };
        if (!modo) {
            this._myMap.getView().setCenter([x, y]);
        }
        else {
            if (modo == 'fly') {
                var duration = 1000;
                var start = +new Date();
                var pan = ol.animation.pan({
                    duration: duration,
                    source: /** @type {ol.Coordinate} */ (this._myMap.getView().getCenter()),
                    start: start
                });
                var bounce = ol.animation.bounce({
                    duration: duration,
                    resolution: 4 * this._myMap.getView().getResolution(),
                    start: start
                });
                this._myMap.beforeRender(pan, bounce);
                this._myMap.getView().setCenter([x, y]);
            }
            if (modo == 'spin') {
                var duration = 2000;
                var start = +new Date();
                var pan = ol.animation.pan({
                    duration: duration,
                    source: /** @type {ol.Coordinate} */ (this._myMap.getView().getCenter()),
                    start: start
                });
                var rotate = ol.animation.rotate({
                    duration: duration,
                    rotation: 2 * Math.PI,
                    start: start
                });
                this._myMap.beforeRender(pan, rotate);
                this._myMap.getView().setCenter([x, y]);
            }
            if (modo == 'spiral') {
                var duration = 2000;
                var start = +new Date();
                var pan = ol.animation.pan({
                    duration: duration,
                    source: /** @type {ol.Coordinate} */ (this._myMap.getView().getCenter()),
                    start: start
                });
                var bounce = ol.animation.bounce({
                    duration: duration,
                    resolution: 2 * this._myMap.getView().getResolution(),
                    start: start
                });
                var rotate = ol.animation.rotate({
                    duration: duration,
                    rotation: -4 * Math.PI,
                    start: start
                });
                this._myMap.beforeRender(pan, bounce, rotate);
                this._myMap.getView().setCenter([x, y]);
            }
            if (modo == 'bounce') {
                var pan = ol.animation.pan({
                    duration: 2000,
                    easing: bounce,
                    source: /** @type {ol.Coordinate} */ (this._myMap.getView().getCenter())
                });
                this._myMap.beforeRender(pan);
                this._myMap.getView().setCenter([x, y]);
            }
            if (modo == 'elastic') {
                var pan = ol.animation.pan({
                    duration: 2000,
                    easing: elastic,
                    source: /** @type {ol.Coordinate} */ (this._myMap.getView().getCenter())
                });
                this._myMap.beforeRender(pan);
                this._myMap.getView().setCenter([x, y]);
            }
            if (modo == 'pan') {
                var pan = ol.animation.pan({
                    duration: 2000,
                    source: /** @type {ol.Coordinate} */ (this._myMap.getView().getCenter())
                });
                this._myMap.beforeRender(pan);
                this._myMap.getView().setCenter([x, y]);
            }
        }
    };
    this.setZoom = function (zoom) {
        this._myMap.getView().setZoom(zoom);
    };
    this.rotateMap = function () {
        var currentRotation = this._myMap.getView().getRotation();
        var rotateAroundRome = ol.animation.rotate({
            anchor: this._myMap.getView().getCenter(),
            duration: 1000,
            rotation: currentRotation
        });
        this._myMap.beforeRender(rotateAroundRome);
        this._myMap.getView().rotate(currentRotation + (Math.PI / 2), this._myMap.getView().getCenter());
    };
    this.clear = function (id) {
        if (id) {
            var layer = this.getGraphicLayerById(id);
            if (layer) {               
                this._recorrerRecursivo(layer);
            }
        }
        else {
            var layers = this.getGraphicLayers();
            $.each(layers, function (i, o) {
                _context.deleteLayer(o.attributes.id);
            });
        }
        
    }
    this._recorrerRecursivo = function (layer) {
        if (layer == null) {
            return;
        }
        else {
            this._clearLayer(layer);
            for (var i = 0; i < layer.attributes.children.length; i++) {
                this._recorrerRecursivo(layer.attributes.children[i]);
            }
        }
    };
    this._clearLayer = function (layer) {
        $.each(layer.getSource().getFeatures(), function (i, o) {
            _context.deleteGraphic(o.id_);
        });
    };

    /////////////////////////Datos///////////////////////////////////////////////////
    this.createItemLoading = function () {
        this._datosItemCt = $('<div class="datos-item-ct"></div>').appendTo($('#' + this._target));
        var textProgres = $('<div class="text-progres">Cargando...</div>').appendTo(this._datosItemCt);
        var divProgresCt = $('<div class="progress"></div>').appendTo(this._datosItemCt);
        var btnCancelarProgres = $('<button class="btn-cancelar-progres">Cancelar</button>').appendTo(this._datosItemCt);
        var barProgres = $('<div class="progress-bar progress-bar-info progress-bar-striped" style="width:60%">60%</div>').appendTo(divProgresCt);
        return this._datosItemCt;
    };

    /////////////////////////Init///////////////////////////////////////////////////
    this._init = function () {       
        this._tapizControlCt = $('<div class="tapiz-control-ct"></div>').appendTo($('#' + this._target));
        this._layerControlCt = $('<div class="layer-control-ct hidde"></div>').appendTo($('#' + this._target));
        var arr = new Array();
        this._treeControlCt = $('<div title="show/hide Tree" class="tree-control-ct"></div>').appendTo($('#' + this._target));
        var treeCt = $('<div class="tree-ct"></div>').appendTo($(this._treeControlCt));
        var template = $('<div class="img-tree-ct"></div>');
        template.appendTo(treeCt);
        $(template).click(function () {
            template.parent().toggleClass('div-selected');
            if (_context._treeVisble) {
                _context.deleteTree();
            }
            else {
                _context.showTree();
            }
        });
        var layerCt = $('<div title="show/hide layer" class="layer-ct"></div>').appendTo($('#' + this._target));
        $('<div class="img-layer-ct"></div>').appendTo(layerCt);
        $(layerCt).click(function () {
            layerCt.toggleClass('div-selected');
            if (_context._layerGraphicCtOptions) {
                if (!$(_context._layerGraphicCtOptions).hasClass('hide')) {
                    $(_context._layerGraphicCtOptions).addClass('hidde');
                }                   
            }
            $('.layer-graphic-ct.div-selected').removeClass('div-selected');
            $(_context._layerControlCt).toggleClass('hidde');
        });
        var tapizCtButtom = $('<div title="show/hide tapiz" class="tapiz-ct-buttom div-selected"></div>').appendTo($('#' + this._target));
        $('<div class="img-tapiz-ct"></div>').appendTo(tapizCtButtom);
        $(tapizCtButtom).click(function () {
            tapizCtButtom.toggleClass('div-selected');
            $(_context._tapizControlCt).toggleClass('hidde');
        });
        this._layerVolumenProvinceCt = $('<div title="volumen layer map" class="layer-volumenPro-ct"></div>').appendTo($('#' + this._target));
        $('<div class="img-volumen-ct"></div>').appendTo(this._layerVolumenProvinceCt);
        $(this._layerVolumenProvinceCt).click(function () {
            var layer = _context.getGraphicLayerById('cuba');
            if (!layer) {
                _context.addVolumeProvinceLayer();
            }
            else {
                _context.deleteVolumeProvinceLayer();
            }
        });
        if (!this._showOptionsTools) {
            //this._tapizControlCt.addClass('hidde');
            this._layerControlCt.addClass('hidde');
            this._treeControlCt.addClass('hidde');
            this._layerVolumenProvinceCt.addClass('hidde');
            layerCt.addClass('hidde');
            tapizCtButtom.addClass('hidde');
        }
        ///////////////////////Controles/////////////////
        var attribution = new ol.control.Attribution({
            collapsible: false
        });
        var fullScreem = new ol.control.FullScreen();       
        ///////////////////Crear el mapa/////////////////////////////////
        this._myMap = new ol.Map({
            controls: ol.control.defaults({ attribution: false }).extend([fullScreem]),
            view: new ol.View({
                projection: 'EPSG:4326',
                center: [-84, 23],
                zoom: 4
            }),
            interactions: ol.interaction.defaults().extend([new ol.interaction.DragRotateAndZoom()]),
            target: document.getElementById(config.target)
        });
        //////////////Evento mover el mapa/////////////////////////
        this._myMap.on('moveend', function () {
            if (_context._onPan) _context._onPan(_context);
        });
        //////////Adicionar las capas bases/////////////////
        $.each(this._layers, function (i, value) {
            _context.addLayer(value);
        });
        /////////Zoom inicila del mapa///////////////////
        if (this._initialZoom) {
            this._myMap.getView().setZoom(this._initialZoom);
        }
        ////////Las coordenadas donde comineza el mapa////////////////
        if (this._startAt) {
            this._myMap.getView().setCenter(this._startAt);
        }
        //////////////Mostrar cuadriculas//////////////////////////////
        if (this._graticule) {
            var graticule = new ol.Graticule({
                // the style to use for the lines, optional.
                strokeStyle: new ol.style.Stroke({
                    color: 'rgba(255,120,0,0.9)',
                    width: 2,
                    lineDash: [0.5, 4]
                })
            });
            graticule.setMap(this._myMap);
        }
        ////////////////Mostrar overview//////////////////////////////
        //if (this._showOverview) {
        //    var overViewControl = new ol.control.OverviewMap({
        //        layers: [this._myMap.getLayers().getArray()[0]],
        //        collapsed: false
        //    });
        //    this._myMap.addControl(overViewControl);
        //}
        //////////////Mostrar escala//////////////////////////////
        if (this._showScalebar) {
            var scaleLineControl = new ol.control.ScaleLine({
                value: 'metric'
            });
            this._myMap.addControl(scaleLineControl);
        }
        //////////////Mostrar coordenadas//////////////////////////////
        if (this._showCoordinates) {
            var coor = function (coordinates) {
                return 'lon: ' + coordinates[0] + '; lat: ' + coordinates[1];
            };
            this._coordinates = new ol.control.MousePosition(
                {
                    className: 'map-coordinates',
                    coordinateFormat: coor
                });
            this._myMap.addControl(this._coordinates);
        }
        //////////////Resizar el mapa//////////////////////////////
        this.checkSize = function () {
            var small = _context._myMap.getSize()[0] < 600;
            attribution.setCollapsible(small);
            attribution.setCollapsed(small);
        };
        $('#' + this._target).on('resize', this.checkSize);
        this.checkSize();

        ////////////////Crear Popup//////////////////////////////
        this._element = $('<div></div>').appendTo($('#' + this._target));
        this._popup = new ol.Overlay({
            element: _context._element,
            positioning: 'bottom-center',
            stopEvent: true
        });
        
        this._myMap.addOverlay(this._popup);
        this._myMap.on('click', function (evt) {
            $(_context._element).popover('destroy');
            var feature = _context._myMap.forEachFeatureAtPixel(evt.pixel,
                function (feature, layer) {
                    return feature;
                });
            if (feature && feature.values_.attributes && feature.values_.attributes.visible) {
                if ( feature.values_.attributes.isPolygon) {
                    var coord = feature.getGeometry().getInteriorPoint().flatCoordinates;
                }
                else if(feature.values_.attributes.isCircle){
                    var coord = feature.getGeometry().getCenter();
                }
                else if (feature.values_.attributes.isLine) {
                    var coord = feature.getGeometry().getFlatMidpoint();                    
                }
                else {
                    var coord = feature.getGeometry().getCoordinates();
                }
                _context._popup.setPosition(coord);                
                if (feature.values_.content) {
                    var content = feature.values_.content;
                }
                else if (feature.values_.features && feature.values_.features[0].values_.content) {
                    if (feature.values_.features.length == 1) {
                        var content = feature.values_.features[0].values_.content;
                    }
                }
                $(_context._element).popover({
                    'placement': 'top',
                    'html': true,
                    'content': content
                });
                $(_context._element).popover('show');
            } else {
                $(_context._element).popover('destroy');
            }
        });
        this.initTree();
    };
    this._init();    
};
