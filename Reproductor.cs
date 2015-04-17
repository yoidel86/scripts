using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using Telerik.WinControls.UI.Multimedia;
using System.Diagnostics;
using Telerik.WinControls.UI;
using System.IO;
using System.Reflection;
using Telerik.WinControls;
using Telerik.WinControls.Primitives;
using Telerik.WinControls.Themes;
using NEXMUSIC.Modelo;
using System.Xml;
using Un4seen.Bass;
using Un4seen.Bass.Misc;


namespace NEXMUSIC
{
    public partial class Reproductor : Telerik.WinControls.UI.RadForm
    {
        # region // Propiedades
        public RadPageViewStripElement strip;
        public List<Canal> CanalesDisponibles { get; set; }
        public List<Programacion> Programaciones { get; set; }
        public Cancion cancion;
        public Canal canal;
        public List<Dispositivo> Dispositivos { get; set; }
        public ListaReproduccion SelectedListaReproduccion { get; set; }
        public Programacion SelectedProgramacion { get; set; }

        public da da;
        public bool demo;
        bool shufle_on = false;
        #endregion

        #region //propiedades visuales
        private Un4seen.Bass.BASSTimer _updateTimer = null;
        public static int _stream = 0;
        private int _updateInterval = 50; // 50ms
        private SYNCPROC _sync = null;
        private int _tickCounter = 0;
        private Visuals _vis = new Visuals(); // visuals class instance

        private bool _play = false;

        #endregion

        #region //Constructor de la clase
        public Reproductor(bool demo)
        {
            da = new da(this);
            InitializeComponent();
            loadDevice();
            Closed += ReproductorClosed;
            CargarCanales();
            DisableButtons();
            this.demo = demo;
            _updateTimer = new BASSTimer(_updateInterval);
            _updateTimer.Tick += timerUpdate_Tick;

            _sync = new SYNCPROC(EndPosition);

        }
        #endregion

        #region //Metodos q  devuelven posicion en ListControl

        public int LcProgramacionSelectedIndex()
        {
            return lc_programaciones.SelectedIndex;
        }

        public string lc_ListasSelectedName()
        {
            RadPageViewPage rp = radPagePlayLists.SelectedPage;
            if (rp != null)
                return rp.Text;
            else
                return "";
        }

        public int lc_CanalSelectedIndex()
        {
            return lc_zonas.SelectedIndex;

        }

        #endregion

        #region //Metodos para cargar y guardar en XML

        /*------Funcion para salvar las zonas(canales) creadas en el sistema---------*/
        public void SalvarCanales()
        {
            var documento = new XmlDocument();

            var root = documento.CreateElement("root");

            foreach (var c in CanalesDisponibles)
            {
                root.AppendChild(c.Me(documento));
            }

            foreach (var p in Programaciones)
            {
                root.AppendChild(p.Me(documento));
            }

            documento.AppendChild(root);
            var directorio = Directory.GetCurrentDirectory();
            documento.Save(directorio + "\\data.xml");
        }

        public void CargarCanales()
        {
            CanalesDisponibles = new List<Canal>();
            Programaciones = new List<Programacion>();
            var documento = new XmlDocument();
            var directorio = System.IO.Directory.GetCurrentDirectory();
            documento.Load(directorio + "\\data.xml");




            foreach (XmlElement element in documento.GetElementsByTagName("canal"))
            {
                var c = new Canal(element, this);
                if (c.Device != null)
                    CanalesDisponibles.Add(c);
            }

            foreach (XmlElement element in documento.GetElementsByTagName("programacion"))
            {
                var p = new Programacion(element, this);
                Programaciones.Add(p);
            }

            if (Programaciones.Count != 0)
            {
                SelectedProgramacion = Programaciones[0];
            }

            ActualizarCanales();
            ActualizarProgramacionesListControl();
        }

        #endregion

        #region // Botones del reproductor

        private void stopButton_Click(object sender, EventArgs e)
        {
            var p = da.GetProgramacion();

            if (p == null) return;
            da.GetProgramacion().ListaPorNombre(da.NombreLista()).Stop();
            p.IsPlaying = false;
            p.IsPause = false;
            _updateTimer.Stop();
            playButton.Image = imageList1.Images[0];
            InfoProgramacion();

            /*Para detener stream*/
            //canal = getCanal();
            //canal.Stop();
            /*
            bool stop_button = false;
            if (!stop_button)
            {
                //ImageList imageList1 = new ImageList();
                //imageList1.Images.Add(NEXMUSIC.Properties.Resources.buttonStopDisable);
                //this.stopButton.ImageList = imageList1;
                //this.stopButton.ImageIndex = 0;
                this.stopButton.Image = NEXMUSIC.Properties.Resources.buttonStopDisable1;
                this.stopButton.Enabled = false;
                stop_button = true;
                RadTrackBar radTrackBar1 = new RadTrackBar();
                radTrackBar1.Size = new Size(50, 20);
                radTrackBar1.Maximum = 5;
                
            }       */


        }
        private void setShufle(bool shufleState)
        {
            if (shufleState)
            {
                var list = new ImageList();
                list.Images.Add(NEXMUSIC.Properties.Resources.buttonShuffle);
                shuffleButton.ImageList = list;
                shuffleButton.ImageIndex = 0;
                shufle_on = true;
                SelectedListaReproduccion.IsRandom = true;

                //this.shuffleButton.BackgroundImage = NEXMUSIC.Properties.Resources.buttonShuffle;            
            }
            else
            {
                shuffleButton.Image = NEXMUSIC.Properties.Resources.buttonShuffle;
                shufle_on = false;
                SelectedListaReproduccion.IsRandom = false;
            }
        }

        private void ShuffleButtonClick(object sender, EventArgs e)
        {

            setShufle(!shufle_on);
        }

        /*Poner en play el stream*/
        private void PlayButtonClick(object sender, EventArgs e)
        {
           /****----Codigo del Falco-----****/
            //play un solo tema. tema seleccionado.
            var p = da.GetProgramacion();

            if (p == null) return;
            if (!p.IsPlaying)
            {

                p.IsPlaying = true;
                p.IsPause = false;
                p.ListaPorNombre(da.NombreLista()).Play(da.GetCancion());

                playButton.Image = imageList1.Images[2];

            }
            else
            {
                da.GetProgramacion().ListaPorNombre(da.NombreLista()).Pause();
                p.IsPlaying = false;
                p.IsPause = true;
                _updateTimer.Stop();
                playButton.Image = imageList1.Images[0];
            }
        }

        #endregion

        #region // Metodos actualizar

        /*---------Hecho por mi con ListControl---------------*/
        /*---------Muestra las zonas(canales) creadas en el sistema si existen----------*/
        public void ActualizarCanales()
        {
            lc_zonas.Items.Clear();

            if (CanalesDisponibles.Count == 0)
            {
                radLabel_agregar_zonas.Visible = true;
                radLabel_agregar_zonas.Text = "Para agregar nuevas zonas al sistema haga clic";
                radLabel_aqui.Visible = true;

                // lc_zonas.Controls.Add(radLabel_agregar_zonas);
            }
            else
            {
                /*---Ocultar labels-----*/
                radLabel_agregar_zonas.Visible = false;
                radLabel_aqui.Visible = false;

                /*---Recorrer lista de canales para agregarlos al ListControl----*/
                foreach (var item in CanalesDisponibles)
                {

                    RadListDataItem item1 = new RadListDataItem();
                    item1.Text = "  " + item.ToString();
                    lc_zonas.Items.Add(item1.Text);

                    foreach (var canal in lc_zonas.Items)
                    {
                        canal.Image = NEXMUSIC.Properties.Resources.sound;
                        canal.TextAlignment = ContentAlignment.MiddleLeft;


                    }
                }
            }

            //radPageZonas.Pages.Clear();
            //foreach (var item in CanalesDisponibles)
            //{
            //    RadPageViewPage pageOne = new RadPageViewPage();
            //    pageOne.Text = item.ToString();
            //    ListBox list = new ListBox();
            //    foreach (var item2 in item.Programaciones)
            //    {
            //        list.Items.Add(item2);
            //    }
            //    pageOne.Controls.Add(list);
            //    radPageZonas.Pages.Add(pageOne);

            //}



        }

        /*---------Hecho por mi con ListControl para ver las listas de reproduccion de las programaciones---------------*/

        public void ActualizarPlaylists(bool ordenando = false)
        {

            /*-------Actualizar playlists creando programaticamente un ListControl------------*/

            radPagePlayLists.Pages.Clear();
            
            var programacion = da.GetProgramacion();
            if (programacion != null)
            {

                List<ListaReproduccion> listas_programacion = programacion.listas;
                // RadPageView radpages_playlist = new RadPageView();
                foreach (var item in listas_programacion)
                {
                    RadPageViewItemPage page = new RadPageViewItemPage();
                    page.Text = item.Nombre;
                    RadListControl lc_lista_repro = null;
                    if (item.Rad_List_Control != null&&!ordenando)
                    {
                        lc_lista_repro = item.Rad_List_Control;
                    }
                    else
                    {
                        lc_lista_repro = new RadListControl();
                        lc_lista_repro.Width = /*380*/330;
                        lc_lista_repro.Height = /*351*/295;

                        // lc_lista_repro.Padding = new Padding(0,35,0,0);
                        lc_lista_repro.ThemeName = "Office2010Black";
                        lc_lista_repro.AllowDrop = true;
                        #region codigo nuevo

                        lc_lista_repro.SelectionMode = SelectionMode.MultiExtended;

                        #endregion
                        lc_lista_repro.DragEnter += new DragEventHandler(lc_lista_repro_DragEnter);
                        lc_lista_repro.DragDrop += new DragEventHandler(lc_lista_repro_DragDrop);
                        
                        lc_lista_repro.MouseDoubleClick += new MouseEventHandler(lc_lista_repro_DoubleClick);
                        int contador = 1;
                        foreach (var lista in item.Canciones)
                        {
                            RadListDataItem cancion = new RadListDataItem();
                            cancion.Text = contador + " - " + lista.ToString();
                            if (programacion.Canales.Count > 0)
                            {
                                Canal actualc = programacion.Canales[0];
                                if (lista.Stream == actualc.songStream)
                                {
                                    cancion.ForeColor = Color.Red;
                                    cancion.Text = "<html>" + contador + " - " + lista.ToString() + "</html>";
                                }
                            }

                            cancion.Value = lista;
                            lc_lista_repro.Items.Add(cancion);
                            contador++;
                        }
                        item.Rad_List_Control = lc_lista_repro;
                    }
                    if (lc_lista_repro.Items.Count > 0)
                        lc_lista_repro.SelectedIndex = 0;
                    page.Controls.Add(lc_lista_repro);
                    radPagePlayLists.Pages.Add(page);
                }


            }

            else
            {

                if (Programaciones.Count > 0)
                {
                    List<ListaReproduccion> listas_programacion = Programaciones[0].listas;


                    foreach (var item in listas_programacion)
                    {
                        var page = new RadPageViewItemPage { Text = item.Nombre };

                        var lc_lista_repro = new RadListControl
                                                 {
                                                     Width = 320,
                                                     Height = 305,
                                                     ThemeName = "Office2010Black",
                                                     AllowDrop = true,
                                                     SelectionMode = SelectionMode.MultiExtended
                                                 };

                        #region codigo nuevo

                        #endregion
                        lc_lista_repro.DragEnter += lc_lista_repro_DragEnter;
                        int contador = 1;
                        foreach (var cancion in item.Canciones)
                        {
                            var c = new RadListDataItem(cancion.ToString(), cancion);

                            if (cancion.Stream == _stream)
                            {

                                c.Text = "<html><em>" + contador + " - " + cancion.ToString() + "</em></html>";
                                c.ForeColor = Color.Red;
                            }
                            else
                                c.Text = contador + " - " + cancion.ToString();
                            lc_lista_repro.Items.Add(c);
                            contador++;
                        }

                        page.Controls.Add(lc_lista_repro);
                        radPagePlayLists.Pages.Add(page);
                    }
                    lc_programaciones.SelectedIndex = 0;
                    
                    //  lc_programaciones.SelectedItem = lc_programaciones.Items[0];
                }
            }

        }

        void lc_lista_repro_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            throw new NotImplementedException();
        }

        void lc_lista_repro_DragDrop(object sender, DragEventArgs e)
        {
            var listas = da.GetListaReproduccion();
            var lista = sender as RadListControl;
            var objects = e.Data.GetData("FileDrop", true);
            if (objects != null)
                foreach (var variable in objects as string[])
                {
                    var c = new Cancion(variable);
                    listas.Canciones.Add(c);

                    RadListDataItem cancion = new RadListDataItem(lista.Items.Count + " - " + c.ToString(), c);
                    lista.Items.Add(cancion);
                    SalvarCanales();
                }
            ActualizarListIndex();
        }

        void lc_lista_repro_DoubleClick(object sender, MouseEventArgs e)
        {
            stopButton_Click(null, null);
            PlayButtonClick(null, null);
        }


        /*---------Hecho por mi con ListControl para ver las programaciones---------------*/

        public void ActualizarProgramacionesListControl()
        {
            if (lc_zonas.Items.Count == 0)
            {
                //MessageBox.Show("Test");
                radLabel_programaciones.Visible = true;
                radLabel_programaciones_aqui.Visible = false;
                radLabel_programaciones.Text = "Es necesario crear las zonas del sistema primeramente para luego crear programaciones.";
                radLabel_programaciones.ForeColor = Color.Black;
            }
            else
            {
                //lc_programaciones.Items.Clear();
                if (Programaciones.Count == 0)
                {
                    lc_programaciones.Items.Clear();
                   // MessageBox.Show("pincho");
                    radLabel_programaciones.Visible = true;
                    radLabel_programaciones.Text = "Para agregar una programación al sistema haga clic ";
                    radLabel_programaciones.ForeColor = Color.Black;
                    radLabel_programaciones.Cursor = Cursors.Default;
                    /*--- este label esta inicializado Visible = false en sus propiedades-------*/
                    radLabel_programaciones_aqui.Visible = true;


                }
                else
                {
                    lc_programaciones.Items.Clear();

                    radLabel_programaciones.Visible = false;
                    radLabel_programaciones_aqui.Visible = false;
                    radPagePlayLists.Enabled = true;
                    foreach (var programacion in Programaciones)
                    {
                        RadListDataItem item1 = new RadListDataItem();
                        item1.Text = "  " + programacion;
                        lc_programaciones.Items.Add(item1.Text);
                    }

                    foreach (var item in lc_programaciones.Items)
                    {
                        item.Image = Properties.Resources.sound;
                        item.TextAlignment = ContentAlignment.MiddleLeft;
                    }
                }

            }
        }

        public Programacion ProgramacionPorNombre(string nombre)
        {
            foreach (var item in Programaciones)
            {
                if (item.Nombre == nombre) return item;
            }
            return null;
        }

        public RadListControl LcCanales()
        { return lc_zonas; }

        public RadListControl LcProgramaciones()
        { return lc_programaciones; }

        #endregion

        #region //Eventos utilizados

        /*----Load de la forma---*/
        private void Form1_Load(object sender, EventArgs e)
        {
            //ThemeResolutionService.LoadPackageResource("NEXMUSIC.Resources.MediaPlayerBlackPageView.tssp");
            //this.playButton.ThemeName = "MediaPlayerBlackPageView.tssp";
            this.muteButton.ImageIndex = 3;
            //ActualizarPlaylists();

            this.strip = this.radPagePlayLists.ViewElement as RadPageViewStripElement;

            if (Programaciones != null)
            {
                foreach (var programacion in Programaciones)
                {
                    programacion.Play();
                }
            }
            else MessageBox.Show("No existen programaciones.");

        }

        /*----Al cerrar la app se guarda la informacion----*/
        void ReproductorClosed(object sender, EventArgs e)
        {
            SalvarCanales();
        }

        /*------Evento q sucede cuando haces clic en un elememto del LC de programaciones----------*/
        private void lc_programaciones_SelectedIndexChanged(object sender, Telerik.WinControls.UI.Data.PositionChangedEventArgs e)
        {
            if (lc_programaciones.SelectedIndex > -1)
            {
                ActualizarPlaylists();

            }
            var programacion = da.GetProgramacion();

            if (programacion != null)
            {
                SelectedProgramacion = programacion;
                SelectedListaReproduccion = da.GetListaReproduccion();
                InfoProgramacion();
                //si hay algun tema reproduciendose, sino no va a efectuarse nada.)
                // if(programacion.IsPlaying){
                if (programacion.Canales.Count == 1)
                {
                    tbVolumen.Enabled = true;
                    tbVolumen.Value = (int)(programacion.Canales[0].volumen * 100);

                }
                else
                {
                    //si hay mas de un canal no se hace nada tampoco.
                    tbVolumen.Enabled = false;
                }


                // }

                da.SeleccionarCanales(programacion.Canales);

                if (!Bucle)
                {
                    Bucle = true;
                    da.Seleccionar(da.GetProgramacion());

                }


                //cambiar los valores de los labels de programaciones.
                if (programacion != null)
                {
                    rl_name_prog.Text = programacion.Nombre;
                    rl_ini_prog.Text = programacion.HoraInicio().ToShortTimeString();
                    rl_fin_prog.Text = programacion.HoraFin().ToShortTimeString();
                }


            }
        }

        private bool _bucle = false;
        public bool Bucle { get { return _bucle; } set { _bucle = value; } }


        /*------Muestra la informacion de la programacion seleccionada----------*/
        public void InfoProgramacion()
        {
            if (SelectedProgramacion != null)
            {
                if (SelectedProgramacion.IsPlaying)
                {
                    playButton.Image = imageList1.Images[2];
                }
                else
                {
                    playButton.Image = imageList1.Images[0];
                    //limpio label nombre cancion
                    labelTime.Text = "";
                } if (SelectedProgramacion.Canales.Count > 0)
                {
                    _stream = SelectedProgramacion.Canales[0].streamPlayed;
                    if (_stream != 0)
                    {
                        _updateTimer.Start();
                        // get some channel info
                        BASS_CHANNELINFO info = new BASS_CHANNELINFO();
                        Bass.BASS_ChannelGetInfo(_stream, info);
                        //ActualizarPlaylists();
                    }
                }else
                {
                    labelTime.Text = "";
                    _stream = 0;
                    LabelTimeElapsed.Text = "";
                    DrawWavePosition(-1, -1);
                    pictureBoxSpectrum.Image = null;
                }
                if (SelectedListaReproduccion != null)
                {
                    setShufle(SelectedListaReproduccion.IsRandom);
                }
            }
        }
        /*------Llena la lista de reproduccion ----------*/
        //TODO
        //ARREGLAR EL DRAG A DROP INTERNO.
        /// <summary>
        /// EVENTO QUE LLENA LA LISTA DE REPRODUCCION
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void lc_lista_repro_DragEnter(object sender, DragEventArgs e)
        {
            e.Effect = DragDropEffects.Copy;
            /*
            var listas = da.GetListaReproduccion();
            var lista = sender as RadListControl;
            var objects = e.Data.GetData("FileDrop", true);
            foreach (var VARIABLE in objects as string[])
            {
                var c = new Cancion(VARIABLE);
                listas.Canciones.Add(c);

                RadListDataItem cancion = new RadListDataItem(lista.Items.Count + " - " + c.ToString(), c);
                lista.Items.Add(cancion);
                SalvarCanales();
            }
            ActualizarListIndex();*/
        }

        public void ActualizarListIndex()
        {
            var nombreLista = radPagePlayLists.SelectedPage.Text;
            var lista = (radPagePlayLists.SelectedPage.Controls[0] as RadListControl);
            var contador = 1;
            foreach (var item in lista.Items)
            {
                item.Text = contador + " - " + item.Text.Substring(contador.ToString().Length + 3, item.Text.Length - (contador.ToString().Length + 3));
                contador++;
            }
        }


        // DEVUELVE LAS LISTAS DE REPRODUCCION
        public RadPageView RadPagePlayLists()
        {
            return radPagePlayLists;
        }
        public RadListControl getRadListControlsPlayLists()
        {
            var selected = radPagePlayLists.SelectedPage;
            if (selected != null)
            {
                if (selected.Controls.Count > 0)
                {
                    var control = selected.Controls[0];
                    if (control is RadListControl)
                    {
                        return control as RadListControl;
                    }
                }
            }
            return null;
        }
        /*---------Formulario para crear zonas----------------*/
        private void btn_nueva_zona_Click(object sender, EventArgs e)
        {
            //loadDevice();
            var ad = new Nueva_zona(this);

            ad.ShowDialog();
            ActualizarCanales();
            ActualizarProgramacionesListControl();
            SalvarCanales();
        }

        /*----Evento que lanza la forma para crear una nueva zona desde un label-----*/
        private void radLabel_aqui_Click(object sender, EventArgs e)
        {
            var zona = new Nueva_zona(this);
            zona.ShowDialog();
            ActualizarCanales();
            ActualizarProgramacionesListControl();
            SalvarCanales();
        }

        /*----Evento que lanza la forma para crear una nueva programacion desde un label-----*/
        private void radLabel_programaciones_aqui_Click(object sender, EventArgs e)
        {
            var programacion = new Nueva_programacion(this);
            programacion.ShowDialog();
            ActualizarProgramacionesListControl();
            // SalvarCanales();
        }

        private void radPagePlayLists_NewPageRequested(object sender, EventArgs e)
        {
            if (lc_programaciones.SelectedIndex != -1)
            {
                //se guarda el index de lc_programaciones para luego devolverselo
                //despues de creada la lista
                var index = LcProgramacionSelectedIndex();
                Nueva_lista_reproduccion l = new Nueva_lista_reproduccion(this);
                l.ShowDialog();
                ////se devuelve el indice a lc_programaciones
                lc_programaciones.SelectedIndex = index;
            }
            else
                return;

        }

        private void radPagePlayLists_PageAdded(object sender, RadPageViewEventArgs e)
        {
            //MessageBox.Show("Test");
        }

        private void btn_crear_programacion_Click(object sender, EventArgs e)
        {
            if (CanalesDisponibles.Count == 0)
            {
                RadMessageBox.SetThemeName("Office2010Black");
                if (RadMessageBox.Show(this, "\nDebe crear primeramente una zona. ¿Desea crear una zona?", "Atención", MessageBoxButtons.OKCancel, RadMessageIcon.Info) == DialogResult.OK)
                {
                    var ad = new Nueva_zona(this);
                    ad.ShowDialog();
                    ActualizarCanales();
                    ActualizarProgramacionesListControl();
                }
            }
            else
            {
                var nueva_programacion = new Nueva_programacion(this);
                nueva_programacion.ShowDialog();
                ActualizarProgramacionesListControl();
            }
        }

        private void radPagePlayLists_SelectedPageChanged(object sender, EventArgs e)
        {

        }

        private void btn_nueva_zona_MouseHover(object sender, EventArgs e)
        {
            Cambiar_tooltip_and_cursor(btn_nueva_zona, "Agregar zonas al sistema");
        }

        private void radPagePlayLists_MouseClick(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Right)
            {
                // RadPageView rp = (RadPageView)sender;
                Point p = (sender as Control).PointToScreen(e.Location);
                RadContextMenu menu = new RadContextMenu();
                // rp.ContextMenu = menu; 
                menu.Show(p.X, p.Y);
                menu.ThemeName = "Office2010Black";

                RadMenuItem item = new RadMenuItem();
                item.Text = "Cambiar nombre";
                item.Image = NEXMUSIC.Properties.Resources.edit20x20;
                menu.Items.Add(item);
                menu.Items[0].Click += RadMenuItemClick;

                RadMenuItem item1 = new RadMenuItem();
                item1.Text = "Agregar lista";
                item1.Image = NEXMUSIC.Properties.Resources.edit20x20;
                menu.Items.Add(item1);
                menu.Items[1].Click += RadMenuItemClickLista;

            }


        }

        private void RadMenuItemClick(object sender, EventArgs e)
        {
            var index = LcProgramacionSelectedIndex();
            Renombrar r = new Renombrar(this);
            r.ShowDialog();
            lc_programaciones.SelectedIndex = index;

        }

        public void RadMenuItemClickLista(object sender, EventArgs e)
        {
            var index = LcProgramacionSelectedIndex();
            Nueva_lista_reproduccion l = new Nueva_lista_reproduccion(this);
            l.ShowDialog();
            lc_programaciones.SelectedIndex = index;
        }

        private void radPagePlayLists_PageRemoved(object sender, RadPageViewEventArgs e)
        {
            var p = da.GetProgramacion();
            if (p != null)
            {
                var l = da.GetListaReproduccion(e.Page.Text);
                //MessageBox.Show(l.Nombre);
                //p.listas.Remove(l);
            }
        }

        private void radPagePlayLists_PageRemoving(object sender, RadPageViewCancelEventArgs e)
        {
        }

        private void btn_eliminarzona_Click(object sender, EventArgs e)
        {

            if (lc_zonas.SelectedIndex != -1)
            {
                RadMessageBox.SetThemeName("Office2010Black");
                if (RadMessageBox.Show(this, "\nSi elimina esta zona todas las programaciones asociadas a ella se afectarán.", "Atención", MessageBoxButtons.OKCancel, RadMessageIcon.Exclamation) == DialogResult.OK)
                {

                    var index = lc_zonas.SelectedIndex;
                    var nombre = lc_zonas.SelectedItem.Text;
                    string name = nombre.Substring(2);

                    var c = ByName(name);
                    var disp = c.Device;
                    disp.EliminarCanal(c);

                    foreach (var p in Programaciones)
                    {
                        if (p.Canales.Contains(c))
                        {
                            p.Canales.Remove(c);
                            foreach (var lista in p.listas)
                            {
                                if (lista.Canal.Count == 1)
                                    lista.Stop();
                                lista.Canal.Remove(c);
                                lista.IsPaused = false;
                            }
                            p.IsPause = false;
                            p.IsPlaying = false;
                            playButton.Image = imageList1.Images[0];
                        }
                        
                    }

                    c.Stop();
                    CanalesDisponibles.RemoveAt(index);
                    ActualizarCanales();
                    ActualizarProgramacionesListControl();

                }
            }
            else
            {
                RadMessageBox.SetThemeName("Office2010Black");
                RadMessageBox.Show(this, "\nDebe seleccionar una zona a eliminar.", "Atención", MessageBoxButtons.OK, RadMessageIcon.Info);

            }
        }

        /// <summary>
        ///Eventos que cambian tooltips de los botones de zonas y programacion
        ///en dependencia de si existen elementos o no en el sistema 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void btn_crear_programacion_MouseHover(object sender, EventArgs e)
        {
            if (CanalesDisponibles.Count != 0)
                Cambiar_tooltip_and_cursor(btn_crear_programacion, "Agregar programación", Cursors.Hand);
            else
                Cambiar_tooltip_and_cursor(btn_crear_programacion, "Debe crear primeramente una zona para luego crear una programación", Cursors.No);
        }

        private void btn_eliminarzona_MouseHover(object sender, EventArgs e)
        {
            if (CanalesDisponibles.Count == 0)
                Cambiar_tooltip_and_cursor(btn_eliminarzona, "No existen zonas para eliminar", Cursors.No);
            else
                Cambiar_tooltip_and_cursor(btn_eliminarzona, "Eliminar zona", Cursors.Hand);

        }

        private void btn_editar_zona_MouseHover(object sender, EventArgs e)
        {
            if (CanalesDisponibles.Count == 0)
                Cambiar_tooltip_and_cursor(btn_editar_zona, "No existen zonas para editar", Cursors.No);
            else
                Cambiar_tooltip_and_cursor(btn_editar_zona, "Editar zona", Cursors.Hand);
        }

        private void btn_editar_prog_MouseHover(object sender, EventArgs e)
        {
            if (CanalesDisponibles.Count == 0)
                Cambiar_tooltip_and_cursor(btn_editar_programacion, "No existen programaciones para editar", Cursors.No);
            else
                Cambiar_tooltip_and_cursor(btn_editar_programacion, "Editar programación", Cursors.Hand);
        }

        /*--------Metodos sobrecargados para cambiar Tooltips y cursor a controles---------*/
        public void Cambiar_tooltip_and_cursor(Control control, string caption)
        {
            toolTip1.SetToolTip(control, caption);
        }

        public void Cambiar_tooltip_and_cursor(Control control, string caption, Cursor cursor)
        {
            toolTip1.SetToolTip(control, caption);
            control.Cursor = cursor;
        }
        #endregion

        #region // Controladora (Metodos utiles)

        /*----Metodo para crear canal-----*/
        public void Crear_canal(Canal c)
        {
            CanalesDisponibles.Add(c);
            ActualizarCanales();
        }


        /*-----Metodo para editar nombre de una zona---*/
        public void Editar_nombre_zona(string nombre)
        {
            Canal c = da.GetCanal();
            c.Alias = nombre;
            ActualizarCanales();
        }

        /*-----Metodo para editar nombre de una lista---*/
        public void Editar_nombre_lista(string nombre)
        {
            // Programacion p = da.GetProgramacion();
            ListaReproduccion lista = da.GetListaReproduccion();
            lista.Nombre = nombre;
            ActualizarPlaylists();
        }


        /// <summary>
        /// Devuelve una lista con los canales que aun no estan asigandos a ninguna programacion.
        /// </summary>
        /// <returns></returns>
        /// 
        public List<Canal> Canales_libres()
        {
            List<Canal> canales_libres = new List<Canal>();
            foreach (var c in CanalesDisponibles)
            {
                if (c.Programacion == "" || c.Programacion == null)
                    canales_libres.Add(c);
            }

            return canales_libres;
        }

        /*------Retorna el canal con el nombre pasado-------*/
        public Canal ByName(string canalName)
        {
            foreach (var c in CanalesDisponibles)
            {
                if (c.Alias == canalName)
                    return c;
            }
            return null;
        }

        /*----Retorna los canales que usa una programacion-----*/
        public List<Canal> CanalesProgramacion(string nombre)
        {
            var canales = new List<Canal>();
            foreach (var c in CanalesDisponibles)
            {
                if (c.Programacion == nombre)
                    canales.Add(c);
            }
            return canales;
        }

        /*---- Comprueba si existe una programacion con el igual nombre al pasado----*/
        public bool ComprobarNombreProgramacion(string nombre)
        {
            return !Programaciones.Any(p => p.Nombre == nombre);
        }

        /*--------Permite determinar los dispostivos existentes en el pc---------*/
        void loadDevice()
        {
            Dispositivos = new List<Dispositivo>();
            // Bass.BASS_Init(1, 44100, BASSInit.BASS_DEVICE_DEFAULT, System.IntPtr.Zero);
            BASS_DEVICEINFO info = new BASS_DEVICEINFO();
            for (int n = 0; Bass.BASS_GetDeviceInfo(n, info); n++)
            {
                if (!info.ToString().Equals("No Sound", StringComparison.InvariantCultureIgnoreCase))
                {
                    //MessageBox.Show(info.ToString());
                    Dispositivos.Add(new Dispositivo()
                    {
                        NombreDispositivo = info.ToString(),
                        NoDispositivo = n
                    });
                }
            }

        }

        /*--------Metodo para crear y agregar una pagina nueva a RadPageview-------*/
        public void Crear_page(string nombre_pagina)
        {
            RadPageViewStripElement strip = this.radPagePlayLists.ViewElement as RadPageViewStripElement;
            RadPageViewPage page = new RadPageViewPage();
            page.Text = nombre_pagina;
            this.radPagePlayLists.Pages.Add(page);
            this.radPagePlayLists.SelectedPage = page;
            this.radPagePlayLists.ViewElement.EnsureItemVisible(this.strip.NewItem);

        }

        /*----Metodo que permite saber si la app es un demo o no----*/
        public bool Is_Trial()
        {
            return demo;
        }



        #endregion

        #region // Metodos Visuales

        private void EndPosition(int handle, int channel, int data, IntPtr user)
        {
            Bass.BASS_ChannelStop(channel);
        }

        private void timerUpdate_Tick(object sender, System.EventArgs e)
        {
            // here we gather info about the stream, when it is playing...
            if (Bass.BASS_ChannelIsActive(_stream) == BASSActive.BASS_ACTIVE_PLAYING)
            {
                // the stream is still playing...
                if (da.GetCancion(_stream) != null)
                {
                    labelTime.Text = da.GetCancion(_stream).ToString();
                    labelTime.Left -= 1;
                    if (labelTime.Left < -325)
                        labelTime.Left = 325;
                }
                else
                {
                    return;
                }

            }
            else
            {
                // the stream is NOT playing anymore...
                _updateTimer.Stop();
                // this.progressBarPeakLeft.Value = 0;
                //    this.progressBarPeakRight.Value = 0;
                LabelTimeElapsed.Text = @"Stopped";
                DrawWavePosition(-1, -1);
                this.pictureBoxSpectrum.Image = null;
                //this.buttonStop.Enabled = false;
                //this.buttonPlay.Enabled = true;
                return;
            }

            // from here on, the stream is for sure playing...
            _tickCounter++;
            long pos = Bass.BASS_ChannelGetPosition(_stream); // position in bytes
            long len = Bass.BASS_ChannelGetLength(_stream); // length in bytes

            if (_tickCounter == 5)
            {
                // display the position every 250ms (since timer is 50ms)
                _tickCounter = 0;
                double totaltime = Bass.BASS_ChannelBytes2Seconds(_stream, len); // the total time length
                double elapsedtime = Bass.BASS_ChannelBytes2Seconds(_stream, pos); // the elapsed time length
                LabelTimeElapsed.Text = String.Format("{0:#0.00}", Utils.FixTimespan(elapsedtime, "MMSS"));

                //this.Text = String.Format("Bass-CPU: {0:0.00}% (not including Waves & Spectrum!)", Bass.BASS_GetCPU());
            }

            // display the level bars
            int peakL = 0;
            int peakR = 0;
            // for testing you might also call RMS_2, RMS_3 or RMS_4
            RMS(_stream, out peakL, out peakR);
            // level to dB
            double dBlevelL = Utils.LevelToDB(peakL, 65535);
            double dBlevelR = Utils.LevelToDB(peakR, 65535);
            //RMS_2(_stream, out peakL, out peakR);
            //RMS_3(_stream, out peakL, out peakR);
            //RMS_4(_stream, out peakL, out peakR);
            // this.progressBarPeakLeft.Value = peakL;
            // this.progressBarPeakRight.Value = peakR;

            // update the wave position
            DrawWavePosition(pos, len);
            // update spectrum
            DrawSpectrum();
        }
        private int _30mslength = 0;
        private float[] _rmsData = new float[14];     // our global data buffer used at RMS
        private void RMS(int channel, out int peakL, out int peakR)
        {
            float maxL = 0f;
            float maxR = 0f;
            int length = _30mslength; // 30ms window already set at buttonPlay_Click
            int l4 = length / 4; // the number of 32-bit floats required (since length is in bytes!)



            // Note: this is a special mechanism to deal with variable length c-arrays.
            // In fact we just pass the address (reference) to the first array element to the call.
            // However the .Net marshal operation will copy N array elements (so actually fill our float[]).
            // N is determined by the size of our managed array, in this case N=l4
            length = Bass.BASS_ChannelGetData(channel, _rmsData, length);

            l4 = length / 4; // the number of 32-bit floats received
            // increase our data buffer as needed
            if (_rmsData == null || _rmsData.Length < l4)
                _rmsData = new float[l4];

            for (int a = 0; a < l4; a++)
            {
                float absLevel = Math.Abs(_rmsData[a]);
                // decide on L/R channel
                if (a % 2 == 0)
                {
                    // L channel
                    if (absLevel > maxL)
                        maxL = absLevel;
                }
                else
                {
                    // R channel
                    if (absLevel > maxR)
                        maxR = absLevel;
                }
            }

            // limit the maximum peak levels to +6bB = 0xFFFF = 65535
            // the peak levels will be int values, where 32767 = 0dB!
            // and a float value of 1.0 also represents 0db.
            peakL = (int)Math.Round(32767f * maxL) & 0xFFFF;
            peakR = (int)Math.Round(32767f * maxR) & 0xFFFF;
        }
        #endregion


        #region Spectrum

        private int specIdx = 15;
        private int voicePrintIdx = 0;
        private void DrawSpectrum()
        {
            switch (specIdx)
            {
                // normal spectrum (width = resolution)
                case 0:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrum(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.Lime, Color.Red, Color.Transparent, false, false, false);
                    break;
                // normal spectrum (full resolution)
                case 1:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrum(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.SteelBlue, Color.Pink, Color.Transparent, false, true, true);
                    break;
                // line spectrum (width = resolution)
                case 2:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumLine(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.Lime, Color.Red, Color.Transparent, 2, 2, false, false, false);
                    break;
                // line spectrum (full resolution)
                case 3:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumLine(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.SteelBlue, Color.Pink, Color.Transparent, 16, 4, false, true, true);
                    break;
                // ellipse spectrum (width = resolution)
                case 4:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumEllipse(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.Lime, Color.Red, Color.Transparent, 1, 2, false, false, false);
                    break;
                // ellipse spectrum (full resolution)
                case 5:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumEllipse(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.SteelBlue, Color.Pink, Color.Transparent, 2, 4, false, true, true);
                    break;
                // dot spectrum (width = resolution)
                case 6:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumDot(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.Lime, Color.Red, Color.Transparent, 1, 0, false, false, false);
                    break;
                // dot spectrum (full resolution)
                case 7:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumDot(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.SteelBlue, Color.Pink, Color.Transparent, 2, 1, false, false, true);
                    break;
                // peak spectrum (width = resolution)
                case 8:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumLinePeak(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.SeaGreen, Color.LightGreen, Color.Orange, Color.Transparent, 2, 1, 2, 10, false, false, false);
                    break;
                // peak spectrum (full resolution)
                case 9:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumLinePeak(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.GreenYellow, Color.RoyalBlue, Color.DarkOrange, Color.Transparent, 23, 5, 3, 5, false, true, true);
                    break;
                // wave spectrum (width = resolution)
                case 10:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumWave(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.Yellow, Color.Orange, Color.Transparent, 1, false, false, false);
                    break;
                // dancing beans spectrum (width = resolution)
                case 11:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumBean(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.Chocolate, Color.DarkGoldenrod, Color.Transparent, 4, false, false, true);
                    break;
                // dancing text spectrum (width = resolution)
                case 12:
                    this.pictureBoxSpectrum.Image = _vis.CreateSpectrumText(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.White, Color.Tomato, Color.Transparent, "NextMusic IS GREAT PIECE! CODEPRODUCTIONS ROCK...", false, false, true);
                    break;
                // frequency detection
                case 13:
                    float amp = _vis.DetectFrequency(_stream, 10, 500, true);
                    if (amp > 0.3)
                        this.pictureBoxSpectrum.BackColor = Color.Red;
                    else
                        this.pictureBoxSpectrum.BackColor = Color.Transparent;
                    break;
                // 3D voice print
                case 14:
                    // we need to draw directly directly on the picture box...
                    // normally you would encapsulate this in your own custom control
                    Graphics g = Graphics.FromHwnd(this.pictureBoxSpectrum.Handle);
                    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                    _vis.CreateSpectrum3DVoicePrint(_stream, g, new Rectangle(0, 0, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height), Color.Transparent, Color.White, voicePrintIdx, false, false);
                    g.Dispose();
                    // next call will be at the next pos
                    voicePrintIdx++;
                    if (voicePrintIdx > this.pictureBoxSpectrum.Width - 1)
                        voicePrintIdx = 0;
                    break;
                // WaveForm
                case 15:
                    this.pictureBoxSpectrum.Image = _vis.CreateWaveForm(_stream, this.pictureBoxSpectrum.Width, this.pictureBoxSpectrum.Height, Color.Green, Color.Red, Color.Gray, Color.Black, 1, true, false, true);
                    break;
            }
        }

        private void pictureBoxSpectrum_MouseDown(object sender, System.Windows.Forms.MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
                specIdx++;
            else
                specIdx--;

            if (specIdx > 15)
                specIdx = 0;
            if (specIdx < 0)
                specIdx = 15;
            //this.labelVis.Text = String.Format("{0} of 16 (click L/R mouse to change)", specIdx + 1);
            this.pictureBoxSpectrum.Image = null;
            _vis.ClearPeaks();
        }


        #endregion Spectrum

        #region Wave Form

        // zoom helper varibales
        private bool _zoomed = false;
        private int _zoomStart = -1;
        private long _zoomStartBytes = -1;
        private int _zoomEnd = -1;
        private float _zoomDistance = 5.0f; // zoom = 5sec.
        private int _deviceLatencyBytes = 0; // device latency in bytes
        private string _fileName = String.Empty;
        private Un4seen.Bass.Misc.WaveForm WF2 = null;
        private void GetWaveForm()
        {
            // unzoom...(display the whole wave form)
            _zoomStart = -1;
            _zoomStartBytes = -1;
            _zoomEnd = -1;
            _zoomed = false;
            // render a wave form
            WF2 = new WaveForm(this._fileName, new WAVEFORMPROC(MyWaveFormCallback), this);
            WF2.FrameResolution = 0.01f; // 10ms are nice
            WF2.CallbackFrequency = 2000; // every 30 seconds rendered (3000*10ms=30sec)
            WF2.ColorBackground = Color.WhiteSmoke;
            WF2.ColorLeft = Color.Gainsboro;
            WF2.ColorLeftEnvelope = Color.Gray;
            WF2.ColorRight = Color.LightGray;
            WF2.ColorRightEnvelope = Color.DimGray;
            WF2.ColorMarker = Color.DarkBlue;
            WF2.DrawWaveForm = WaveForm.WAVEFORMDRAWTYPE.Stereo;
            WF2.DrawMarker = WaveForm.MARKERDRAWTYPE.Line | WaveForm.MARKERDRAWTYPE.Name | WaveForm.MARKERDRAWTYPE.NamePositionAlternate;
            WF2.MarkerLength = 0.75f;
            // our playing stream will be in 32-bit float!
            // but here we render with 16-bit (default) - just to demo the WF2.SyncPlayback method
            WF2.RenderStart(true, BASSFlag.BASS_DEFAULT);
        }

        private void MyWaveFormCallback(int framesDone, int framesTotal, TimeSpan elapsedTime, bool finished)
        {
            if (finished)
            {
                Console.WriteLine("Finished rendering in {0}sec.", elapsedTime);
                Console.WriteLine("FramesRendered={0} of {1}", WF2.FramesRendered, WF2.FramesToRender);
                // eg.g use this to save the rendered wave form...
                //WF.WaveFormSaveToFile( @"C:\test.wf" );

                // auto detect silence at beginning and end
                long cuein = 0;
                long cueout = 0;
                WF2.GetCuePoints(ref cuein, ref cueout, -25.0, -42.0, -1, -1);
                WF2.AddMarker("CUE", cuein);
                WF2.AddMarker("END", cueout);
            }
            // will be called during rendering...
            DrawWave();
        }

        private void pictureBox1_Resize(object sender, System.EventArgs e)
        {
            DrawWave();
        }

        private void DrawWave()
        {
            if (WF2 != null)
                this.pictureBox1.BackgroundImage = WF2.CreateBitmap(this.pictureBox1.Width, this.pictureBox1.Height, _zoomStart, _zoomEnd, true);
            else
                this.pictureBox1.BackgroundImage = null;
        }

        private void DrawWavePosition(long pos, long len)
        {
            // Note: we might take the latency of the device into account here!
            // so we show the position as heard, not played.
            // That's why we called Bass.Bass_Init with the BASS_DEVICE_LATENCY flag
            // and then used the BASS_INFO structure to get the latency of the device

            if (len == 0 || pos < 0)
            {
                this.pictureBox1.Image = null;
                return;
            }

            Bitmap bitmap = null;
            Graphics g = null;
            Pen p = null;
            double bpp = 0;

            try
            {
                if (_zoomed)
                {
                    // total length doesn't have to be _zoomDistance sec. here
                    len = WF2.Frame2Bytes(_zoomEnd) - _zoomStartBytes;

                    int scrollOffset = 10; // 10*20ms = 200ms.
                    // if we scroll out the window...(scrollOffset*20ms before the zoom window ends)
                    if (pos > (_zoomStartBytes + len - scrollOffset * WF2.Wave.bpf))
                    {
                        // we 'scroll' our zoom with a little offset
                        _zoomStart = WF2.Position2Frames(pos - scrollOffset * WF2.Wave.bpf);
                        _zoomStartBytes = WF2.Frame2Bytes(_zoomStart);
                        _zoomEnd = _zoomStart + WF2.Position2Frames(_zoomDistance) - 1;
                        if (_zoomEnd >= WF2.Wave.data.Length)
                        {
                            // beyond the end, so we zoom from end - _zoomDistance.
                            _zoomEnd = WF2.Wave.data.Length - 1;
                            _zoomStart = _zoomEnd - WF2.Position2Frames(_zoomDistance) + 1;
                            if (_zoomStart < 0)
                                _zoomStart = 0;
                            _zoomStartBytes = WF2.Frame2Bytes(_zoomStart);
                            // total length doesn't have to be _zoomDistance sec. here
                            len = WF2.Frame2Bytes(_zoomEnd) - _zoomStartBytes;
                        }
                        // get the new wave image for the new zoom window
                        DrawWave();
                    }
                    // zoomed: starts with _zoomStartBytes and is _zoomDistance long
                    pos -= _zoomStartBytes; // offset of the zoomed window

                    bpp = len / (double)this.pictureBox1.Width;  // bytes per pixel
                }
                else
                {
                    // not zoomed: width = length of stream
                    bpp = len / (double)this.pictureBox1.Width;  // bytes per pixel
                }

                // we take the device latency into account
                // Not really needed, but if you have a real slow device, you might need the next line
                // so the BASS_ChannelGetPosition might return a position ahead of what we hear
                pos -= _deviceLatencyBytes;

                p = new Pen(Color.Red);
                bitmap = new Bitmap(this.pictureBox1.Width, this.pictureBox1.Height);
                g = Graphics.FromImage(bitmap);
                g.Clear(Color.Black);
                int x = (int)Math.Round(pos / bpp);  // position (x) where to draw the line
                g.DrawLine(p, x, 0, x, this.pictureBox1.Height - 1);
                bitmap.MakeTransparent(Color.Black);
            }
            catch
            {
                bitmap = null;
            }
            finally
            {
                // clean up graphics resources
                if (p != null)
                    p.Dispose();
                if (g != null)
                    g.Dispose();
            }

            this.pictureBox1.Image = bitmap;
        }

        private void buttonZoom_Click(object sender, System.EventArgs e)
        {
            if (WF2 == null)
                return;

            // WF is not null, so the stream must be playing...
            if (_zoomed)
            {
                // unzoom...(display the whole wave form)
                _zoomStart = -1;
                _zoomStartBytes = -1;
                _zoomEnd = -1;
            }
            else
            {
                // zoom...(display only a partial wave form)
                long pos = Bass.BASS_ChannelGetPosition(_stream);
                // calculate the window to display
                _zoomStart = WF2.Position2Frames(pos);
                _zoomStartBytes = WF2.Frame2Bytes(_zoomStart);
                _zoomEnd = _zoomStart + WF2.Position2Frames(_zoomDistance) - 1;
                if (_zoomEnd >= WF2.Wave.data.Length)
                {
                    // beyond the end, so we zoom from end - _zoomDistance.
                    _zoomEnd = WF2.Wave.data.Length - 1;
                    _zoomStart = _zoomEnd - WF2.Position2Frames(_zoomDistance) + 1;
                    _zoomStartBytes = WF2.Frame2Bytes(_zoomStart);
                }
            }
            _zoomed = !_zoomed;
            // and display this new wave form
            DrawWave();
        }

        private void pictureBox1_MouseDown(object sender, System.Windows.Forms.MouseEventArgs e)
        {
            if (WF2 == null)
                return;

            long pos = WF2.GetBytePositionFromX(e.X, this.pictureBox1.Width, _zoomStart, _zoomEnd);
            Bass.BASS_ChannelSetPosition(_stream, pos);
        }

        #endregion
        public void DisableButtons()
        {
            if (CanalesDisponibles.Count == 0)
            {

                //toolTip1.SetToolTip(btn_crear_programacion, "Debe crear primeramente una zona para luego crear una programación");

                //btn_eliminarzona.Cursor = Cursors.No;
                //Cambiar_tooltip(btn_eliminarzona, "Debe crear primeramente una zona para luego crear una programación");
                //toolTip1.SetToolTip(btn_eliminarzona, "Debe crear primeramente una zona para luego crear una programación");
            }
        }

        private void RadPagePlayListsSelectedPageChanged1(object sender, EventArgs e)
        {
            if (((RadPageView)sender).SelectedPage != null)
            {
                var prog = da.GetProgramacion();
                var lista = prog.ListaPorNombre(((RadPageView)sender).SelectedPage.Text);
                if (lista != null)
                {
                    SelectedListaReproduccion = lista;
                    lb_inicio.Text = lista.horaInicio.ToShortTimeString();
                    lb_fin.Text = lista.horaFin.ToShortTimeString();
                    lb_total_canciones.Text = lista.Canciones.Count.ToString();

                    var duracion = lista.Canciones.Where(c => c.Duracion != null).Sum(c => double.Parse(c.Duracion));

                    lb_duracion_total.Text = Utils.FixTimespan(duracion, "HHMMSS");
                }
            }
        }


        void ItemClick(object sender, EventArgs e)
        {
            da.EliminarCancionesSeleccionadas();
        }

        private void RadbtnEliminarCancionMouseClick(object sender, MouseEventArgs e)
        {

            var p = ((Control)sender).PointToScreen(e.Location);
            var menu = new RadContextMenu();
            menu.Show(p.X, p.Y);
            menu.ThemeName = "Office2010Black";

            var item = new RadMenuItem { Text = "Eliminar seleccionados" };
            //item.Image = NEXMUSIC.Properties.Resources.edit20x20;
            item.Click += ItemClick;
            menu.Items.Add(item);

            var todas = new RadMenuItem { Text = "Eliminar defectuosas" };
            //item.Image = NEXMUSIC.Properties.Resources.edit20x20;
            todas.Click += DefectuosasClick;
            menu.Items.Add(todas);

            var defectuosas = new RadMenuItem { Text = "Eliminar todas" };
            //item.Image = NEXMUSIC.Properties.Resources.edit20x20;
            defectuosas.Click += TodasClick;
            menu.Items.Add(defectuosas);
        }

        void DefectuosasClick(object sender, EventArgs e)
        {
            da.EliminarCancionesDefectuosas();
        }

        void TodasClick(object sender, EventArgs e)
        {
            da.EliminarCanciones();
        }

        private void LcZonasSelectedIndexChanged(object sender, Telerik.WinControls.UI.Data.PositionChangedEventArgs e)
        {
            
            if (!Bucle)
            {
                Bucle = true;

                da.Seleccionar(da.GetCanal());
                Canal c = da.GetCanal();
                if (c != null)
                {
                    tbVolumen.Enabled = true;
                    tbVolumen.Value = (int)(c.volumen * 100);
                }

            }
        }

        private void LcZonasClick(object sender, EventArgs e)
        {
            var pos = lc_zonas.SelectedIndex;
            Bucle = true;
            foreach (var item in lc_zonas.Items)
            {
                item.Selected = false;
            }
            Bucle = false;

            //if ((e as MouseEventArgs).Button == MouseButtons.Right)
            //{
            //    if (pos != -1)
            //    {
            //        lc_zonas.SelectedIndex = pos;
            //        // var pos = lc_zonas.SelectedIndex;
            //        //  MessageBox.Show(pos.ToString());
            //        Point p = (sender as Control).PointToScreen((e as MouseEventArgs).Location);
            //        RadContextMenu menu = new RadContextMenu();
            //        menu.Show(p.X, p.Y);
            //        menu.ThemeName = "Office2010Black";

            //        RadMenuItem item = new RadMenuItem();
            //        item.Text = "Cambiar nombre";
            //        item.Image = NEXMUSIC.Properties.Resources.edit20x20;
            //        menu.Items.Add(item);
            //       // menu.Items[0].Click += ZonaItemClick;
            //    }
            //}
            
        }

        private void ZonaItemClick(object sender, MouseEventArgs e)
        {
            Renombrar_zona z = new Renombrar_zona(this);
            z.ShowDialog();
        }
        


        private void LcProgramacionesClick(object sender, EventArgs e)
        {
            Programacion programacion = da.GetProgramacion();
            if (!Bucle)
            {
                if (programacion != null)
                {
                    Bucle = true;
                    da.Seleccionar(programacion);

                    if (programacion.Canales.Count == 1)
                    {
                        tbVolumen.Enabled = true;
                    }
                    else
                    {
                        tbVolumen.Enabled = false;
                    }
                }
            }
        }

        /*-----Metodo que muestra menu para ordenar una lista de reproduccion--------*/
        private void RadOrdenarPlaylistMouseClick(object sender, MouseEventArgs e)
        {
            if (e.Button == System.Windows.Forms.MouseButtons.Left)
            {
                var p = ((Control)sender).PointToScreen(e.Location);
                var menu = new RadContextMenu();
                menu.Show(p.X, p.Y);
                menu.ThemeName = "Office2010Black";

                var item3 = new RadMenuItem();
                item3.Text = "Ordenar por Título";
                //item.Image = NEXMUSIC.Properties.Resources.edit20x20;
                item3.Click += Item3Click;
                menu.Items.Add(item3);

                var item1 = new RadMenuItem();
                item1.Text = "Ordenar por Artista";
                //item.Image = NEXMUSIC.Properties.Resources.edit20x20;
                item1.Click += Item1Click;
                menu.Items.Add(item1);

                var item2 = new RadMenuItem();
                item2.Text = "Ordenar por Duración";
                //item.Image = NEXMUSIC.Properties.Resources.edit20x20;
                item2.Click += Item2Click;
                menu.Items.Add(item2);
            }
            //else
            //{
            //    Item3Click(sender, e);
            //}
        }

        void Item2Click(object sender, EventArgs e)
        {
            //orden por duracion.
            //orden por titulo.
            Cancion cancionSeleccionada = null;
            if (da.GetCancion() != -1)
            {
                //cancion para marcar luego de ordenar.
                cancionSeleccionada = da.GetListaReproduccion().Canciones[da.GetCancion()];
            }
            var lista = da.GetListaReproduccion();
            if (lista != null)
            {
                lista.Canciones.Sort((p, q) => double.Parse(p.Duracion).CompareTo(double.Parse(q.Duracion)));
                ActualizarPlaylists(true);
            }
            if (cancionSeleccionada != null)
            {
                var posicion = lista.Canciones.IndexOf(cancionSeleccionada);
                ((RadListControl)radPagePlayLists.SelectedPage.Controls[0]).SelectedIndex = posicion;
            }
        }

        void Item1Click(object sender, EventArgs e)
        {
            //orden por artista.
            //orden por titulo.
            Cancion cancionSeleccionada = null;
            if (da.GetCancion() != -1)
            {
                //cancion para marcar luego de ordenar.
                cancionSeleccionada = da.GetListaReproduccion().Canciones[da.GetCancion()];
            }
            var lista = da.GetListaReproduccion();
            if (lista != null)
            {
                lista.Canciones.Sort((p, q) => p.Artist.CompareTo(q.Artist));
                ActualizarPlaylists(true);
            }
            if (cancionSeleccionada != null)
            {
                var posicion = lista.Canciones.IndexOf(cancionSeleccionada);
                ((RadListControl)radPagePlayLists.SelectedPage.Controls[0]).SelectedIndex = posicion;
            }
        }

        //Orden por titulo en lista reproduccion
        void Item3Click(object sender, EventArgs e)
        {

            //orden por titulo.
            Cancion cancionSeleccionada = null;
            if (da.GetCancion() != -1)
            {
                //cancion para marcar luego de ordenar.
                cancionSeleccionada = da.GetListaReproduccion().Canciones[da.GetCancion()];
            }
            var lista = da.GetListaReproduccion();
            if (lista != null)
            {
                lista.Canciones.Sort((p, q) => p.Nombre.CompareTo(q.Nombre));
                ActualizarPlaylists(true);
            }
            if (cancionSeleccionada != null)
            {
                var posicion = lista.Canciones.IndexOf(cancionSeleccionada);
                (radPagePlayLists.SelectedPage.Controls[0] as RadListControl).SelectedIndex = posicion;
            }
        }

        private void lc_zonas_SelectedValueChanged(object sender, EventArgs e)
        {

        }

        private void TbVolumenScroll(object sender, EventArgs e)
        {
            Canal c = da.GetCanal();
            if (c != null)
                c.setVolumen(tbVolumen.Value);
        }

        private void TextBox1TextChanged(object sender, EventArgs e)
        {
            if (textBox1.Text != "")
            {
                if (radPagePlayLists.SelectedPage != null)
                {
                    foreach (var item in ((RadListControl)radPagePlayLists.SelectedPage.Controls[0]).Items)
                    {

                        item.Selected = false;
                    }

                    foreach (var item in ((RadListControl)radPagePlayLists.SelectedPage.Controls[0]).Items)
                    {
                        if (item.Text.ToLower().Contains(textBox1.Text.ToLower()))
                            item.Selected = true;
                    }
                }
            }
            else
            {
                if (radPagePlayLists.SelectedPage != null)
                {
                    foreach (var item in ((RadListControl)radPagePlayLists.SelectedPage.Controls[0]).Items)
                    {
                        item.Selected = false;
                    }
                }
            }
        }

        private void TextBox1Click(object sender, EventArgs e)
        {
            ((TextBox)sender).Text = "";
            if (textBox1 != sender)
                textBox1.Text = "Búsqueda rápida.";
            if (textBox2 != sender)
                textBox2.Text = "Búsqueda rápida.";
            if (textBox3 != sender)
                textBox3.Text = "Búsqueda rápida.";
        }

        private void TextBox2TextChanged(object sender, EventArgs e)
        {
            if (textBox2.Text != "")
            {

                foreach (var item in lc_programaciones.Items)
                {
                    item.Selected = false;
                }

                foreach (var item in lc_programaciones.Items)
                {
                    if (item.Text.ToLower().Contains(textBox2.Text.ToLower()))
                        item.Selected = true;
                }

            }
            else
            {
                if (radPagePlayLists.SelectedPage != null)
                {
                    foreach (var item in lc_programaciones.Items)
                    {

                        item.Selected = false;
                    }
                }
            }
        }

        private void TextBox3TextChanged(object sender, EventArgs e)
        {
            if (textBox3.Text != "")
            {

                foreach (var item in lc_zonas.Items)
                {
                    item.Selected = false;
                }

                foreach (var item in lc_zonas.Items)
                {
                    if (item.Text.ToLower().Contains(textBox3.Text.ToLower()))
                        item.Selected = true;
                }

            }
            else
            {
                if (radPagePlayLists.SelectedPage != null)
                {
                    foreach (var item in lc_zonas.Items)
                    {

                        item.Selected = false;
                    }
                }
            }
        }

        /*-----Metodo que permite pasar a la lista anterior del reproductor--------*/
        private void RpLastListMouseClick(object sender, MouseEventArgs e)
        {
            var pos = 0;
            for (var i = 0; i < radPagePlayLists.Pages.Count; i++)
            {
                var page = radPagePlayLists.Pages[i];
                if (page != radPagePlayLists.SelectedPage) continue;
                pos = i;
                break;
            }
            if (pos > 0)
                radPagePlayLists.SelectedPage = radPagePlayLists.Pages[pos - 1];
        }


        /*-----Metodo que permite pasar a la siguiente lista del reproductor--------*/
        private void RpNextListMouseClick(object sender, MouseEventArgs e)
        {
            var pos = 0;
            for (var i = 0; i < radPagePlayLists.Pages.Count; i++)
            {
                var page = radPagePlayLists.Pages[i];
                if (page != radPagePlayLists.SelectedPage) continue;
                pos = i;
                break;
            }
            if (pos < radPagePlayLists.Pages.Count - 1)
                radPagePlayLists.SelectedPage = radPagePlayLists.Pages[pos + 1];
        }


        /*-----Metodo que permite pasar a la cancion anterior--------*/
        private void RbCancionAnteriorMouseClick(object sender, MouseEventArgs e)
        {
            var p = da.GetProgramacion();
            if (p != null && p.IsPlaying)
            {
                da.GetProgramacion().ListaPorNombre(da.NombreLista()).AnteriorCancion();
            }


        }

        /*-----Metodo que permite pasar a la proxima cancion--------*/
        private void RbCancionProximaMouseClick(object sender, MouseEventArgs e)
        {
            var p = da.GetProgramacion();
            if (p != null && p.IsPlaying)
            {
                da.GetProgramacion().ListaPorNombre(da.NombreLista()).ProximaCancion();
            }

        }


       /*---------Editar zona---------------------*/
        private void btn_editar_zona_Click(object sender, EventArgs e)
        {
            if (lc_zonas.SelectedIndex != -1)
            {
                Renombrar_zona renombrar = new Renombrar_zona(this);
                renombrar.ShowDialog();
            }
            else 
            {
                RadMessageBox.SetThemeName("Office2010Black");
                RadMessageBox.Show(this, "\nDebe seleccionar la zona a editar.", "Atención", MessageBoxButtons.OK, RadMessageIcon.Info);
            }
            
        }

        private void btn_editar_programacion_Click(object sender, EventArgs e)
        {
            if (lc_programaciones.SelectedIndex!= -1)
            {
                var pos_seleccionada = lc_programaciones.SelectedIndex;
                Editar_prog edit = new Editar_prog(this);
                edit.ShowDialog();
                ActualizarProgramacionesListControl();
                lc_programaciones.SelectedIndex = pos_seleccionada;
            }
            else
            {
                RadMessageBox.SetThemeName("Office2010Black");
                RadMessageBox.Show(this, "\nDebe seleccionar la programación a editar.", "Atención", MessageBoxButtons.OK, RadMessageIcon.Info);
            }
        }

        private void btn_eliminar_prog_Click(object sender, EventArgs e)
        {
            if (lc_programaciones.SelectedIndex != -1)
            {
                var pos = lc_programaciones.SelectedIndex;
                var canales = Programaciones[pos].Canales;
                RadMessageBox.SetThemeName("Office2010Black");
                if (RadMessageBox.Show(this, "\nAl eliminar esta programación la(s) zona(s) asociada(s) a ella quedarán libres y todas sus listas de reproducción serán eliminadas.\n¿Desea eliminar esta programción? ", "Atención", MessageBoxButtons.OKCancel, RadMessageIcon.Exclamation) == DialogResult.OK)
                {
                    Programaciones.RemoveAt(pos);
                    foreach (var canal in canales)
                    {
                        canal.Stop();
                        canal.Programacion = "";
                        playButton.Image = imageList1.Images[0];
                    }
                    ActualizarProgramacionesListControl();
                    ActualizarCanales();
                    if (Programaciones.Count != 0)
                        lc_programaciones.SelectedIndex = 0;
                }
            }
            else
            {
                RadMessageBox.SetThemeName("Office2010Black");
                RadMessageBox.Show(this, "\nDebe seleccionar la programación a eliminar.", "Atención", MessageBoxButtons.OK, RadMessageIcon.Info);
            }
        }

       


        /// <summary>
        /// evento que permite mostrar un menu al hacer clic sobre
        /// un elemento del listcontrol de ZONAS
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        //private void lc_zonas_MouseClick(object sender, MouseEventArgs e)
        //{
        //    //var pos1 = lc_zonas.SelectedIndex;
        //    //MessageBox.Show(pos1.ToString());
        //   //Point p1 = (sender as Control).PointToScreen(e.Location);
        //   //MessageBox.Show("X:" + p1.X.ToString() + "Y:" + p1.Y.ToString());

           
        //   // RadListControl lc = (RadListControl)sender;
        //   // var pos = lc.SelectedIndex;
        //    //if (lc_zonas.SelectedIndex == -1)
        //    //{

        //    //}
        //    //else
        //    //{
        //      //  var pos_seleccionada = lc_zonas.SelectedIndex;
        //        if (e.Button == MouseButtons.Right)
        //        {
        //            var pos = lc_zonas.SelectedIndex;
        //            MessageBox.Show(pos.ToString());
        //            Point p = (sender as Control).PointToScreen(e.Location);
        //            RadContextMenu menu = new RadContextMenu();
        //            menu.Show(p.X, p.Y);
        //            menu.ThemeName = "Office2010Black";

        //            RadMenuItem item = new RadMenuItem();
        //            item.Text = "Cambiar nombre";
        //            item.Image = NEXMUSIC.Properties.Resources.edit20x20;
        //            menu.Items.Add(item);
        //            menu.Items[0].Click += RadMenuItemClick;

        //        }
        //   // }

        //    //if (e.Button == MouseButtons.Right)
        //    //   {
        //    //       // RadPageView rp = (RadPageView)sender;
        //    //       Point p = (sender as Control).PointToScreen(e.Location);
        //    //       RadContextMenu menu = new RadContextMenu();
        //    //       // rp.ContextMenu = menu; 
        //    //       menu.Show(p.X, p.Y);
        //    //       menu.ThemeName = "Office2010Black";

        //    //       RadMenuItem item = new RadMenuItem();
        //    //       item.Text = "Cambiar nombre";
        //    //       item.Image = NEXMUSIC.Properties.Resources.edit20x20;
        //    //       menu.Items.Add(item);
        //    //       menu.Items[0].Click += RadMenuItemClick;

        //    //       RadMenuItem item1 = new RadMenuItem();
        //    //       item1.Text = "Agregar lista";
        //    //       item1.Image = NEXMUSIC.Properties.Resources.edit20x20;
        //    //       menu.Items.Add(item1);
        //    //       menu.Items[1].Click += RadMenuItemClickLista;

        //}



      


    }
}
