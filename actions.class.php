<?php

/**
 * Area actions.
 *
 * @package    gestindicadores
 * @subpackage Area
 * @author     Your name here
 * @version    SVN: $Id: actions.class.php 23810 2009-11-12 11:07:44Z Kris.Wallsmith $
 */
class AreaActions extends sfActions
{
 /**
  * Executes index action
  *
  * @param sfRequest $request A request object
  */
  public function executeIndex(sfWebRequest $request)
  {
     $idfacultad = $this->getRequestParameter("idfacultad",1);
     $criteria = new Criteria();
     $criteria->add(AreaPeer::IDFACULTAD,$idfacultad);
     $this->areas = AreaPeer::doSelect($criteria);
   // $this->forward('default', 'module');
  }
   public function executeBalancepremios(sfWebRequest $request)
  {
     $id = $this->getRequestParameter("idarea");
     $area = AreaPeer::retrieveByPK($id);
     $balancepremios= $area->getBalancePremios();
     $cant = count($balancepremios);
     $cont = 0;
     $json = "{root:[";
     foreach ($balancepremios as $key => $value) {
         $ids = split(":", $key);
         $json .= "{ID:'".$cont++."',";
         $json .= "Categorias:'".CategoriapPeer::retrieveByPK($ids[0])."',";
         $json .= "Descripcion:'".TipopPeer::retrieveByPK($ids[1])."',";
         $json .= "Cantidad:".$value."}";
     }
$json.="]";
$json.=",count:{$cant}}";
$json = str_replace("}{", "},{", $json);

//$prueba = "{root:[{ID:48,Categorias:'Premios otorgados en el FORUM de CT',Descripcion:'Relevantes ',Cantidad:0},{ID:49,Categorias:'Premios otorgados en el FORUM de CT',Descripcion:'Destacados ',Cantidad:0},{ID:50,Categorias:'Premios otorgados en el FORUM de CT',Descripcion:'Menciones ',Cantidad:0}],count:51}";
return $this->renderText($json);
   // $this->forward('default', 'module');*/
  }

   public function executeBalancepublicaciones(sfWebRequest $request)
  {
       $id = $this->getRequestParameter("idarea",1);
     $area = AreaPeer::retrieveByPK($id);
     $balancepremios= $area->getBalancePublicaciones();
     $cant = count($balancepremios);
     $json = "{root:[";
     foreach ($balancepremios as $key => $value) {
         $json .= "{ID:'".$key."',";
         $json .= "Categorias:'Publicaciones Cientificas',";
         $json .= "Descripcion:'".TpublicacionPeer::retrieveByPK($key)."',";
         $json .= "Cantidad:".$value."}";
     }
    $json.="]";
    $json.=",count:{$cant}}";
    $json = str_replace("}{", "},{", $json);
    return $this->renderText($json);
   // $this->forward('default', 'module');
  }
   public function executeBalancepatentes(sfWebRequest $request)
  {
    $area = AreaPeer::doSelectOne(new Criteria());
     $balancepremios= $area->getBalancePatentes();
     $cant = count($balancepremios);
     $json = "{root:[";
     foreach ($balancepremios as $key => $value) {
         $json .= "{ID:'".$key."',";
         $json .= "Categorias:'Patentes y Registros',";
         $json .= "Descripcion:'".TipopatentePeer::retrieveByPK($key)."',";
         $json .= "Cantidad:".$value."}";
     }
    $json.="]";
    $json.=",count:{$cant}}";
    $json = str_replace("}{", "},{", $json);
    return $this->renderText($json);
   // $this->forward('default', 'module');
  }
   public function executeBalanceproyectos(sfWebRequest $request)
  {
      $id = $this->getRequestParameter("idarea",1);
     $area = AreaPeer::retrieveByPK($id);
     $balancepremios= $area->getBalanceProyecto();
     $cant = count($balancepremios);
     $cont = 0;
     $json = "{root:[";
     foreach ($balancepremios as $key => $value) {
    
         $json .= "{ID:'".$cont++."',";
         $json .= "Categorias:'Proyectos I e  I + D',";
         $json .= "Descripcion:'".TipoproyectoPeer::retrieveByPK($key)."',";
         $json .= "Cantidad:".$value."}";
     }
    $json.="]";
    $json.=",count:{$cant}}";
    $json = str_replace("}{", "},{", $json);
    return $this->renderText($json);
   // $this->forward('default', 'module');
  }
   public function executeBalanceresultados(sfWebRequest $request)
  {
     $id = $this->getRequestParameter("idarea",1);
     $area = AreaPeer::retrieveByPK($id);
     $balancepremios= $area->getBalanceResultadosI();
     $cant = count($balancepremios);
     $cont = 0;
     $json = "{root:[";
     foreach ($balancepremios as $key => $value) {
         $ids = split(":", $key);
         $json .= "{ID:'".$cont++."',";
         $json .= "Categorias:'Productos TERMINADOS',";
         $json .= "Descripcion:'".DimensionpPeer::retrieveByPK($key)."',";
         $json .= "Cantidad:".$value."}";
     }
    $json.="]";
    $json.=",count:{$cant}}";
    $json = str_replace("}{", "},{", $json);
    return $this->renderText($json);
   // $this->forward('default', 'module');
  }
   public function executeBalancetrabajos(sfWebRequest $request)
  {
      $id = $this->getRequestParameter("idarea",1);
     $area = AreaPeer::retrieveByPK($id);
     $balancepremios= $area->getBalanceTrabajosP();
      $cant = count($balancepremios);
     $json = "{root:[";
     foreach ($balancepremios as $key => $value) {
         $json .= "{ID:'".$key."',";
         $json .= "Categorias:'Trabajos Presentados',";
         $json .= "Descripcion:'".TipoeventoPeer::retrieveByPK($key)."',";
         $json .= "Cantidad:".$value."}";
     }
    $json.="]";
    $json.=",count:{$cant}}";
    $json = str_replace("}{", "},{", $json);
    return $this->renderText($json);
   // $this->forward('default', 'module');
  }

}
