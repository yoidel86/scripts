Ext.apply(Ext.form.field.VTypes, {
    daterange: function (val, field) {
        var date = field.parseDate(val);
        if (!date) {
            return false;
        }
        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
            var start = field.ownerCt.down('#' + field.startDateField);
            start.setMaxValue(date);
            start.validate();
            this.dateRangeMax = date;
        }
        else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
            var end = field.ownerCt.down('#' + field.endDateField);
            end.setMinValue(date);
            end.validate();
            this.dateRangeMin = date;
        }
        return true;
    }
});

Ext.define('Sabio.grid.feature.feature.MenuSolr', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.MenuSolr',
    init: function () {
        var me = this,
            view = me.view;
        view.on({
            afterrender: me.afterViewRender,
            scope: me,
            single: true
        });
    },
    afterViewRender: function () {
        var me = this;
        me.injectGroupingMenu();
    },
    injectGroupingMenu: function () {
        var me = this,
            headerCt = me.view.headerCt;

        headerCt.showMenuBy = me.showMenuBy;
        headerCt.getMenuItems = me.getMenuItems();
    },
    showMenuBy: function (t, header) {
        var menu = this.getMenu(),
            solrgroup = header.solrGroup === true,
            treeGroupSolr = menu.down('#treeGroupSolr'),
            treeTermSolr = menu.down('#treeTermSolr'),
            termTextfield = menu.down('#termTextfield'),
            treeTermSolrSel = menu.down('#treeTermSolrSel'),
            dateDesde = menu.down('#dateDesde'),
            dateHasta = menu.down('#dateHasta'),
            sepDate = menu.down('#sepDate'),
            edad = menu.down('#edad'),
            groupTextfield1 = menu.down('#groupTextfield1'),
            emptyValues = menu.down('#emptyValues');
        emptyValues.setChecked(header.emptyValues);
        emptyValues.setVisible(header.empty);
        termTextfield.reset();

        menu.down('#sepEmptyValues').setVisible(header.empty);
        menu.down('#sepTreeGroupSolr').setVisible(solrgroup);

        if (header.emptyValues) {
            treeGroupSolr.disable(false);
            treeTermSolr.disable(false);
            treeTermSolrSel.disable(false);
        } else {
            treeGroupSolr.enable(true);
            treeTermSolr.enable(true);
            treeTermSolrSel.enable(true);
        }
        Ext.grid.header.Container.prototype.showMenuBy.apply(this, arguments);
        termTextfield.setVisible(false);
        treeTermSolr.setVisible(false);
        treeTermSolrSel.setVisible(false);
        menu.down('#sepTreeTermSolrSel').setVisible(false);
        menu.down('#sepTermTextfield').setVisible(false);
        dateDesde.setVisible(false);
        dateHasta.setVisible(false);
        sepDate.setVisible(false);
        edad.setVisible(false);
        treeGroupSolr.setVisible(false);
        groupTextfield1.setVisible(false);
        switch (header.solr) {
            case 'edad':
                edad.setVisible(true);
                edad.setValue(header.edad);
                break;
            case 'date':
                dateDesde.setVisible(true);
                dateHasta.setVisible(true);
                sepDate.setVisible(true);
                dateDesde.setValue(header.valDateDesde);
                dateHasta.setValue(header.valDateHasta);
                dateDesde.setValue(header.valDateDesde);
                dateHasta.setValue(header.valDateHasta);
                break;
            case 'group':
                groupTextfield1.setVisible(true);
                treeGroupSolr.setVisible(true);
                if (header.storeTreeGroupSolr) {
                    treeGroupSolr.bindStore(header.storeTreeGroupSolr);
                    treeGroupSolr.setLoading(false);
                }
                else {
                    treeGroupSolr.setLoading('Cargando');
                    Ext.create('Ext.data.Store', {
                        autoLoad: true,
                        tree: treeGroupSolr,
                        dataIndex: header.dataIndex,
                        proxy: {
                            type: 'ajax',
                            url: window.dirBase + 'Buscador/Group',
                            extraParams: { "modulo": header.modulo, "dataIndex": header.dataIndex, "sort": '', rowCount: '' }
                        },
                        fields: ['s'],
                        listeners: {
                            load: function (me, records, successful) {
                                var tempNode = new Array();
                                tempNode.push({ text: '(Seleccionar todo)', leaf: true, checked: true });
                                if (me.proxy.reader.rawData.responseHeader.status == 0 && successful) {
                                    for (var i = 0; i < me.proxy.reader.rawData.response.docs.length; i++) {
                                        tempNode.push({ text: me.proxy.reader.rawData.response.docs[i][me.dataIndex], leaf: true, checked: true });
                                    }
                                    me.QTime = me.proxy.reader.rawData.responseHeader.QTime;
                                }
                                header.storeTreeGroupSolr = Ext.create('Ext.data.TreeStore', { root: { expanded: true, children: tempNode } });
                                treeGroupSolr.bindStore(header.storeTreeGroupSolr);
                                me.tree.setLoading(false);
                            }
                        }
                    });
                }
                break;
            case 'term':
                var limit = 6;
                if (header.limit)
                    limit = header.limit;
                termTextfield.setVisible(true);
                treeTermSolr.setVisible(true);
                treeTermSolrSel.setVisible(true);
                menu.down('#sepTreeTermSolrSel').setVisible(true);
                menu.down('#sepTermTextfield').setVisible(true);
                if (header.storeTreeTermSolr) treeTermSolr.bindStore(header.storeTreeTermSolr); else {
                    treeTermSolr.setLoading('Cargando');
                    header.storeTreeTermSolr = Ext.create('Ext.data.TreeStore', {
                        ownerTree: treeTermSolr,
                        autoLoad: true,
                        dataIndex: header.dataIndex,
                        header: header,
                        proxy: {
                            type: 'ajax',
                            url: window.dirBase + 'Buscador/term2',
                            extraParams: { "url": "/terms", "modulo": header.modulo, "fl": header.dataIndex,"limit":limit },
                        },
                        fields: ['s'],
                        listeners: {
                            load: function (me, records, successful) {
                                if (me.proxy.reader.rawData.responseHeader.status == 0 && successful) {
                                    if (me.proxy.reader.rawData.terms) {
                                        var treeTermSolr = me.ownerTree;
                                        var tempNode = new Array();
                                        for (var i = 0; i < me.proxy.reader.rawData.terms[me.dataIndex].length; i++) {
                                            tempNode.push({ text: me.proxy.reader.rawData.terms[me.dataIndex][i], leaf: true, checked: false });
                                            i++;
                                        }
                                        var store;
                                        treeTermSolr.bindStore(store = Ext.create('Ext.data.TreeStore', { root: { expanded: true, children: tempNode } }));
                                        me.header.storeTreeTermSolr = store;
                                        treeTermSolr.setLoading(false);
                                    }
                                }
                            }
                        }
                    });
                }
                if (header.storeTreeTermSolrSel) {
                    treeTermSolrSel.bindStore(header.storeTreeTermSolrSel);
                } else {//treeTermSolrSel
                    treeTermSolrSel.setLoading('Cargando');
                    treeTermSolrSel.bindStore(header.storeTreeTermSolrSel = Ext.create('Ext.data.TreeStore', { root: { expanded: true, children: [] } }));
                    treeTermSolrSel.setLoading(false);
                }
                break;
        }
    },
    getMenuItems: function () {
        var me = this,
            getMenuItems = me.view.headerCt.getMenuItems;
        return function () {
            var o = getMenuItems.call(this);
            o.push({
                xtype: 'menuseparator',
                itemId: 'sepEmptyValues'
            }, {
                itemId: 'emptyValues',
                text: 'Elementos sin valor',
                checked: false,
                handler: function (meButton) {
                    meButton.up('menu').ownerButton.emptyValues = meButton.checked;
                    if (meButton.checked) {
                        meButton.up('menu').down('#treeGroupSolr').disable(false);
                        meButton.up('menu').down('#treeTermSolr').disable(false);
                        meButton.up('menu').down('#treeTermSolrSel').disable(false);
                    } else {
                        meButton.up('menu').down('#treeGroupSolr').enable(true);
                        meButton.up('menu').down('#treeTermSolr').enable(true);
                        meButton.up('menu').down('#treeTermSolrSel').enable(true);
                    }
                    meButton.up('menu').up('[name="Osiris.grid.panel.SolrGrid"]').store.loadPage(1);
                },
                scope: me
            }, {
                xtype: 'textfield',
                itemId: 'edad',
                listeners: {
                    'specialkey': function (f, e) {
                        if (e.getKey() == e.ENTER) {
                            this.up('menu').ownerButton.edad = this.getValue();
                            this.up('grid').up('grid').buildFq();
                            this.up('grid').up('grid').store.loadPage(1);
                        }
                    }
                }
            },
            {
                xtype: 'menuseparator',
                itemId: 'sepDate'
            }, {
                xtype: 'datefield',
                emptyText: 'Desde',
                anchor: '100%',
                endDateField: 'dateHasta',
                vtype: 'daterange',
                maxText: 'La fecha inicial debe ser menor que {0}',
                itemId: 'dateDesde',
                format: 'd/m/Y',
                enableKeyEvents: true,
                listeners: {
                    select: function (field) {
                        field.up('menu').ownerButton.valDateDesde = field.getValue();
                        field.up('menu').up('[name="Osiris.grid.panel.SolrGrid"]').store.loadPage(1);
                    },
                    keyup: function (field) {
                        if (field.isValid()) {
                            field.up('menu').ownerButton.valDateDesde = field.getValue();
                            field.up('menu').up('[name="Osiris.grid.panel.SolrGrid"]').store.loadPage(1);
                        }
                    },
                }
            }, {
                xtype: 'datefield',
                emptyText: 'Hasta',
                anchor: '100%',
                format: 'd/m/Y',
                vtype: 'daterange',
                startDateField: 'dateDesde',
                minText: 'La fecha final debe ser mayor que {0}',
                itemId: 'dateHasta',
                enableKeyEvents: true,
                listeners: {
                    select: function (field) {
                        field.up('menu').ownerButton.valDateHasta = field.getValue();
                        field.up('menu').up('[name="Osiris.grid.panel.SolrGrid"]').store.loadPage(1);
                    },
                    keyup: function (field) {
                        if (field.isValid()) {
                            field.up('menu').ownerButton.valDateHasta = field.getValue();
                            field.up('menu').up('[name="Osiris.grid.panel.SolrGrid"]').store.loadPage(1);
                        }
                    },
                }
            }, {
                xtype: 'menuseparator',
                itemId: 'sepTermTextfield'
            }, {
                xtype: 'textfield',
                itemId: 'termTextfield',
                enableKeyEvents: true,
                listeners: {
                    'specialkey': function (f, e) {
                        if (e.getKey() == e.ENTER) {
                            console.log(f);
                            //this.up('menu').ownerButton.basicFq = this.getValue();
                            this.up('menu').down('#treeTermSolrSel').store.root.appendChild({ text: f.getValue(), leaf: true, checked: true });
                            var grid = this.up('grid');
                            if (grid.buildFq) {
                                grid.buildFq();
                                grid.store.loadPage(1);
                            } else {
                                grid.up('grid').buildFq();
                                grid.up('grid').store.loadPage(1);
                            }


                        }
                    },
                    'keyup': function (me) {
                        Ext.create('Ext.data.TreeStore', {
                            padre: this,
                            autoLoad: true,
                            proxy: {
                                type: 'ajax',
                                url: window.dirBase + 'Buscador/term2',
                                extraParams: { "query": me.getValue(), "url": "/terms", "modulo": me.up('menu').ownerButton.modulo, "fl": me.up('menu').ownerButton.dataIndex },
                            },
                            listeners: {
                                load: function (me, records, successful) {
                                    if (me.proxy.reader.rawData.responseHeader.status == 0 && successful) {
                                        if (me.proxy.reader.rawData.terms) {
                                            var treeTermSolr = me.padre.up('menu').down('#treeTermSolr');
                                            var tempNode = new Array();
                                            for (var i = 0; i < me.proxy.reader.rawData.terms[me.padre.up('menu').ownerButton.dataIndex].length; i++) {
                                                var item = Ext.Array.findBy(me.padre.up('menu').down('#treeTermSolrSel').store.root.childNodes, function (a) {
                                                    if (this == a.data.text) {
                                                        return true;
                                                    }
                                                    // ReSharper disable once NotAllPathsReturnValue
                                                }, me.proxy.reader.rawData.terms[me.padre.up('menu').ownerButton.dataIndex][i]);
                                                tempNode.push({ text: me.proxy.reader.rawData.terms[me.padre.up('menu').ownerButton.dataIndex][i], leaf: true, checked: item == null ? false : true });
                                                i++;
                                            }
                                            treeTermSolr.bindStore(Ext.create('Ext.data.TreeStore', { root: { expanded: true, children: tempNode } }));
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            },
            Ext.create('Ext.tree.Panel', {
                width: 200,
                height: 150,
                itemId: 'treeTermSolr',
                frame: true,
                useArrows: true,
                store: Ext.create('Ext.data.TreeStore', { root: { expanded: false, children: [] } }),
                rootVisible: false,
                listeners: {
                    'checkchange': function (node, checked) {
                        var item = Ext.Array.findBy(node.store.ownerTree.up('menu').down('#treeTermSolrSel').store.root.childNodes, function (a) {
                            if ('"' + node.data.text + '"' == a.data.text) {
                                return true;
                            }
                            // ReSharper disable once NotAllPathsReturnValue
                        }, this);
                        if (item == null) {
                            if (checked) {
                                node.store.ownerTree.up('menu').down('#treeTermSolrSel').store.root.appendChild({ text: '"' + node.data.text + '"', leaf: true, checked: true });
                            }
                        } else node.store.ownerTree.up('menu').down('#treeTermSolrSel').store.root.removeChild(item);
                        node.store.ownerTree.up('menu').up('[name="Osiris.grid.panel.SolrGrid"]').store.loadPage(1);
                    }
                }
            }), {
                xtype: 'menuseparator',
                itemId: 'sepTreeTermSolrSel'
            }, Ext.create('Ext.tree.Panel', {
                width: 200,
                height: 150,
                itemId: 'treeTermSolrSel',
                frame: true,
                useArrows: true,
                store: Ext.create('Ext.data.TreeStore', { root: { expanded: false, children: [] } }),
                rootVisible: false,
                listeners: {
                    'checkchange': function (node) {
                        var tree = node.store.ownerTree;
                        var item = Ext.Array.findBy(tree.up('menu').down('#treeTermSolr').store.root.childNodes, function (a) {

                            if (this == '"' + a.data.text + '"') return true;
                            // ReSharper disable once NotAllPathsReturnValue
                        }, node.data.text);
                        if (item != null) {
                            tree.up('menu').down('#treeTermSolr').store.root.replaceChild({ text: item.data.text, leaf: true, checked: false }, item);
                        }

                        node.store.ownerTree.store.root.removeChild(node);
                        tree.up('menu').up('[name="Osiris.grid.panel.SolrGrid"]').store.loadPage(1);
                    }
                }
            }));
            //var treeGroupStore = Ext.create('Ext.data.TreeStore', { root: { expanded: false, children: [] } });
            o.push({
                xtype: 'menuseparator',
                itemId: 'sepTreeGroupSolr'
            },
            //{
            //    xtype: 'textfield',
            //    listeners: {
            //        change: function(field, nv, ov, ev) {

            //        }
            //    }
            //},
             {
                 xtype: 'textfield',
                 itemId: 'groupTextfield1',
                 enableKeyEvents: true,
                 listeners: {
                     'keyup': function (me) {
                         this.up('menu').down('#treeGroupSolr').store.filterBy(function (record) {
                             return record.get('text').toLowerCase().indexOf(me.getValue().toLowerCase()) != -1;
                         });
                     }
                 }
             },
            {
                xtype: 'menuseparator',
                itemId: 'sepTreeGroupSolr'
            },
            Ext.create('Ext.tree.Panel', {
                width: 200,
                height: 150,
                itemId: 'treeGroupSolr',
                frame: true,
                useArrows: true,
                store: Ext.create('Ext.data.TreeStore', { root: { expanded: false, children: [] } }),
                rootVisible: false,
                listeners: {
                    'render': function (meTree) { meTree.setLoading('Cargando'); },
                    'checkchange': function (node, checked) {
                        if (node.data.text == '(Seleccionar todo)') {
                            Ext.Array.each(this.store.root.childNodes, function (name) {
                                name.data.checked = checked;
                            });
                        } else this.store.root.childNodes[0].data.checked = false;
                        this.view.refresh();
                        this.up('[name="Osiris.grid.panel.SolrGrid"]').store.loadPage(1);
                    }
                }
            }));
            return o;
        };
    },
});