SIRIOApp.controller("deliveryListPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog','$sce','$filter','ZConfirm',
function($scope,SystemInformation,$state,$rootScope,$mdDialog,$sce,$filter,ZConfirm)
{
  $scope.DaSpedireFiltro  = true;
  $scope.PrenotataFiltro  = true;
  $scope.ConsegnataFiltro = false;
  $scope.ProvinciaFiltro  = -1;
  $scope.PromotoreFiltro  = -1;
  $scope.IstitutoFiltro   = -1;
  $scope.DocenteFiltro    = -1;
  ListaSpedizioni         = [];
  $scope.TitoloFiltro     = -1;
  $scope.ListaGruppi      = [];
  $scope.DataRicercaAl    = new Date();
  let TmpDate             = new Date($scope.DataRicercaAl);
  TmpDate.setDate(TmpDate.getDate() - 7);
  //$scope.DataRicercaDal   = new Date(TmpDate);
  var AnnoCorrente = new Date().getFullYear();
  $scope.DataRicercaDal   = new Date(AnnoCorrente, 0, 1)

 
  ScopeHeaderController.CheckButtons(); 

  $scope.GetListaGruppi = function()
  {
    SystemInformation.GetSQL('PublisherGroup', {}, function(Results)  
    {
      GruppiInfoList = SystemInformation.FindResults(Results,'GroupInfoList');
      if(GruppiInfoList != undefined)
      { 
         for(let i = 0;i < GruppiInfoList.length;i ++)
         GruppiInfoList[i] = {
                               Chiave       : GruppiInfoList[i].CHIAVE,
                               Descrizione  : GruppiInfoList[i].DESCRIZIONE,
                               DaAggiungere : true
                             }
         $scope.ListaGruppi      = GruppiInfoList;
         $scope.ListaGruppiPopup = GruppiInfoList
      } 
      else SystemInformation.ApplyOnError('Modello gruppi case editrici non conforme','');   
    });
  }
  
  $scope.IsAdministrator = function ()
  {
    return SystemInformation.UserInformation.Ruolo == RUOLO_AMMINISTRATORE;
  }

  //if ($scope.IsAdministrator())  //PER PROBLEMA CRASH TROPPE QUERY
      //$scope.DataRicercaDal = new Date(TmpDate);
  
  $scope.ConvertiData = function (Dati)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Dati.Data)));
  }
  
  $scope.GestioneAvanzataSpedizioni = function()
  {
    $state.go("deliveryAdvancedManagementPage");
  }

  function CreaDocumentoCumulativo(CumulativoTitoli,NomeDocumento,NomePromotore)
  {           
    var WBook = {
                  SheetNames : [],
                  Sheets     : {}
                };

    var SheetName          = NomeDocumento == 'CumulativoPrenotati' ? "CUMULATIVO PRENOTAZIONI" : "CUMULATIVO CONSEGNE";
    var BodySheet          = {};

    if(NomeDocumento != 'CumulativoPrenotati')
       $scope.CheckNegativi = 'T';
    
    BodySheet['A1'] = SystemInformation.GetCellaIntestazione('GRUPPO');
    BodySheet['B1'] = SystemInformation.GetCellaIntestazione('EDITORE');
    BodySheet['C1'] = SystemInformation.GetCellaIntestazione('ISBN');
    BodySheet['D1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheet['E1'] = SystemInformation.GetCellaIntestazione('QUANTITA');
    if(NomeDocumento == 'CumulativoPrenotati')
    {
      BodySheet['F1'] = SystemInformation.GetCellaIntestazione('QUANTITA MAGAZZINO');
      BodySheet['G1'] = SystemInformation.GetCellaIntestazione('DIFFERENZA');
      BodySheet['H1'] = SystemInformation.GetCellaIntestazione('PROMOTORI');
    }
       
    var ListaTitoli  = [];
    for(let j = 0;j < CumulativoTitoli.length;j ++)
    {
        TitoloGiaInserito = ListaTitoli.findIndex(function(ATitolo){return(ATitolo.Chiave == CumulativoTitoli[j].Chiave)})
        if(TitoloGiaInserito == -1)
        {
          ListaTitoli.push(CumulativoTitoli[j])
          ListaTitoli[ListaTitoli.length - 1].ListaPromotori = [CumulativoTitoli[j].NomePromotore];
        }
        else
        {
          ListaTitoli[TitoloGiaInserito].Quantita += CumulativoTitoli[j].Quantita;
          var PromotoreTrovato = ListaTitoli[TitoloGiaInserito].ListaPromotori.findIndex(function(ALista){return(ALista == CumulativoTitoli[j].NomePromotore);});
          if(PromotoreTrovato == -1)
             ListaTitoli[TitoloGiaInserito].ListaPromotori.push(CumulativoTitoli[j].NomePromotore);
        } 
    }
    var Gruppo = 'ABCDEFGHIJKLMNOPQRSTUVZ'
    var CasaEditrice = '-1';
    for(let k = 0;k < ListaTitoli.length;k ++)
    {
        var InserisciTitolo = function()
        {
          if(Gruppo != ListaTitoli[k].Gruppo)
            BodySheet['A' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Gruppo);
          Gruppo = ListaTitoli[k].Gruppo;

          if(CasaEditrice != ListaTitoli[k].Editore)
              BodySheet['B' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Editore);
          CasaEditrice = ListaTitoli[k].Editore;
          
          BodySheet['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Codice);
          BodySheet['D' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Titolo);
          BodySheet['E' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].Quantita.toString());
          if(NomeDocumento == 'CumulativoPrenotati')
          {
            BodySheet['F' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].QuantitaMag.toString());
            BodySheet['G' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',(parseInt(ListaTitoli[k].QuantitaMag) - parseInt(ListaTitoli[k].Quantita) + parseInt(ListaTitoli[k].QuantitaNovita)).toString());
            BodySheet['H' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaTitoli[k].ListaPromotori.toString());
          }
        }

        if($scope.CheckNegativi == 'N')
        {
           if((parseInt(ListaTitoli[k].QuantitaMag) - parseInt(ListaTitoli[k].Quantita) + parseInt(ListaTitoli[k].QuantitaNovita)) < 0)
               InserisciTitolo()
           else
           {
              ListaTitoli.splice(k,1)
              k--
           } 
        }
        else
        {
           InserisciTitolo();
        }
    }

    BodySheet["!cols"] = [ 
                          {wpx: 250},            
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250},
                          {wpx: 250}
                        ];
    if(NomeDocumento == 'CumulativoPrenotati')
    {
      BodySheet["!cols"].push({wpx: 250});
      BodySheet["!cols"].push({wpx: 250});
      BodySheet["!cols"].push({wpx: 500});  
    }

    BodySheet['!ref'] = (NomeDocumento == 'CumulativoPrenotati' ?  'A1:H1' :  'A1:E1') + parseInt(ListaTitoli.length + 1);
    
    WBook.SheetNames.push(SheetName);
    WBook.Sheets[SheetName]    = BodySheet;

    var Data           = new Date();
    var DataAnno       = Data.getFullYear();
    var DataMese       = Data.getMonth()+1; 
    var DataGiorno     = Data.getDate();
    var DataCumulativo = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();

    var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
    saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), NomeDocumento + DataCumulativo + $scope.PromotoreSceltoNome + ".xlsx");
  }

  function CreaDocumentoCumulativoOrd(CumulativoTitoli)
  { 
    var Data           = new Date();
    var DataAnno       = Data.getFullYear();
    var DataMese       = Data.getMonth()+1; 
    var DataGiorno     = Data.getDate();
    Data               = DataGiorno.toString() + '-' + DataMese.toString() +  '-' + DataAnno.toString();
    var OrdText = "";
    OrdText = "[codice]=999047\n[intest]=PAGINA43 snc\n[note]=\n[email]=info@pagina43.it\n[data]=" + Data + "\n";

    var ListaTitoli  = [];
    for(let j = 0;j < CumulativoTitoli.length;j ++)
    {
        TitoloGiaInserito = ListaTitoli.findIndex(function(ATitolo){return(ATitolo.Chiave == CumulativoTitoli[j].Chiave)})
        if(TitoloGiaInserito == -1)
            ListaTitoli.push(CumulativoTitoli[j])
        else ListaTitoli[TitoloGiaInserito].Quantita += CumulativoTitoli[j].Quantita
    }
    for(let k = 0;k < ListaTitoli.length;k ++)
    {
        var InserisciTitolo = function()
        { 
          OrdText = OrdText + ListaTitoli[k].Codice + ' ' + Math.abs((parseInt(ListaTitoli[k].QuantitaMag) - parseInt(ListaTitoli[k].Quantita) + parseInt(ListaTitoli[k].QuantitaNovita))).toString() + "\n";        
        }

        if((parseInt(ListaTitoli[k].QuantitaMag) - parseInt(ListaTitoli[k].Quantita) + parseInt(ListaTitoli[k].QuantitaNovita)) < 0)
            InserisciTitolo()
        else
        {
          ListaTitoli.splice(k,1)
          k--
        } 
    }

    var blob = new Blob([OrdText], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "CumulativoDeAgostini" + Data + ".ord");   
  
  }

  //STAMPA CUMULATIVO PRENOTATI

  $scope.SelezioneGruppiXls = function (ev,Tipo)
  {
      $mdDialog.show({ 
                      controller          : DialogControllerSelezioneGruppi,
                      templateUrl         : "template/deliveryGroupSelect.html",
                      targetEvent         : ev,
                      scope               : $scope,
                      preserveScope       : true,
                      clickOutsideToClose : true,
                      locals              : {Tipo}
                    })
      .then(function(answer) 
      {
      }, 
      function() 
      {
      });
  }

  function DialogControllerSelezioneGruppi($scope,$mdDialog,Tipo)
  {
    $scope.ListaGruppiToAdd    = [];
    $scope.CheckGruppi         = 'G';
    $scope.CheckNegativi       = 'N';
    $scope.CheckPromotori      = 'T';
    $scope.PromotoreScelto     = -1;
    $scope.PromotoreSceltoNome = '';
    $scope.Tipo                = Tipo;

    $scope.GetNomePromotore = function()
    {
       if($scope.PromotoreScelto != -1)
       {
          var Promotore = $scope.ListaPromotori.find(function(AProm){return (AProm.Chiave == $scope.PromotoreScelto);});
          if(Promotore != undefined)
          {
             $scope.PromotoreSceltoNome = Promotore.Nome;
             $scope.PromotoreSceltoNome =  $scope.PromotoreSceltoNome.replace(" ", "_").toUpperCase();
          }
          else $scope.PromotoreSceltoNome = '';
       }     
    }
    
    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopup = function() 
    {
      $scope.PromotoreScelto     = -1;
      $scope.PromotoreSceltoNome = '';
      for(let i = 0;i < $scope.ListaGruppiPopup.length;i ++)
          $scope.ListaGruppiPopup[i].DaAggiungere = false;          
      $scope.ListaGruppiToAdd  = [];
      $mdDialog.cancel();
    };

    $scope.ConfermaPopup = function()
    { 
      if($scope.CheckPromotori == 'T')
      {
         $scope.PromotoreScelto     = -1;
         $scope.PromotoreSceltoNome = '';
      } 
      ContatoreGruppi = 0; 
      for(let j = 0;j < $scope.ListaGruppiPopup.length;j ++)
      {
        if($scope.ListaGruppiPopup[j].DaAggiungere)
        {
           $scope.ListaGruppiToAdd.push($scope.ListaGruppiPopup[j]);
           ContatoreGruppi++; 
           $scope.ListaGruppiPopup[j].DaAggiungere = true;
        }
      }
      if(ContatoreGruppi == 0 && $scope.CheckGruppi == 'G')
      {
         ZCustomAlert($mdDialog,'ATTENZIONE','NESSUN GRUPPO SELEZIONATO')
      }
      else
      {
        $mdDialog.hide();
        if(Tipo == 'P')
          $scope.ApriCumulativoPrenotati();
        else $scope.ApriCumulativoConsegnati();   
      }                       
    };
  }

  $scope.ApriCumulativoPrenotati = function(ev)
  {    
      $mdDialog.show({ 
                       controller          : DialogControllerXlsPrenotati,
                       templateUrl         : "template/documentBookedUpPopup.html",
                       targetEvent         : ev,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true
                     })
      .then(function(answer) 
      {
      }, 
      function() 
      {
      });
  }

  function DialogControllerXlsPrenotati($scope,$mdDialog)
  {
    $scope.DataRicercaAlPrnt    = new Date();
    let TmpDatePrnt             = new Date($scope.DataRicercaAlPrnt);
    TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 30);
    $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupPrenotati = function() 
    {
      $scope.DataRicercaAlPrnt    = new Date();
      let TmpDatePrnt             = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 30);
      $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);
      $scope.ListaGruppiToAdd     = [];
      $mdDialog.cancel();
    };

    $scope.CreaXlsPrenotati = function()
    {
      var CumulativoPrenotatiTmp = [];
      var CumulativoPrenotati    = []
      var ArrayGruppi            = [];

      for(let i = 0;i < $scope.ListaGruppiToAdd.length;i ++)
           ArrayGruppi.push($scope.ListaGruppiToAdd[i].Chiave);
                
      if($scope.DataRicercaDalPrnt == undefined || $scope.DataRicercaAlPrnt == undefined)
         return;
      let TmpDatePrnt = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate($scope.DataRicercaAlPrnt.getDate() + 1);
      
      var ParamPrenotati = {
                              Dal : ZHTMLInputFromDate($scope.DataRicercaDalPrnt), 
                              Al  : ZHTMLInputFromDate(TmpDatePrnt)
                           };
      
      if(ArrayGruppi.length > 0 && $scope.CheckGruppi == 'G')
         ParamPrenotati.ChiaveGruppi = ArrayGruppi.toString() 

      if($scope.PromotoreScelto != -1  && $scope.PromotoreScelto != undefined)
         ParamPrenotati.PromotoreScelto = $scope.PromotoreScelto;

      SystemInformation.GetSQL('Delivery',ParamPrenotati,function(Results)
      {
        CumulativoPrenotatiTmp = SystemInformation.FindResults(Results,'BookedUpCumulative')
        if (CumulativoPrenotatiTmp != undefined)
        {
            if(CumulativoPrenotatiTmp.length == 0)
               ZCustomAlert($mdDialog,'AVVISO','NESSUN TITOLO PRENOTATO NEL PERIODO INDICATO')
            else
            {
              for(let i = 0;i < CumulativoPrenotatiTmp.length;i ++)
                  CumulativoPrenotatiTmp[i] = {
                                                Gruppo         : CumulativoPrenotatiTmp[i].GRUPPO_CASA == undefined ? 'NESSUN GRUPPO' : CumulativoPrenotatiTmp[i].GRUPPO_CASA, 
                                                Editore        : CumulativoPrenotatiTmp[i].EDITORE_TITOLO == null ? 'EDITORE NON REGISTRATO' : CumulativoPrenotatiTmp[i].EDITORE_TITOLO,
                                                Chiave         : CumulativoPrenotatiTmp[i].TITOLO,
                                                Titolo         : CumulativoPrenotatiTmp[i].NOME_TITOLO == null ? 'NOME NON REGISTRATO' : CumulativoPrenotatiTmp[i].NOME_TITOLO,
                                                Codice         : CumulativoPrenotatiTmp[i].CODICE_TITOLO,
                                                Quantita       : parseInt(CumulativoPrenotatiTmp[i].QUANTITA),
                                                QuantitaMag    : parseInt(CumulativoPrenotatiTmp[i].QUANTITA_MAGAZZINO),
                                                QuantitaNovita : CumulativoPrenotatiTmp[i].Q_PREN_NOVITA == undefined ? 0 : parseInt(CumulativoPrenotatiTmp[i].Q_PREN_NOVITA),
                                                NomePromotore  : CumulativoPrenotatiTmp[i].NOME_PROMOTORE, 
                                              }
              CumulativoPrenotati = CumulativoPrenotatiTmp
              
              CreaDocumentoCumulativo(CumulativoPrenotati,'CumulativoPrenotati')
              $mdDialog.hide();
            }
        }
        else SystemInformation.ApplyOnError('Modello cumulativo prenotati non conforme','')
      },'SQLCumulativoPrenotati')
    }
  }

  //STAMPA CUMULATIVO CONSEGNATI

  $scope.ApriCumulativoConsegnati = function(ev)
  {    
      $mdDialog.show({ 
                       controller          : DialogControllerXlsConsegnati,
                       templateUrl         : "template/documentDeliveredPopup.html",
                       targetEvent         : ev,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true
                     })
      .then(function(answer) 
      {
      }, 
      function() 
      {
      });
  }

  function DialogControllerXlsConsegnati($scope,$mdDialog)
  {
    $scope.DataRicercaAlCnsg    = new Date();
    let TmpDateCnsg             = new Date($scope.DataRicercaAlCnsg);
    TmpDateCnsg.setDate(TmpDateCnsg.getDate() - 30);
    $scope.DataRicercaDalCnsg   = new Date(TmpDateCnsg);

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupConsegnati = function() 
    {
      $scope.DataRicercaAlCnsg    = new Date();
      let TmpDateCnsg             = new Date($scope.DataRicercaAlCnsg);
      TmpDateCnsg.setDate(TmpDateCnsg.getDate() - 30);
      $scope.DataRicercaDalCnsg   = new Date(TmpDateCnsg);
      $scope.ListaGruppiToAdd     = [];
      $mdDialog.cancel();
    };

    $scope.CreaXlsConsegnati = function()
    {
      var CumulativoConsegnatiTmp = [];
      var CumulativoConsegnati    = [];
      var ArrayGruppi            = [];

      for(let i = 0;i < $scope.ListaGruppiToAdd.length;i ++)
          ArrayGruppi.push($scope.ListaGruppiToAdd[i].Chiave);

      if($scope.DataRicercaDalCnsg == undefined || $scope.DataRicercaAlCnsg == undefined)
         return;
      let TmpDateCnsg = new Date($scope.DataRicercaAlCnsg);
      TmpDateCnsg.setDate($scope.DataRicercaAlCnsg.getDate() + 1);
      
      var ParamConsegnati = {
                              Dal : ZHTMLInputFromDate($scope.DataRicercaDalCnsg), 
                              Al  : ZHTMLInputFromDate(TmpDateCnsg)
                            };

      if(ArrayGruppi.length > 0 && $scope.CheckGruppi == 'G')
        ParamConsegnati.ChiaveGruppi = ArrayGruppi.toString() 
      
      if($scope.PromotoreScelto != -1 && $scope.PromotoreScelto != undefined)
         ParamConsegnati.PromotoreScelto = $scope.PromotoreScelto;
      
      SystemInformation.GetSQL('Delivery',ParamConsegnati,function(Results)
      {
        CumulativoConsegnatiTmp = SystemInformation.FindResults(Results,'DeliveredCumulative')
        if (CumulativoConsegnatiTmp != undefined)
        {
            if(CumulativoConsegnatiTmp.length == 0)
               ZCustomAlert($mdDialog,'AVVISO','NESSUN TITOLO CONSEGNATO NEL PERIODO INDICATO')
            else
            {
              for(let i = 0;i < CumulativoConsegnatiTmp.length;i ++)
                  CumulativoConsegnatiTmp[i] = {
                                                  Gruppo   : CumulativoConsegnatiTmp[i].GRUPPO_CASA == undefined ? 'NESSUN GRUPPO' : CumulativoConsegnatiTmp[i].GRUPPO_CASA, 
                                                  Editore  : CumulativoConsegnatiTmp[i].EDITORE_TITOLO == null ? 'EDITORE NON REGISTRATO' : CumulativoConsegnatiTmp[i].EDITORE_TITOLO,
                                                  Chiave   : CumulativoConsegnatiTmp[i].TITOLO,
                                                  Titolo   : CumulativoConsegnatiTmp[i].NOME_TITOLO == null ? 'NOME NON REGISTRATO' : CumulativoConsegnatiTmp[i].NOME_TITOLO,
                                                  Codice   : CumulativoConsegnatiTmp[i].CODICE_TITOLO,
                                                  Quantita : parseInt(CumulativoConsegnatiTmp[i].QUANTITA)
                                                }
              CumulativoConsegnati = CumulativoConsegnatiTmp
          
              CreaDocumentoCumulativo(CumulativoConsegnati,'CumulativoConsegnati')
              $mdDialog.hide();        
            }              
        }
        else SystemInformation.ApplyOnError('Modello cumulativo consegnati non conforme','')
      },'SQLCumulativoConsegnati')
    }
  }

  $scope.ApriCumulativoPrenotatiOrd = function(ev)
  {    
      $mdDialog.show({ 
                       controller          : DialogControllerOrdPrenotati,
                       templateUrl         : "template/documentBookedUpPopupOrd.html",
                       targetEvent         : ev,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true
                     })
      .then(function(answer) 
      {
      }, 
      function() 
      {
      });
  }

  function DialogControllerOrdPrenotati($scope,$mdDialog)
  {
    $scope.DataRicercaAlPrnt    = new Date();
    let TmpDatePrnt             = new Date($scope.DataRicercaAlPrnt);
    TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 30);
    $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);

    $scope.hide = function() 
    {
      $mdDialog.hide();
    };

    $scope.AnnullaPopupOrdPrenotati = function() 
    {
      $scope.DataRicercaAlPrnt    = new Date();
      let TmpDatePrnt             = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate(TmpDatePrnt.getDate() - 30);
      $scope.DataRicercaDalPrnt   = new Date(TmpDatePrnt);
      $scope.ListaGruppiToAdd     = [];
      $mdDialog.cancel();
    };

    $scope.CreaOrdPrenotati = function()
    {
      var CumulativoPrenotatiTmp = [];
      var CumulativoPrenotati    = [];
                
      if($scope.DataRicercaDalPrnt == undefined || $scope.DataRicercaAlPrnt == undefined)
         return;
      let TmpDatePrnt = new Date($scope.DataRicercaAlPrnt);
      TmpDatePrnt.setDate($scope.DataRicercaAlPrnt.getDate() + 1);
      
      var ParamPrenotati = {
                              Dal          : ZHTMLInputFromDate($scope.DataRicercaDalPrnt), 
                              Al           : ZHTMLInputFromDate(TmpDatePrnt),
                              ChiaveGruppi : '286071' //CHIAVE DEAGOSTINI
                           };

      SystemInformation.GetSQL('Delivery',ParamPrenotati,function(Results)
      {
        CumulativoPrenotatiTmp = SystemInformation.FindResults(Results,'BookedUpCumulative')
        if (CumulativoPrenotatiTmp != undefined)
        {
            if(CumulativoPrenotatiTmp.length == 0)
               ZCustomAlert($mdDialog,'AVVISO','NESSUN TITOLO PRENOTATO NEL PERIODO INDICATO')
            else
            {
              for(let i = 0;i < CumulativoPrenotatiTmp.length;i ++)
                  CumulativoPrenotatiTmp[i] = {
                                                Gruppo         : CumulativoPrenotatiTmp[i].GRUPPO_CASA == undefined ? 'NESSUN GRUPPO' : CumulativoPrenotatiTmp[i].GRUPPO_CASA, 
                                                Editore        : CumulativoPrenotatiTmp[i].EDITORE_TITOLO == null ? 'EDITORE NON REGISTRATO' : CumulativoPrenotatiTmp[i].EDITORE_TITOLO,
                                                Chiave         : CumulativoPrenotatiTmp[i].TITOLO,
                                                Titolo         : CumulativoPrenotatiTmp[i].NOME_TITOLO == null ? 'NOME NON REGISTRATO' : CumulativoPrenotatiTmp[i].NOME_TITOLO,
                                                Codice         : CumulativoPrenotatiTmp[i].CODICE_TITOLO,
                                                Quantita       : parseInt(CumulativoPrenotatiTmp[i].QUANTITA),
                                                QuantitaMag    : parseInt(CumulativoPrenotatiTmp[i].QUANTITA_MAGAZZINO),
                                                QuantitaNovita : CumulativoPrenotatiTmp[i].Q_PREN_NOVITA == undefined ? 0 : parseInt(CumulativoPrenotatiTmp[i].Q_PREN_NOVITA)
                                              }
              CumulativoPrenotati = CumulativoPrenotatiTmp
              
              CreaDocumentoCumulativoOrd(CumulativoPrenotati)
              $mdDialog.hide();
            }
        }
        else SystemInformation.ApplyOnError('Modello cumulativo prenotati non conforme','')
      },'SQLCumulativoPrenotati')
    }
  }
  
  $scope.GridOptions = {
                         rowSelection    : false,
                         multiSelect     : true,
                         autoSelect      : true,
                         decapitate      : false,
                         largeEditDialog : false,
                         boundaryLinks   : false,
                         limitSelect     : true,
                         pageSelect      : true,
                         query           : {
                                             limit: 10,
                                             page: 1
                                           },
                         limitOptions    : [10, 20, 30]
                       };

 $scope.GridOptions_2 = {
                          rowSelection    : false,
                          multiSelect     : true,
                          autoSelect      : true,
                          decapitate      : false,
                          largeEditDialog : false,
                          boundaryLinks   : false,
                          limitSelect     : true,
                          pageSelect      : true,
                          query           : {
                                              limit: 10,
                                              page: 1
                                            },
                          limitOptions    : [10, 20, 30]
                        };
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaProvinceAllTmp = SystemInformation.FindResults(Results,'ProvinceListAll');
    if (ListaProvinceAllTmp != undefined) 
    {
      for(let i = 0; i < ListaProvinceAllTmp.length; i++)
          ListaProvinceAllTmp[i] = {
                                     Chiave : ListaProvinceAllTmp[i].CHIAVE,
                                     Nome   : ListaProvinceAllTmp[i].NOME
                                   }
      $scope.ListaProvinceAll = ListaProvinceAllTmp;
    }
    else SystemInformation.ApplyOnError('Modello province di italia non conforme','');    
  });
  
  if($scope.IsAdministrator())
  {
     SystemInformation.GetSQL('Teacher',{}, function(Results)
     {
       $scope.ListaDocenti = [];
       ListaDocentiTmp = SystemInformation.FindResults(Results,'TeacherInfoListSmallAdmin');
       if (ListaDocentiTmp != undefined) 
       {
         for(let i = 0; i < ListaDocentiTmp.length; i++)
             ListaDocentiTmp[i] = {
                                    Chiave : ListaDocentiTmp[i].CHIAVE,
                                    Nome   : ListaDocentiTmp[i].RAGIONE_SOCIALE
                                  }
         $scope.ListaDocenti = ListaDocentiTmp;
       }
       else SystemInformation.ApplyOnError('Modello docenti non conforme','');    
     },'SelectSQLDocSpedAdmin')  
  }
  else
  {
     SystemInformation.GetSQL('Teacher',{}, function(Results)
     { 
       $scope.ListaDocenti = [];
       ListaDocentiTmp = SystemInformation.FindResults(Results,'TeacherInfoListSmallPromotore');
       if (ListaDocentiTmp != undefined) 
       {
         for(let i = 0; i < ListaDocentiTmp.length; i++)
             ListaDocentiTmp[i] = {
                                    Chiave : ListaDocentiTmp[i].CHIAVE,
                                    Nome   : ListaDocentiTmp[i].RAGIONE_SOCIALE
                                  }
         $scope.ListaDocenti = ListaDocentiTmp;
       }
       else SystemInformation.ApplyOnError('Modello docenti non conforme','');    
     },'SelectSQLDocSpedPromotore');
  }

  SystemInformation.GetSQL('Book', {}, function(Results)  
  {  
    TitoliInfoLista = SystemInformation.FindResults(Results,'BookListFilter');
    if(TitoliInfoLista != undefined)
    { 
       for(let i = 0; i < TitoliInfoLista.length; i++)
           TitoliInfoLista[i] = { 
                                  Chiave         : TitoliInfoLista[i].CHIAVE,
                                  Nome           : TitoliInfoLista[i].TITOLO,
                                  Codice         : TitoliInfoLista[i].CODICE_ISBN,                              
                                }
       $scope.ListaTitoliFilter = TitoliInfoLista;
    }
    else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
  },'SelectSQLFilter');
  
  SystemInformation.GetSQL('Institute',{}, function(Results)
  {
    ListaIstitutiTmp = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
    if (ListaIstitutiTmp != undefined) 
    {
      for(let i = 0; i < ListaIstitutiTmp.length; i++)
          ListaIstitutiTmp[i] = {
                                   Chiave   : ListaIstitutiTmp[i].CHIAVE,
                                   Istituto : ListaIstitutiTmp[i].NOME
                                 }
      $scope.ListaIstituti = ListaIstitutiTmp;
    }
    else SystemInformation.ApplyOnError('Modello istituti non conforme','');    
  },'SelectSQLOnlyVisible');
  
  SystemInformation.GetSQL('User',{}, function(Results)
  {
    ListaPromotoriTmp = SystemInformation.FindResults(Results,'UserInfoList');
    if (ListaPromotoriTmp != undefined) 
    {
      for(let i = 0; i < ListaPromotoriTmp.length; i++)
          ListaPromotoriTmp[i] = {
                                   Chiave : ListaPromotoriTmp[i].CHIAVE,
                                   Nome   : ListaPromotoriTmp[i].RAGIONE_SOCIALE
                                 }
      $scope.ListaPromotori = ListaPromotoriTmp;
    }
    else SystemInformation.ApplyOnError('Modello promotori non conforme','');    
  });
  
  $scope.queryDocente = function(searchTextDocente)
  {
     searchTextDocente = searchTextDocente.toUpperCase();
     return($scope.ListaDocenti.grep(function(Elemento) 
     {
       //return(Elemento.Nome.toUpperCase().indexOf(searchTextDocente) != -1);
       return(Elemento.Nome.toUpperCase().startsWith(searchTextDocente))
     }));
  }

  $scope.queryTitolo = function(searchTextTit)
  {
     searchTextTit = searchTextTit.toUpperCase();
     return($scope.ListaTitoliFilter.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextTit) != -1 || Elemento.Codice.indexOf(searchTextTit) != -1);
     }));
  }
  
  $scope.selectedItemChangeTitolo = function(itemTit)
  {
    if(itemTit != undefined)
       $scope.TitoloFiltro = itemTit.Chiave;
    else $scope.TitoloFiltro  = -1;
    $scope.GridOptions.query.page = 1;
  }  
  
  $scope.selectedItemChangeDocente = function(itemDocente)
  {
    if(itemDocente != undefined)
       $scope.DocenteFiltro = itemDocente.Chiave;
    else $scope.DocenteFiltro = -1;
    $scope.GridOptions.query.page = 1;
  }  

  $scope.queryIstituto = function(searchTextIstituto)
  {
     searchTextIstituto = searchTextIstituto.toUpperCase();
     return($scope.ListaIstituti.grep(function(Elemento) 
     { 
       return(Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1);
     }));
  }
  
  $scope.selectedItemChangeIstituto = function(itemIstituto)
  {
    if(itemIstituto != undefined)
       $scope.IstitutoFiltro = itemIstituto.Chiave;
    else $scope.IstitutoFiltro = -1;
    $scope.GridOptions.query.page = 1;
  }    
  
  $scope.RefreshListaSpedizioniAll = function ()
  {
    $scope.GridOptions.query.page = 1;
    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
  
    SystemInformation.ExecuteExternalScript('SIRIOExtra',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate), Admin : ($scope.IsAdministrator() ? 'T' : 'F')},function(Answer) 
    {
      $scope.ListaSpedizioni = Answer.ListaSpedizioni; 
    }); 
  }
  
  $scope.GetTitoliSpedizione = function(Spedizione)
  {
     var Result = '';
     for(let i = 0;i < Spedizione.DettagliTitoli.length;i ++)
     {
         Result += Spedizione.DettagliTitoli[i].CodiceTitolo + ' - ' + Spedizione.DettagliTitoli[i].NomeTitolo + ' - ' + Spedizione.DettagliTitoli[i].StatoTitolo + '</br>';
     }
     
     return($sce.trustAsHtml(Result.substr(0,Result.length)));
  }

  $scope.CreaXlsSpedizioni = function()
  {
    if($scope.DataRicercaDal == undefined || $scope.DataRicercaAl == undefined)
       return;
    let TmpDate = new Date($scope.DataRicercaAl);
    TmpDate.setDate($scope.DataRicercaAl.getDate() + 1);
    
    var WBook = {
	                  SheetNames : [],
	                  Sheets     : {}
                };
    
    
    var SheetName          = "SPEDIZIONI";
    var BodySheet          = {};
    var SheetNameCum       = "CUMULATIVO TITOLI";
    var BodySheetCum       = {};
    var ListaCumulativo    = [];
   
    let SpedizioniFiltrate = $filter('SpedizioneByFiltro')($scope.ListaSpedizioni,
                                                           $scope.ProvinciaFiltro,
                                                           $scope.PrenotataFiltro,
                                                           $scope.DaSpedireFiltro,
                                                           $scope.ConsegnataFiltro,
                                                           $scope.PromotoreFiltro,
                                                           $scope.IstitutoFiltro,
                                                           $scope.DocenteFiltro,
                                                           $scope.TitoloFiltro);
    if($scope.IsAdministrator())
    {
       BodySheet       = {};
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('DESTINATARIO');
       BodySheet['B1'] = SystemInformation.GetCellaIntestazione('DOCENTE');
       BodySheet['C1'] = SystemInformation.GetCellaIntestazione('INDIRIZZO');
       BodySheet['D1'] = SystemInformation.GetCellaIntestazione('DATA');
       BodySheet['E1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
       BodySheet['F1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheet['G1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheet['H1'] = SystemInformation.GetCellaIntestazione('QUANTITA');
       BodySheet['I1'] = SystemInformation.GetCellaIntestazione('STATO');
   
       BodySheetCum       = {};
       BodySheetCum['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheetCum['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheetCum['C1'] = SystemInformation.GetCellaIntestazione('TOTALE');
       BodySheetCum['D1'] = SystemInformation.GetCellaIntestazione('PRENOTATI');
       BodySheetCum['E1'] = SystemInformation.GetCellaIntestazione('DA SPEDIRE');
       BodySheetCum['F1'] = SystemInformation.GetCellaIntestazione('CONSEGNATI');

       
       SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
       {
         var ListaSpedizioniToFilter = [];
         var SpedCorrisp             = {};
         var ListaSpedizioniFinale   = [];

         ListaSpedizioniToFilter = SystemInformation.FindResults(Results,'DeliveryListAdminXls');
         if(ListaSpedizioniToFilter != undefined)
         {
            for(let i = 0;i < ListaSpedizioniToFilter.length;i ++)
            {
                SpedCorrisp = SpedizioniFiltrate.find(function(ASpedizione){return (ASpedizione.Chiave == ListaSpedizioniToFilter[i].CHIAVE);});
                if(SpedCorrisp)
                   ListaSpedizioniFinale.push(ListaSpedizioniToFilter[i]);
            }              
            var ChiaveSpedizione = -1;
            for(let j = 0;j < ListaSpedizioniFinale.length;j ++)
            {                
                switch(ListaSpedizioniFinale[j].STATO)
                {
                       case 'S' : ListaSpedizioniFinale[j].STATO = 'DA SPEDIRE';
                                  break;
                       case 'P' : ListaSpedizioniFinale[j].STATO = 'PRENOTATO';
                                  break;
                       case 'C' : ListaSpedizioniFinale[j].STATO = 'CONSEGNATO';
                                  break;
                }
                
                if (ChiaveSpedizione != ListaSpedizioniFinale[j].CHIAVE)
                {
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].PRESSO);
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_DOCENTE == undefined ? '' : ListaSpedizioniFinale[j].NOME_DOCENTE);
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].INDIRIZZO + ', ' + ListaSpedizioniFinale[j].COMUNE + ', ' + ListaSpedizioniFinale[j].CAP + ', ' + ListaSpedizioniFinale[j].NOME_PROVINCIA);
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaSpedizioniFinale[j].DATA)));
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_PROMOTORE.toUpperCase()); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                else
                {   
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s','');
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',''); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                   
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                
                TitoloCorrisp = ListaCumulativo.findIndex(function(ATitolo){return(ATitolo.Codice == ListaSpedizioniFinale[j].CODICE_TITOLO);});
                if(TitoloCorrisp == -1)
                {
                   ListaCumulativo.push({
                                          Codice     : ListaSpedizioniFinale[j].CODICE_TITOLO,
                                          Nome       : ListaSpedizioniFinale[j].NOME_TITOLO,
                                          Quantita   : ListaSpedizioniFinale[j].QUANTITA,
                                          Prenotati  : '0',
                                          DaSpedire  : '0',
                                          Consegnati : '0'
                                        })
                   switch(ListaSpedizioniFinale[j].STATO)
                   {
                          case 'PRENOTATO' : ListaCumulativo[ListaCumulativo.length-1].Prenotati = ListaSpedizioniFinale[j].QUANTITA;
                                     break;
                          case 'DA SPEDIRE' : ListaCumulativo[ListaCumulativo.length-1].DaSpedire = ListaSpedizioniFinale[j].QUANTITA;
                                     break;
                          case 'CONSEGNATO' : ListaCumulativo[ListaCumulativo.length-1].Consegnati = ListaSpedizioniFinale[j].QUANTITA;
                                     break
                   }
                }
                else 
                {
                   ListaCumulativo[TitoloCorrisp].Quantita = parseInt(ListaCumulativo[TitoloCorrisp].Quantita) + parseInt(ListaSpedizioniFinale[j].QUANTITA);   
                   ListaCumulativo[TitoloCorrisp].Quantita = ListaCumulativo[TitoloCorrisp].Quantita.toString()
                   
                   switch(ListaSpedizioniFinale[j].STATO)
                   {
                          case 'PRENOTATO' : ListaCumulativo[TitoloCorrisp].Prenotati = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].Prenotati);
                                     ListaCumulativo[TitoloCorrisp].Prenotati = ListaCumulativo[TitoloCorrisp].Prenotati.toString();
                                     break;
                          case 'DA SPEDIRE' : ListaCumulativo[TitoloCorrisp].DaSpedire = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].DaSpedire);
                                     ListaCumulativo[TitoloCorrisp].DaSpedire = ListaCumulativo[TitoloCorrisp].DaSpedire.toString();
                                     break;
                          case 'CONSEGNATO' : ListaCumulativo[TitoloCorrisp].Consegnati = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].Consegnati);
                                     ListaCumulativo[TitoloCorrisp].Consegnati = ListaCumulativo[TitoloCorrisp].Consegnati.toString();
                                     break;
                   }
                }                 
            }
            
            for(let k = 0;k < ListaCumulativo.length;k ++)
            {
              BodySheetCum['A' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Codice);
              BodySheetCum['B' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Nome);
              BodySheetCum['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Quantita);
              BodySheetCum['D' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Prenotati);
              BodySheetCum['E' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].DaSpedire);
              BodySheetCum['F' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Consegnati);
            }
                
            
            BodySheet["!cols"] = [             
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 250},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 200},
                                   {wpx: 50},
                                   {wpx: 100}
                                 ];
            BodySheet['!ref'] = 'A1:I1' + parseInt(ListaSpedizioniFinale.length + 1);
            
            BodySheetCum["!cols"] = [             
                                      {wpx: 150},
                                      {wpx: 200},
                                      {wpx: 100},
                                      {wpx: 100},
                                      {wpx: 100},
                                      {wpx: 100}
                                    ];
            BodySheetCum['!ref'] = 'A1:F1' + parseInt(ListaCumulativo.length + 1);
            
            WBook.SheetNames.push(SheetName);
            WBook.SheetNames.push(SheetNameCum);
            WBook.Sheets[SheetName]    = BodySheet;
            WBook.Sheets[SheetNameCum] = BodySheetCum;
            
            var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), "Spedizioni.xlsx")                                       
         }
         else SystemInformation.ApplyOnError('Modello spedizioni di confronto per xls non conforme','')
       },'SQLAdminXls');
    }
    else
    {
       BodySheet       = {};
       BodySheet['A1'] = SystemInformation.GetCellaIntestazione('DESTINATARIO');
       BodySheet['B1'] = SystemInformation.GetCellaIntestazione('DOCENTE');
       BodySheet['C1'] = SystemInformation.GetCellaIntestazione('INDIRIZZO');
       BodySheet['D1'] = SystemInformation.GetCellaIntestazione('DATA');
       BodySheet['E1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
       BodySheet['F1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheet['G1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheet['H1'] = SystemInformation.GetCellaIntestazione('QUANTITA');
       BodySheet['I1'] = SystemInformation.GetCellaIntestazione('STATO');
       
       BodySheetCum       = {};
       BodySheetCum['A1'] = SystemInformation.GetCellaIntestazione('ISBN');
       BodySheetCum['B1'] = SystemInformation.GetCellaIntestazione('TITOLO');
       BodySheetCum['C1'] = SystemInformation.GetCellaIntestazione('TOTALE');
       BodySheetCum['D1'] = SystemInformation.GetCellaIntestazione('PRENOTATI');
       BodySheetCum['E1'] = SystemInformation.GetCellaIntestazione('DA SPEDIRE');
       BodySheetCum['F1'] = SystemInformation.GetCellaIntestazione('CONSEGNATI');
       
       SystemInformation.GetSQL('Delivery',{ Dal : ZHTMLInputFromDate($scope.DataRicercaDal), Al : ZHTMLInputFromDate(TmpDate) },function(Results)
       {
         var ListaSpedizioniToFilter = [];
         var SpedCorrisp             = {};
         var ListaSpedizioniFinale   = [];

         ListaSpedizioniToFilter = SystemInformation.FindResults(Results,'MyDeliveryListXls');
         if(ListaSpedizioniToFilter != undefined)
         {
            for(let i = 0;i < ListaSpedizioniToFilter.length;i ++)
            {
               SpedCorrisp = SpedizioniFiltrate.find(function(ASpedizione){return (ASpedizione.Chiave == ListaSpedizioniToFilter[i].CHIAVE);});
               if(SpedCorrisp)
                  ListaSpedizioniFinale.push(ListaSpedizioniToFilter[i]);
            }                              
            
            var ChiaveSpedizione = -1;                          
            for(let j = 0;j < ListaSpedizioniFinale.length;j ++)
            {
                switch(ListaSpedizioniFinale[j].STATO)
                {
                       case 'S' : ListaSpedizioniFinale[j].STATO = 'DA SPEDIRE';
                                  break;
                       case 'P' : ListaSpedizioniFinale[j].STATO = 'PRENOTATO';
                                  break;
                       case 'C' : ListaSpedizioniFinale[j].STATO = 'CONSEGNATO';
                                  break;
                }
                
                if (ChiaveSpedizione != ListaSpedizioniFinale[j].CHIAVE)
                {
                    BodySheet['A' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].PRESSO);
                    BodySheet['B' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_DOCENTE == undefined ? '' : ListaSpedizioniFinale[j].NOME_DOCENTE);
                    BodySheet['C' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].INDIRIZZO + ', ' + ListaSpedizioniFinale[j].COMUNE + ', ' + ListaSpedizioniFinale[j].CAP + ', ' + ListaSpedizioniFinale[j].NOME_PROVINCIA);
                    BodySheet['D' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(ListaSpedizioniFinale[j].DATA)));
                    BodySheet['E' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_PROMOTORE.toUpperCase()); 
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                else
                {
                    BodySheet['F' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].CODICE_TITOLO);
                    BodySheet['G' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].NOME_TITOLO);
                    BodySheet['H' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].QUANTITA);
                    BodySheet['I' + parseInt(j + 2)] = SystemInformation.GetCellaDati('s',ListaSpedizioniFinale[j].STATO);
                    
                    ChiaveSpedizione = ListaSpedizioniFinale[j].CHIAVE;
                }
                
                TitoloCorrisp = ListaCumulativo.findIndex(function(ATitolo){return(ATitolo.Codice == ListaSpedizioniFinale[j].CODICE_TITOLO);});
                if(TitoloCorrisp == -1)
                {
                   ListaCumulativo.push({
                                          Codice   : ListaSpedizioniFinale[j].CODICE_TITOLO,
                                          Nome     : ListaSpedizioniFinale[j].NOME_TITOLO,
                                          Quantita : ListaSpedizioniFinale[j].QUANTITA,
                                          Prenotati  : '0',
                                          DaSpedire  : '0',
                                          Consegnati : '0'
                                        })
                   switch(ListaSpedizioniFinale[j].STATO)
                   {
                          case 'PRENOTATO' : ListaCumulativo[ListaCumulativo.length-1].Prenotati = ListaSpedizioniFinale[j].QUANTITA;
                                     break;
                          case 'DA SPEDIRE' : ListaCumulativo[ListaCumulativo.length-1].DaSpedire = ListaSpedizioniFinale[j].QUANTITA;
                                     break;
                          case 'CONSEGNATO' : ListaCumulativo[ListaCumulativo.length-1].Consegnati = ListaSpedizioniFinale[j].QUANTITA;
                                     break
                   }
                }                   
                else 
                {
                   ListaCumulativo[TitoloCorrisp].Quantita = parseInt(ListaCumulativo[TitoloCorrisp].Quantita) + parseInt(ListaSpedizioniFinale[j].QUANTITA);   
                   ListaCumulativo[TitoloCorrisp].Quantita = ListaCumulativo[TitoloCorrisp].Quantita.toString()
                   switch(ListaSpedizioniFinale[j].STATO)
                   {
                          case 'PRENOTATO' : ListaCumulativo[TitoloCorrisp].Prenotati = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].Prenotati);
                                     ListaCumulativo[TitoloCorrisp].Prenotati = ListaCumulativo[TitoloCorrisp].Prenotati.toString();
                                     break;
                          case 'DA SPEDIRE' : ListaCumulativo[TitoloCorrisp].DaSpedire = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].DaSpedire);
                                     ListaCumulativo[TitoloCorrisp].DaSpedire = ListaCumulativo[TitoloCorrisp].DaSpedire.toString();
                                     break;
                          case 'CONSEGNATO' : ListaCumulativo[TitoloCorrisp].Consegnati = parseInt(ListaSpedizioniFinale[j].QUANTITA) + parseInt(ListaCumulativo[TitoloCorrisp].Consegnati);
                                     ListaCumulativo[TitoloCorrisp].Consegnati = ListaCumulativo[TitoloCorrisp].Consegnati.toString();
                                     break;
                   }                                
                }                   
            }
            
            for(let k = 0;k < ListaCumulativo.length;k ++)
            {
              BodySheetCum['A' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Codice);
              BodySheetCum['B' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Nome);
              BodySheetCum['C' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Quantita);
              BodySheetCum['D' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Prenotati);
              BodySheetCum['E' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].DaSpedire);
              BodySheetCum['F' + parseInt(k + 2)] = SystemInformation.GetCellaDati('s',ListaCumulativo[k].Consegnati);
            }
            
            
            BodySheet["!cols"] = [             
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 250},
                                   {wpx: 150},
                                   {wpx: 150},
                                   {wpx: 200},
                                   {wpx: 50},
                                   {wpx: 100}
                                 ];
            BodySheet['!ref'] = 'A1:I1' + parseInt(ListaSpedizioniFinale.length + 1);
            
            BodySheetCum["!cols"] = [             
                                      {wpx: 150},
                                      {wpx: 200},
                                      {wpx: 100},
                                      {wpx: 100},
                                      {wpx: 100},
                                      {wpx: 100}
                                    ];
            BodySheetCum['!ref'] = 'A1:F1' + parseInt(ListaCumulativo.length + 1);
            
            WBook.SheetNames.push(SheetName);
            WBook.SheetNames.push(SheetNameCum);
            WBook.Sheets[SheetName]    = BodySheet;
            WBook.Sheets[SheetNameCum] = BodySheetCum;

            var Data           = new Date();
            var DataAnno       = Data.getFullYear();
            var DataMese       = Data.getMonth()+1; 
            var DataGiorno     = Data.getDate();
            var DataLista      = DataGiorno.toString() + '/' + DataMese.toString() +  '/' + DataAnno.toString();
            
            var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), "Spedizioni" + DataLista + ".xlsx")                            
         }
         else SystemInformation.ApplyOnError('Modello spedizioni di confronto per xls non conforme','')
       },'SQLPromotoreXls');        
    }
  }
  
  $scope.ModificaSpedizione = function (ChiaveSpedizione,ChiaveDocente = -1)
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = ChiaveSpedizione;
    SystemInformation.DataBetweenController.ChiaveDocente    = ChiaveDocente;
    SystemInformation.DataBetweenController.Provenienza      = 'DeliveryPage';
    $state.go("deliveryModDetailPage"); 
  }
  
  $scope.EliminaSpedizione = function (Spedizione)
  {
    var EliminaSped = function()
    {
      var $ObjQuery       = { Operazioni : [] };
      var ParamSpedizione = { CHIAVE : Spedizione.Chiave };
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteDeliveryBookAll',
                                  Parametri : ParamSpedizione
                                });  

      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteDelivery',
                                  Parametri : ParamSpedizione
                                });
      
      SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaSpedizioniAll();
        $ObjQuery.Operazioni = [];
      });
    }
    ZConfirm.GetConfirmBox('AVVISO',"Eliminare la spedizione del " +  $scope.ConvertiData(Spedizione) + " presso " + Spedizione.Presso + " ?",EliminaSped,function(){});  
  }
  
  $scope.PassaADaSpedireDisponibili = function (ChiaveSped)
  {
    var PassaTitDaSped = function()
    {
      SystemInformation.GetSQL('Delivery',{CHIAVE : ChiaveSped},function(Results)
      {
        SpedizioneDettaglio = SystemInformation.FindResults(Results,'DeliveryDettaglio');
        if(SpedizioneDettaglio != undefined)
        {
            var ListaTitoliSped = [];
            for(let i = 0;i < SpedizioneDettaglio.length;i ++)
            {
                ListaTitoliSped.push({
                                      "TitoloNome"      : SpedizioneDettaglio[i].NOME_TITOLO,
                                      "Titolo"          : SpedizioneDettaglio[i].TITOLO,
                                      "ChiaveDettaglio" : SpedizioneDettaglio[i].CHIAVE,
                                      "QuantitaMgzn"    : SpedizioneDettaglio[i].QUANTITA_MGZN,
                                      "Quantita"        : SpedizioneDettaglio[i].QUANTITA,
                                      "Stato"           : SpedizioneDettaglio[i].STATO
                                    });
            }
            var $ObjQuery = { Operazioni : [] }; 
            var TitoliNonDisponibili = [];
            var TitoliDaSpedire      = [];
            var TitoliAlreadyGestiti = [];              
            for(let j = 0;j < ListaTitoliSped.length;j ++)
            {
              if(ListaTitoliSped[j].Stato == 'P' && (parseInt(ListaTitoliSped[j].Quantita) <= parseInt(ListaTitoliSped[j].QuantitaMgzn)))
              {
                var ParamSpedizione = {
                                        "CHIAVE" : ListaTitoliSped[j].ChiaveDettaglio
                                      }
                $ObjQuery.Operazioni.push({
                                            Query     : 'ChangeDeliveryToSend',
                                            Parametri : ParamSpedizione
                                          })
                var OggettoD = '';
                OggettoD     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                TitoliDaSpedire.push(OggettoD);
              }
              else
              {
                if(ListaTitoliSped[j].Stato == 'C' || ListaTitoliSped[j].Stato == 'S')
                {
                  var OggettoNd = '';
                  OggettoAg     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                  TitoliAlreadyGestiti.push(OggettoAg);
                }
                else
                {
                  var OggettoNd = '';
                  OggettoNd     = '\n' + 'Nr° : ' + ListaTitoliSped[j].Quantita.toString() + ' - ' + ListaTitoliSped[j].TitoloNome.toString();
                  TitoliNonDisponibili.push(OggettoNd);
                } 
              }             
            }
            SystemInformation.PostSQL('Delivery',$ObjQuery,function(Results) 
            {                            
              if(TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length == 0 && TitoliAlreadyGestiti.length == 0)               
                 ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              else if (TitoliNonDisponibili.length == 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length == 0)
                       ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire)
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length == 0)
                       ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili)
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length != 0)
                       ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili +  ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti)
              else if (TitoliNonDisponibili.length == 0 && TitoliDaSpedire.length != 0 && TitoliAlreadyGestiti.length != 0)
                       ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli sono stati segnati come DA SPEDIRE : ' + TitoliDaSpedire + ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti);
              else if (TitoliNonDisponibili.length != 0 && TitoliDaSpedire.length == 0 && TitoliAlreadyGestiti.length != 0)   
                    ZCustomAlert($mdDialog,'AVVISO','I seguenti titoli non sono disponibili per essere spediti:  ' + TitoliNonDisponibili + ' --- I seguenti titoli sono già stati gestiti:  ' + TitoliAlreadyGestiti)
  
              $scope.ListaSpedizioni = [];
              $scope.RefreshListaSpedizioniAll();
            })                       
        }
        else SystemInformation.ApplyOnError('Modello dettaglio spedizione non conforme','');
      },'SQLDettaglioSpedizioneGenerico');
    }
    ZConfirm.GetConfirmBox('AVVISO',"Passare tutti i titoli della spedizione da PRENOTATI(DISPONIBILI) a DA SPEDIRE?",PassaTitDaSped,function(){}); 
  }

  $scope.NuovaSpedizioneCasaEditrice = function ()
  {
    SystemInformation.DataBetweenController.ChiaveSpedizione = -1;
    SystemInformation.DataBetweenController.ChiaveDocente    = -1;
    SystemInformation.DataBetweenController.Provenienza      = 'DeliveryPage';
    $state.go("deliveryModDetailPage");  
  }  
  
  $scope.GetListaGruppi();
  $scope.RefreshListaSpedizioniAll();
  
}]);

SIRIOApp.filter('SpedizioneByFiltro',function()
{
  return function(ListaSpedizioni,ProvinciaFiltro,PrenotataFiltro,DaSpedireFiltro,ConsegnataFiltro,PromotoreFiltro,IstitutoFiltro,DocenteFiltro,TitoloFiltro)
         {
           if (ListaSpedizioni != undefined)
           {  
             if(ProvinciaFiltro == -1 && !PrenotataFiltro && !DaSpedireFiltro && !ConsegnataFiltro && PromotoreFiltro == -1 && IstitutoFiltro == -1 && DocenteFiltro == -1 && TitoloFiltro == -1) 
                return(ListaSpedizioni);
             var ListaFiltrata = [];
             ProvinciaFiltro = parseInt(ProvinciaFiltro);

             
             
             var SpedizioneOk = function(Spedizione)
             { 
                var TitoliTrovati = 0; 
                var Result = true;
                if(ProvinciaFiltro != -1)
                   if(Spedizione.Provincia != ProvinciaFiltro)
                      Result = false;
                
                if(DocenteFiltro != -1)
                   if(Spedizione.Docente != DocenteFiltro)
                      Result = false;
                      
                if(IstitutoFiltro != -1)
                    if(Spedizione.Istituto != IstitutoFiltro)
                       Result = false;
                
                if(PromotoreFiltro != -1)
                    if(Spedizione.Promotore != PromotoreFiltro)
                       Result = false;

                if(TitoloFiltro != -1)
                {
                  for(let i = 0;i < Spedizione.DettagliTitoli.length;i ++)
                    if(Spedizione.DettagliTitoli[i].Titolo == TitoloFiltro)
                       TitoliTrovati++
                  if (TitoliTrovati == 0) 
                      Result = false;
                }
                
                if(Result)
                   Result = (Spedizione.NrPrenotate  != 0 && PrenotataFiltro) ||
                            (Spedizione.NrDaSpedire  != 0 && DaSpedireFiltro) ||
                            (Spedizione.NrConsegnate != 0 && ConsegnataFiltro);
                     
                return(Result);
             }
             
              ListaSpedizioni.forEach(function(Spedizione)
              { 
                if(SpedizioneOk(Spedizione)) 
                   ListaFiltrata.push(Spedizione)                       
              });
              
              return(ListaFiltrata);
           }
         }
});

