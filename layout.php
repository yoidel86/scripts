<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <?php include_http_metas() ?>
    <?php include_metas() ?>
    <?php include_title() ?>
    <link rel="shortcut icon" href="/favicon.ico" />
    <?php include_stylesheets() ?>
    <?php include_javascripts() ?>
  </head>
  <body>
      <div id="art-page-background-simple-gradient">
    </div>
    <div id="art-page-background-glare">
        <div id="art-page-background-glare-image"></div>
    </div>
    <div id="art-main">
        <div class="art-Sheet">
            <div class="art-Sheet-tl"></div>
            <div class="art-Sheet-tr"></div>
            <div class="art-Sheet-bl"></div>
            <div class="art-Sheet-br"></div>
            <div class="art-Sheet-tc"></div>
            <div class="art-Sheet-bc"></div>
            <div class="art-Sheet-cl"></div>
            <div class="art-Sheet-cr"></div>
            <div class="art-Sheet-cc"></div>
            <div class="art-Sheet-body">
                <div class="art-Header">
                    <div class="art-Header-png"></div>
                    <div class="art-Header-jpeg"></div>
                    <div class="art-Logo">
                        <h1 id="name-text" class="art-Logo-name"><a href="#">Gestion de Indicadores </a></h1>
                        <div id="slogan-text" class="art-Logo-text">MEDICIÓN DE LA ACTIVIDAD DE CIENCIA Y TÉCNICA</div>
                    </div>
                </div>
                <div class="art-nav">
                	<div class="l"></div>
                	<div class="r"></div>
                	<ul class="art-menu">
                		<li>
                			<a href="#" class=" active"><span class="l"></span><span class="r"></span><span class="t">Home</span></a>
                		</li>
                		<li>
                			<a href="#"><span class="l"></span><span class="r"></span><span class="t">Gestión de Indicadores</span></a>
                			<ul>
                				<li><a href="#">Premios</a>
                					<ul>
                						<li><a href="<?php echo url_for('premios/index'); ?>">Gestionar Premios</a></li>
                						<li><a href="<?php echo url_for('categoriapremio/index'); ?>">Categorías por Premios</a></li>
                						<li><a href="<?php echo url_for('tipopremio/index'); ?>">Tipos de Premios</a></li>
                                                                <li><a href="<?php echo url_for('margenpesopremio/index'); ?>">Márgenes por Categoría</a></li>
                                                                <li><a href="<?php echo url_for('categoriatipopremios/index'); ?>">Ponderación Categoría-Tipo</a></li>
                					</ul>
                				</li>
                				<li><a href="#">Publicaciones</a>
                					<ul>
                						<li><a href="<?php echo url_for('publicaciones/index'); ?>">Gestionar Publicaciones</a></li>
                						<li><a href="<?php echo url_for('tipopublicacion/index'); ?>">Tipo de Publicación</a></li>
                                                                <li><a href="<?php echo url_for('margenpesopublicacion/index'); ?>">Márgenes por Categoría</a></li>

                					</ul>
                				</li>
                 				<li><a href="#">Patentes y Registros</a>
                					<ul>
                						<li><a href="<?php echo url_for('patentes/index'); ?>">Gestionar Patentes y Registros</a></li>
                						<li><a href="<?php echo url_for('tipopatente/index'); ?>">Tipo de Patentes y Registros</a></li>
                                                                <li><a href="<?php echo url_for('margenpesopatentes/index'); ?>">Margenes por Categoria</a></li>
                					</ul>
                				</li>
                                                <li><a href="#">Proyectos Financiados</a>
                					<ul>
                						<li><a href="<?php echo url_for('proyecto/index'); ?>">Gestionar Proyectos Financiados</a></li>
                						<li><a href="<?php echo url_for('tipoproyecto/index'); ?>">Tipos de Proyectos</a></li>
                                                                <li><a href="<?php echo url_for('margenpesoproyecto/index'); ?>">Márgenes por Categoría</a></li>
                					</ul>
                				</li>
                                            <li><a href="#">Resultados Introducidos</a>
                					<ul>
                						<li><a href="<?php echo url_for('resultadosintroducidos/index'); ?>">Resultados Introducidos</a></li>
                						<li><a href="<?php echo url_for('Dimensionp/index'); ?>">Dimensión de Proyectos</a></li>
                                                                <li><a href="<?php echo url_for('margenpesoresultadosi/index'); ?>">Márgenes por Dimensión</a></li>
                					</ul>
                				</li>
                                            <li><a href="#">Trabajos Presentados</a>
                					<ul>
                						<li><a href="<?php echo url_for('trabajospresentados/index'); ?>">Gestionar Trabajos Presentados</a></li>
                						<li><a href="<?php echo url_for('tipoevento/index'); ?>">Tipos de eventos</a></li>
                                                                <li><a href="<?php echo url_for('margenpesoeventos/index'); ?>">Márgenes por Tipos de Eventos</a></li>
                					</ul>
                				</li>

                			</ul>
                		</li>
                		<li>
                			<a href="#"><span class="l"></span><span class="r"></span><span class="t">About</span></a>
                		</li>
                	</ul>
                </div>
                <div class="art-contentLayout">
                    <div class="art-sidebar1">
                        <div class="art-Block">
                            <div class="art-Block-tl"></div>
                            <div class="art-Block-tr"></div>
                            <div class="art-Block-bl"></div>
                            <div class="art-Block-br"></div>
                            <div class="art-Block-tc"></div>
                            <div class="art-Block-bc"></div>
                            <div class="art-Block-cl"></div>
                            <div class="art-Block-cr"></div>
                            <div class="art-Block-cc"></div>
                            <div class="art-Block-body">
                                        <div class="art-BlockHeader">
                                            <div class="l"></div>
                                            <div class="r"></div>
                                            <div class="art-header-tag-icon">
                                                <div class="t">Contenido</div>
                                            </div>
                                        </div><div class="art-BlockContent">
                                            <div class="art-BlockContent-body">
                                                <div><form method="get" id="newsletterform" action="javascript:void(0)">
                                                <input type="text" value="" name="email" id="s" style="width: 95%;" />
                                                <span class="art-button-wrapper">
                                                	<span class="l"> </span>
                                                	<span class="r"> </span>
                                                	<input class="art-button" type="submit" name="search" value="Subscribe" />
                                                </span>

                                                </form></div>
                                        		<div class="cleared"></div>
                                            </div>
                                        </div>
                        		<div class="cleared"></div>
                            </div>
                        </div>
                        <div class="art-Block">
                            <div class="art-Block-tl"></div>
                            <div class="art-Block-tr"></div>
                            <div class="art-Block-bl"></div>
                            <div class="art-Block-br"></div>
                            <div class="art-Block-tc"></div>
                            <div class="art-Block-bc"></div>
                            <div class="art-Block-cl"></div>
                            <div class="art-Block-cr"></div>
                            <div class="art-Block-cc"></div>
                            <div class="art-Block-body">
                                        <div class="art-BlockHeader">
                                            <div class="l"></div>
                                            <div class="r"></div>
                                            <div class="art-header-tag-icon">
                                                <div class="t">Contenido</div>
                                            </div>
                                        </div><div class="art-BlockContent">
                                            <div class="art-BlockContent-body">
                                                <div>



                                                                  </div>
                                        		<div class="cleared"></div>
                                            </div>
                                        </div>
                        		<div class="cleared"></div>
                            </div>
                        </div>
                        <div class="art-Block">
                            <div class="art-Block-tl"></div>
                            <div class="art-Block-tr"></div>
                            <div class="art-Block-bl"></div>
                            <div class="art-Block-br"></div>
                            <div class="art-Block-tc"></div>
                            <div class="art-Block-bc"></div>
                            <div class="art-Block-cl"></div>
                            <div class="art-Block-cr"></div>
                            <div class="art-Block-cc"></div>
                            <div class="art-Block-body">
                                        <div class="art-BlockHeader">
                                            <div class="l"></div>
                                            <div class="r"></div>
                                            <div class="art-header-tag-icon">
                                                <div class="t">Contenido</div>
                                            </div>
                                        </div><div class="art-BlockContent">
                                            <div class="art-BlockContent-body">

                                        		<div class="cleared"></div>
                                            </div>
                                        </div>
                        		<div class="cleared"></div>
                            </div>
                        </div>
                    </div>
                    <div class="art-content">
                        <div class="art-Post">
                            <div class="art-Post-tl"></div>
                            <div class="art-Post-tr"></div>
                            <div class="art-Post-bl"></div>
                            <div class="art-Post-br"></div>
                            <div class="art-Post-tc"></div>
                            <div class="art-Post-bc"></div>
                            <div class="art-Post-cl"></div>
                            <div class="art-Post-cr"></div>
                            <div class="art-Post-cc"></div>
                            <div class="art-Post-body">
                        <div class="art-Post-inner">

                                        <div class="art-PostContent">

                                        <?php echo $sf_content ?>
                                          


                                        </div>
                                        <div class="cleared"></div>
                        </div>

                        		<div class="cleared"></div>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="cleared"></div><div class="art-Footer">
                    <div class="art-Footer-inner">

                        <div class="art-Footer-text">
                            <p><a href="#">Contacenos</a> | <a href="#">Terminos de uso</a>
                               <br />
                                UCI &copy; 2012 ---. Todos los derechos reservados.</p>
                        </div>
                    </div>
                    <div class="art-Footer-background"></div>
                </div>
        		<div class="cleared"></div>
            </div>
        </div>
        <div class="cleared"></div>

    </div>


  </body>
</html>
