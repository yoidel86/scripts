//
// site.js
//
// the arbor.js website
//
function Graf(json) {
    if (json.success) {
        jsonSaved = json;
        jsonNavigation.push(json);
        sys.graft(json);
        $("div.window-overlay").first().fadeOut();
    } else {
        alert(json.error);
        $("div.window-overlay").first().fadeOut();
    }
}

function openFicha(url) {
    $.Dialog({
        width: '100%',
        height: '100%',
        shadow: true,
        flat: true,
        draggable: true,
        padding: 5,
        icon: '<span class="icon-address-book"></span>',
        title: 'Ficha',
        content: '',
        onShow: function () {
            var html = ['<iframe width="100%" src="' + url + '" frameborder="0"></iframe>'].join("");
            $.Dialog.content(html);
        }
    });

    $('.window.flat.shadow').css('width', 200);

    $('iframe').css('height', window.innerHeight - 40);

    $(window).resize(function () {
        $('iframe').css('height', window.innerHeight - 40);
    });
}

function invokeSilverlightModule(titulo, params) {
    var control = document.getElementById("MefController");
    control.Content.Workspace.InvokeModule(titulo, params);
}

function bottomNavAddButton(title, url, icon, clickv) {
    var container = $('nav#bottonNav > .navigation-bar-content:first');

    var tmp = '<span class="element-divider place-right generate"></span><a class="element place-right generate" href="#" title="' + title + '"><span class="' + icon + '"></span></a><span class="element-divider place-right generate"></span>';

    $(container).append(tmp);

    $(container).find('a[title="' + title + '"]').bind('click', { urlData: url }, clickv);
}

var sys = arbor.ParticleSystem();

var filter_menu_generated = false;

var nodes_vinculos_hiden = new Array();

var prunedNodes = new Array();

var jsonSaved = "";

var jsonNavigation = new Array();

(function ($) {
    // var trace = function(msg){
    //   if (typeof(window)=='undefined' || !window.console) return
    //   var len = arguments.length, args = [];
    //   for (var i=0; i<len; i++) args.push("arguments["+i+"]")
    //   eval("console.log("+args.join(",")+")")
    // }  

    function getMousePos(canvas, evt) {
        // get canvas position
        var obj = canvas;
        var top = 0;
        var left = 0;
        while (obj && obj.tagName != 'BODY') {
            top += obj.offsetTop;
            left += obj.offsetLeft;
            obj = obj.offsetParent;
        }

        // return relative mouse position
        var mouseX = evt.clientX - left + window.pageXOffset;
        var mouseY = evt.clientY - top + window.pageYOffset;
        return {
            x: mouseX,
            y: mouseY
        };
    }

    var Renderer = function (elt) {
        var dom = $(elt);
        var canvas = dom.get(0);
        var ctx = canvas.getContext("2d");
        var gfx = arbor.Graphics(canvas);
        var sys = null;
        var _vignette = null;
        var selected = null,
            nearest = null,
            _mouseP = null;

        var tooltip = function () {
            var id = 'tt';
            var top = 3;
            var left = 3;
            var maxw = 300;
            var tt, t, c, b, h;
            var ie = document.all ? true : false;
            return {
                pos: function (e) {
                    var u = ie ? e.clientY + document.documentElement.scrollTop : e.pageY;
                    var l = ie ? e.clientX + document.documentElement.scrollLeft : e.pageX;
                    tt.style.top = u > h ? (u - h) + 'px' : u + 'px';
                    tt.style.left = l + $(tt).width() < window.innerWidth ? (l + left) + 'px' : (l - $(tt).width() - left) + 'px';
                },
                show: function (e, v, w) {
                    if (tt == null) {
                        tt = document.createElement('div');
                        tt.setAttribute('id', id);
                        t = document.createElement('div');
                        t.setAttribute('id', id + 'top');
                        c = document.createElement('div');
                        c.setAttribute('id', id + 'cont');
                        b = document.createElement('div');
                        b.setAttribute('id', id + 'bot');
                        tt.appendChild(t);
                        tt.appendChild(c);
                        tt.appendChild(b);
                        document.body.appendChild(tt);
                    }
                    tt.style.opacity = 1;
                    tt.style.display = 'block';
                    if ($.type(v) === "string") {
                        c.innerHTML = v;
                    } else {
                        switch (v.origen) {
                            case "persona":
                                c.innerHTML = "<img src='" + window.fotoPersonaNacional + "?ci=" + v.ExtendData.NoIdentidad + "&tipo=1' alt='" + v.ExtendData.NoIdentidad + "' height='300' width='300'>" +
                                    "<dl style='color: white;'>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>No. Identidad:&nbsp;</dt><dd>" + v.ExtendData.NoIdentidad + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Nombre:&nbsp;</dt><dd>" + v.ExtendData.NombreCompleto + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Sexo:&nbsp;</dt><dd>" + v.ExtendData.Sexo + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Edad:&nbsp;</dt><dd>" + v.ExtendData.Edad + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Fecha Nacimiento:&nbsp;</dt><dd>" + v.ExtendData.FechaNacimiento + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Madre:&nbsp;</dt><dd>" + v.ExtendData.NombreMadre + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Padre:&nbsp;</dt><dd>" + v.ExtendData.NombrePadre + "</dd>" +
                                    "</dl>";
                                break;
                            case "vehiculo":
                                c.innerHTML = "<img src='" + window.fotoCarro + "?id= " + v.ExtendData.Id + "&tipo=1' alt='" + v.ExtendData.Id + "' height='300' width='300'>" +
                                    "<dl style='color: white;'>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Marca:&nbsp;</dt><dd>" + v.ExtendData.Marca + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Modelo:&nbsp;</dt><dd>" + v.ExtendData.Modelo + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Sector:&nbsp;</dt><dd>" + v.ExtendData.Sector + "</dd>" +
                                    "</dl>";
                                break;
                         
                            case "direccion":
                                c.innerHTML = "<dl style='color: white;'>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Direcci&oacute;n:&nbsp;</dt><dd>" + v.ExtendData.Direccion + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Tipo Direcci&oacute;n:&nbsp;</dt><dd>" + v.ExtendData.TipoDireccion + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Fecha Alta:&nbsp;</dt><dd>" + v.ExtendData.FechaAlta + "</dd>" +
                                        "<dt style='float: left;overflow: hidden;text-align: right;text-overflow: ellipsis;white-space: nowrap;'>Fecha Baja:&nbsp;</dt><dd>" + v.ExtendData.FechaBaja + "</dd>" +
                                    "</dl>";
                                break;
                        }
                    }
                    c.style.margin = "5px";
                    tt.style.width = w ? w + 'px' : 'auto';
                    tt.style.position = "absolute";
                    tt.style.background = "black";
                    tt.style.color = "white";
                    if (!w && ie) {
                        t.style.display = 'none';
                        b.style.display = 'none';
                        tt.style.width = tt.offsetWidth;
                        t.style.display = 'block';
                        b.style.display = 'block';
                    }
                    if (tt.offsetWidth > maxw) {
                        tt.style.width = maxw + 'px';
                    }
                    h = parseInt(tt.offsetHeight) + top;
                    this.pos(e);
                },
                hide: function () {
                    if (tt != null) {
                        tt.style.opacity = 0;
                        tt.style.display = "none";
                    }
                }
            };
        }();

        var that = {
            init: function (pSystem) {
                sys = pSystem;
                sys.screen({
                    size: { width: dom.width(), height: dom.height() },
                    padding: [36, 60, 36, 60]
                });
                $(window).resize(that.resize);
                that.resize();
                that._initMouseHandling();
                that.canvas_drag_zoom.init();
            },

            resize: function () {
                canvas.width = $(window).width() - 5;
                canvas.height = $(window).height() - 5;
                sys.screen({ size: { width: canvas.width, height: canvas.height } });
                _vignette = null;
                that.redraw();
            },

            redraw: function () {

                ctx.clearRect(-that.canvas_drag_zoom.axisPos.x / that.canvas_drag_zoom.scale,
                    -that.canvas_drag_zoom.axisPos.y / that.canvas_drag_zoom.scale,
                    canvas.width / that.canvas_drag_zoom.scale,
                    canvas.height / that.canvas_drag_zoom.scale);
                gfx.clear();
                sys.eachEdge(function (edge, p1, p2) {
                    if (edge.source.data.Alpha * edge.target.data.Alpha == 0) return;
                    gfx.line(p1, p2, { stroke: "#b2b19d", width: 2, Alpha: edge.target.data.Alpha });
                    if (edge.data.Label) {
                        gfx.text(edge.data.Label, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, { color: "white", align: "center", font: "Arial", size: 12 });
                    }
                });

                var nodes = 0;
                sys.eachNode(function (node, pt) {
                    var w = Math.max(20, 20 + gfx.textWidth(node.name));
                    if (node.data.Label && !node.data.Image) {
                        w = Math.max(20, 20 + gfx.textWidth(node.data.Label));
                    }
                    if (node.data.Image) {
                        w = 75;
                    }
                    if (node.data.Image && node.data.NodeVinculo) {
                        w = 25;
                    }
                    if (node.data.Alpha == 0) return;
                    if (node.data.Shape == 'Dot') {
                        if (node.data.Image) {
                            var baseImage = new Image();
                            baseImage.src = node.data.Image;

                            if (!node.data.NodeVinculo) {
                                if (node.data.Main) {
                                    //Rectangulo rojo
                                    ctx.beginPath();
                                    ctx.lineWidth = "2";
                                    ctx.strokeStyle = "red";
                                    ctx.rect(pt.x - (w + 2) / 2, pt.y - (w + 2) / 2, w + 2, w + 2);
                                    ctx.stroke();
                                } else {
                                    //Rectangulo negro
                                    ctx.beginPath();
                                    ctx.lineWidth = "2";
                                    ctx.strokeStyle = "black";
                                    ctx.rect(pt.x - (w + 2) / 2, pt.y - (w + 2) / 2, w + 2, w + 2);
                                    ctx.stroke();
                                }
                            }

                            ctx.drawImage(baseImage, pt.x - w / 2, pt.y - w / 2, w, w);
                            if (node.data.Label && node.data.NodeVinculo) {
                                gfx.text(node.data.Label, pt.x, pt.y + w + w / 2, { color: "white", align: "center", font: "Arial", size: 12 });
                            }
                            else if (node.data.Label) {
                                gfx.text(node.data.Label, pt.x, pt.y + w / 2 + w / 3, { color: "white", align: "center", font: "Arial", size: 12 });
                            } else {
                                gfx.text(node.name, pt.x, pt.y + w / 2 + w / 3, { color: "white", align: "center", font: "Arial", size: 12 });
                            }
                        } else {
                            gfx.oval(pt.x - w / 2, pt.y - w / 2, w, w, { fill: node.data.Color, alpha: node.data.Alpha });
                            if (node.data.Label) {
                                gfx.text(node.data.Label, pt.x, pt.y + 7, { color: "white", align: "center", font: "Arial", size: 12 });
                            } else {
                                gfx.text(node.name, pt.x, pt.y + 7, { color: "white", align: "center", font: "Arial", size: 12 });
                            }
                        }
                    } else {
                        gfx.rect(pt.x - w / 2, pt.y - 8, w, 20, 4, { fill: node.data.Color, alpha: node.data.Alpha });
                        gfx.text(node.name, pt.x, pt.y + 9, { color: "white", align: "center", font: "Arial", size: 12 });
                    }
                    nodes++;
                });

                if (nodes <= 1) {
                    sys.stop();
                }
            },

            canvas_drag_zoom: {
                scale: 1,
                axisPos: {
                    x: 0,
                    y: 0
                },
                init: function () {
                    ctx.save();
                    var prevPos;
                    //canvas.addEventListener('mousewheel', this.func, false);
                    //canvas.addEventListener('DOMMouseScroll', this.func, false);
                    //var handler = function (e) {
                    //    that.canvas_drag_zoom.dragging(e, canvas, prevPos);
                    //};
                    //canvas.addEventListener('contextmenu',
                    //    function (evt) {
                    //        evt.preventDefault();
                    //        prevPos = getMousePos(canvas, evt);
                    //        mousedownid = canvas.addEventListener('mousemove',
                    //            handler, false);
                    //    }, false);
                    //document.addEventListener('mouseup',
                    //    function (evt) {
                    //        if (evt.which == 3) {
                    //            canvas.removeEventListener('mousemove', handler, false);
                    //        }
                    //    }, false);
                },
                dragging: function (e, canvas, prevPos) {
                    currPos = getMousePos(canvas, e);
                    var x = currPos.x - prevPos.x;
                    var y = currPos.y - prevPos.y;
                    prevPos.x = currPos.x;
                    prevPos.y = currPos.y;
                    that.canvas_drag_zoom.translate(canvas.getContext('2d'), x, y);
                    that.redraw();
                },
                func: function (evt) {
                    var mousePos = getMousePos(canvas, evt);
                    var k;
                    if (evt.detail < 0 || evt.wheelDelta > 0) {
                        k = 1.2;
                        that.canvas_drag_zoom.scale = that.canvas_drag_zoom.scale * 1.2;
                    }
                    else {
                        k = 1 / 1.2;
                        that.canvas_drag_zoom.scale = that.canvas_drag_zoom.scale / 1.2;
                    }
                    var x = mousePos.x * (1 - k) + (k - 1) * that.canvas_drag_zoom.axisPos.x;
                    var y = mousePos.y * (1 - k) + (k - 1) * that.canvas_drag_zoom.axisPos.y;
                    ctx.scale(k, k);
                    that.canvas_drag_zoom.translate(ctx, x, y);
                    that.redraw();
                },
                translate: function (ctx, x, y) {
                    that.canvas_drag_zoom.axisPos.x += x;
                    that.canvas_drag_zoom.axisPos.y += y;
                    ctx.translate(x / that.canvas_drag_zoom.scale, y / that.canvas_drag_zoom.scale);
                },
                center: function () {
                    ctx.restore();
                    ctx.save();
                    that.canvas_drag_zoom.scale = 1;
                    that.canvas_drag_zoom.axisPos.x = 0;
                    that.canvas_drag_zoom.axisPos.y = 0;
                    that.redraw();
                }
            },

            generate_filter_menu: function () {

                var tipoVinculos = new Array();

                $("#filterLinks-dropdown-menu").children().remove();

                for (var nodeKey in jsonSaved.nodes) {
                    if (jsonSaved.nodes[nodeKey].TipoVinculo) {
                        var tipoVinculo = jsonSaved.nodes[nodeKey].TipoVinculo;
                        if (tipoVinculos.indexOf(tipoVinculo) == -1) {
                            tipoVinculos.push(tipoVinculo);

                            $("#filterLinks-dropdown-menu").append('<li style="cursor:pointer">' +
                                '<div class="input-control checkbox" style="margin-left: 10px; margin-top: 10px; width: 100%;">' +
                                '<label>' +
                                '<input id="' + tipoVinculo + '" type="checkbox" checked />' +
                                '<span class="check"></span>' +
                                tipoVinculo +
                                '</label>' +
                                '</div>' +
                                '</li>' +
                                '<li class="divider"></li>');
                        }
                    }
                }

                $("#filterLinks-dropdown-menu input").click(function () {
                    var id = this.id;
                    var indexOf = nodes_vinculos_hiden.indexOf(id);

                    if (indexOf == -1) {
                        sys.eachNode(function (node) {
                            if (node.data.NodeVinculo && node.data.TipoVinculo == id) {
                                that.pruneNodeDeep(node);
                            }
                        });

                        nodes_vinculos_hiden.push(id);
                    } else {
                        nodes_vinculos_hiden.splice(indexOf, 1);

                        for (var nodeKey in jsonSaved.nodes) {
                            if (jsonSaved.nodes[nodeKey].TipoVinculo == id) {
                                that.addNodeDeep(nodeKey, jsonSaved);
                            }
                        }
                    }
                });
            },

            _initMouseHandling: function () {
                selected = null;
                nearest = null;
                var dragged = null;
                var handler = {
                    moved: function (e) {
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                        nearest = sys.nearest(_mouseP);

                        if (!nearest) return false;
                        if (!nearest.node) return false;
                        if (nearest.node.data.Shape == 'Dot') {
                            selected = (nearest.distance < 50) ? nearest : null;
                            if (selected) {
                                dom.css("cursor", "pointer");
                                tooltip.show(e, selected.node.data.Tooltip);
                            }
                            else {
                                dom.css("cursor", "default");
                                tooltip.hide();
                                window.status = '';
                            }
                        }

                        return false;
                    },
                    clicked: function (e) {
                        if (e.button != 0) { return false; }
                        $('#bottonNav').animate({ height: '-60px' }, 500);
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                        nearest = dragged = sys.nearest(_mouseP);

                        if (nearest && selected && nearest.node === selected.node) {

                        }

                        if (dragged && dragged.node !== null) dragged.node.fixed = true;
                        $(canvas).unbind('mousemove', handler.moved);
                        $(canvas).bind('mousemove', handler.dragged);
                        $(window).bind('mouseup', handler.dropped);
                        return false;
                    },
                    dblclicked: function (e) {
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                        nearest = dragged = sys.nearest(_mouseP);

                        if (nearest && selected && nearest.node === selected.node) {
                            if (!nearest.node.data.NodeVinculo) {
                                if (Object.keys(jsonSaved.edges).indexOf(selected.node.name) < 0) {
                                    $("div.window-overlay").first().fadeIn();
                                    $.get(window.grafoPersona, { id: selected.node.name, ampliado: true }, function (data) {
                                        $("div.window-overlay").first().fadeOut();
                                        if (data.success != null && !data.success) {
                                            alert("No se encontró.");
                                        } else {
                                            console.log(jsonSaved);
                                            //$.extend(true, jsonSaved, jsonSaved, data);
                                            var newJson = my.fixArborJson(jsonSaved, data);

                                            $.extend(true, jsonSaved, jsonSaved, newJson);

                                            sys.graft(newJson);

                                            filter_menu_generated = false;
                                        }
                                    });
                                }
                            } 
                        }
                        return false;
                    },
                    dragged: function (e) {
                        var pos = $(canvas).offset();
                        var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                        if (!nearest) return false;
                        if (dragged !== null && dragged.node !== null && selected !== null) {
                            var p = sys.fromScreen(s);
                            dragged.node.p = p;
                        }

                        return false;
                    },
                    dropped: function () {
                        if (dragged === null || dragged.node === undefined) return false;
                        if (dragged.node !== null) dragged.node.fixed = false;
                        dragged.node.tempMass = 1000;
                        dragged = null;
                        $(canvas).unbind('mousemove', handler.dragged);
                        $(window).unbind('mouseup', handler.dropped);
                        $(canvas).bind('mousemove', handler.moved);
                        _mouseP = null;
                        return false;
                    },
                    contexmenu: function (e) {
                        e.preventDefault();
                        $('nav#bottonNav > nav.navigation-bar-content .generate').remove();

                        if (!filter_menu_generated) {
                            that.generate_filter_menu();
                            filter_menu_generated = !filter_menu_generated;
                        }

                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                        nearest = dragged = sys.nearest(_mouseP);
                        if (nearest && selected && nearest.node === selected.node) {
                            if (!selected.node.data.NodeVinculo) {
                                var urlPersona = window.fichaPersona + '?id=' + selected.node.name;
                                var selectedPersona = selected.node;

                                bottomNavAddButton('Ver ficha', urlPersona, 'icon-address-book', function () {
                                    window.open(urlPersona);
                                    $('#bottonNav').animate({ height: '-60px' }, 500);
                                });

                                bottomNavAddButton('Eliminar persona', '#', 'icon-link-2', function () {
                                    var edgesFromSelectedPersona = sys.getEdgesFrom(selectedPersona);

                                    edgesFromSelectedPersona.forEach(function (edge) {
                                        if (edge.target.data.NodeVinculo) {
                                            var edgesFromTarget = sys.getEdgesFrom(edge.target);
                                            var edgesToTarget = sys.getEdgesTo(edge.target);
                                            if (edgesFromTarget.length <= 1 && edgesToTarget.length <= 1) {
                                                sys.pruneNode(edge.target);
                                                if (edgesFromTarget.length == 1 && edgesFromTarget[0].target != edge.source) {
                                                    sys.pruneNode(edgesFromTarget[0].target);
                                                }
                                            }
                                        }
                                    });

                                    sys.pruneNode(selectedPersona);
                                    $('#bottonNav').animate({ height: '-60px' }, 500);
                                });
                            } else {
                                var selectedNode = selected.node;
                              
                                bottomNavAddButton('Eliminar enlace', '#', 'icon-link-2', function () {
                                    var edges = sys.getEdgesFrom(selectedNode);
                                    edges.forEach(function (edge) {
                                        if (sys.getEdgesFrom(edge.target).length == 0 && sys.getEdgesTo(edge.target).length <= 1) {
                                            sys.pruneNode(edge.target);
                                        }
                                    });
                                    sys.pruneNode(selectedNode);
                                    $('#bottonNav').animate({ height: '-60px' }, 500);
                                });
                            }
                        }

                        $('a[title]').tooltip();
                        $('#bottonNav').animate({ height: '60px' }, 500);

                    }
                };
                $(canvas).mousedown(handler.clicked);
                $(canvas).mousemove(handler.moved);
                $(canvas).dblclick(handler.dblclicked);
                $(canvas).on('contextmenu', handler.contexmenu);
            },

            pruneNodeDeep: function (node) {
                var edgesFrom = sys.getEdgesFrom(node);

                edgesFrom.forEach(function (edge) {
                    if (prunedNodes.indexOf(edge.target) == -1 && sys.getEdgesTo(edge.target).length < 2 && sys.getEdgesFrom(edge.target).length <= 0) {
                        prunedNodes.push(node);
                        that.pruneNodeDeep(edge.target);
                    }
                });

                sys.pruneNode(node);
            },

            addNodeDeep: function (nodeName, sourceJson) {
                sys.addNode(nodeName, sourceJson.nodes[nodeName]);

                for (var edgeKey in sourceJson.edges) {
                    Object.keys(sourceJson.edges[edgeKey]).forEach(function (key) {
                        if (key === nodeName) {
                            sys.addEdge(edgeKey, nodeName, sourceJson.edges[edgeKey][nodeName]);
                        }
                    });
                }

                Object.keys(sourceJson.edges[nodeName]).forEach(function (key) {
                    sys.addNode(key, sourceJson.nodes[key]);
                    sys.addEdge(nodeName, key, sourceJson.edges[nodeName][key]);
                });
            }
        };

        var my = {
            fixArborJson: function (jsonOld, jsonNew) {
                var newJson = { edges: {}, nodes: {} };
                for (var nodeKey in jsonNew.nodes) {
                    if (Object.keys(jsonOld.nodes).indexOf(nodeKey) < 0) {
                        newJson.nodes[nodeKey] = jsonNew.nodes[nodeKey];
                    }
                }

                newJson.edges = jsonNew.edges;

                for (var edgeOldKey in jsonOld.edges) {
                    for (var edgeNewKey in newJson.edges) {
                        if (Object.keys(newJson.edges[edgeNewKey]).indexOf(edgeOldKey) >= 0 && Object.keys(jsonOld.edges[edgeOldKey]).indexOf(edgeNewKey)) {
                            delete newJson.edges[edgeNewKey][edgeOldKey];
                        }
                    }
                }

                return newJson;
            }
        };

        return that;
    };

    $(document).ready(function () {
        sys.parameters({ stiffness: 512, repulsion: 10000, gravity: true, friction: 0.8, dt: 0.015 });
        sys.renderer = Renderer("#sitemap");

        $("#stopMotion").click(function () {
            var frictionValue = 1;

            if (window.stopedMotion) {
                frictionValue = 0.8;
                window.stopedMotion = !window.stopedMotion;
                sys.start();
                $("#stopMotion").tooltip('option', 'content', 'Anclar nodos');
                $("#stopMotion span").toggleClass("icon-unlocked");
            } else {
                frictionValue = 1;
                window.stopedMotion = !window.stopedMotion;
                sys.stop();
                $("#stopMotion").tooltip('option', 'content', 'Desanclar nodos');
                $("#stopMotion span").toggleClass("icon-unlocked");
            }

            sys.parameters({ stiffness: 512, repulsion: 10000, gravity: true, friction: frictionValue, dt: 0.015 });
            sys.renderer = Renderer("#sitemap");
        });

        $("#addNode").click(function () {
            $.Dialog({
                overlay: true,
                shadow: true,
                flat: true,
                icon: '<span class="icon-plus-2"></span>',
                title: 'Agregar nueva persona v&iacute;nculo',
                content: '',
                width: 400,
                padding: 10,
                onShow: function (_dialog) {
                    var content = _dialog.children('.content');
                    content.html('' +
                        '<div id="form">' +
                            '<label>N&uacute;mero de identidad</label>' +
                            '<div class="input-control text">' +
                                '<input id="txt-ci-add-node" type="text" value="" placeholder="N&uacute;mero de identidad"/>' +
                                '<button id="btn-search-add-node" class="btn-search"></button>' +
                            '</div>' +
                            //'<button class="link place-right">Avanzado</button>' +
                        '</div>' +
                        '<div id="waiting" style="display:none">' +
                            '<div style="top: 50%; left: 50%; position: absolute !important; width: 100%;">' +
                                '<img src="../../Images/progress-indeterminate-light.gif" alt="Cargando..." style="left: -50px; top: -25px; position: absolute !important;" />' +
                            '</div>' +
                        '</div>'
                        );

                    $("#txt-ci-add-node").keypress(function (event) {
                        if (event.which == 13) {
                            my.addNodeProcess();
                        }
                    });

                    $("#btn-search-add-node").click(function () {
                        my.addNodeProcess();
                    });
                }
            });
        });

        var my = {
            addNodeProcess: function () {
                $("#waiting").css("display", "block");
                $("#txt-ci-add-node").attr("disabled", "disabled");

                $.get(window.grafoPersona, { id: $("#txt-ci-add-node").val(), ampliado: true }, function (data) {
                    if (data.success != null && !data.success) {
                        alert("No se encontr&oacute;.");
                        $("#waiting").css("display", "none");
                        $("#txt-ci-add-node").removeAttr("disabled");
                    } else {
                        $.Dialog.close();

                        $.extend(true, jsonSaved, jsonSaved, data);

                        sys.graft(data);

                        filter_menu_generated = false;

                        $('#bottonNav').animate({ height: '-60px' }, 500);
                    }
                });
            },
        };
    });
})(this.jQuery);