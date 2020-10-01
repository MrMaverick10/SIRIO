SIRIOApp.controller("deliveryModDetailPageController",['$scope','SystemInformation','$state','$rootScope','$mdDialog',
function($scope,SystemInformation,$state,$rootScope,$mdDialog)
{ 
  $scope.SpedizioneMultipla              = false;
  $scope.ListaIstitutiDoc                = [];
  $scope.ListaTitoliEliminati            = [];
  $scope.NuovaSpedizioneCasaEd           = false;
  $scope.ListaIstitutiSped               = [];
  $scope.SpedizioneAIstituto             = false;
  $scope.IstitutoSelezionato             = '';
  
  ScopeHeaderController.CheckButtons();
  
  $scope.IndirizzoByIstituto = function (Istituto)
  {
    if(Istituto == -1)
    {
     $scope.SpedizioneInEditing.INDIRIZZO       = DocenteDettaglio[0].INDIRIZZO == null ? '' : DocenteDettaglio[0].INDIRIZZO;
     $scope.SpedizioneInEditing.COMUNE          = DocenteDettaglio[0].COMUNE    == null ? '' : DocenteDettaglio[0].COMUNE;
     $scope.SpedizioneInEditing.CAP             = DocenteDettaglio[0].CAP       == null ? '' : DocenteDettaglio[0].CAP;
     $scope.SpedizioneInEditing.PROVINCIA       = DocenteDettaglio[0].PROVINCIA == null ? -1 : DocenteDettaglio[0].PROVINCIA;
     $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaDoc                  == undefined ? '' : ProvinciaDoc.Nome;
     $scope.SpedizioneInEditing.ISTITUTO        = -1
    }
    else
    {
      IstitutoCorrisp     = $scope.ListaIstitutiDoc.find(function(AIstituto){return(AIstituto.CHIAVE == Istituto);});
      ProvinciaAllCorrisp = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Nome == IstitutoCorrisp.PROVINCIA_NOME);});
     
      $scope.SpedizioneInEditing.INDIRIZZO       = IstitutoCorrisp.INDIRIZZO  == null ? '': IstitutoCorrisp.INDIRIZZO;
      $scope.SpedizioneInEditing.COMUNE          = IstitutoCorrisp.COMUNE     == null ? '': IstitutoCorrisp.COMUNE;
      $scope.SpedizioneInEditing.CAP             = IstitutoCorrisp.CAP        == null ? '': IstitutoCorrisp.CAP;
      $scope.SpedizioneInEditing.PROVINCIA       = ProvinciaAllCorrisp.Chiave == undefined ? -1 : ProvinciaAllCorrisp.Chiave;
      $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaAllCorrisp.Nome   == undefined ? '' : IstitutoCorrisp.Nome;
      $scope.SpedizioneInEditing.ISTITUTO        = Istituto;
    }
  }
  
  if(Array.isArray(SystemInformation.DataBetweenController.ListaDocSped) && SystemInformation.DataBetweenController.ListaDocSped.length > 0 && SystemInformation.DataBetweenController.SpedizioneMultipla)
  {  
     
     $scope.SpedizioneMultipla                = true;
     $scope.ListaDocentiSpedizione            = SystemInformation.DataBetweenController.ListaDocSped;
     $scope.ListaDocentiSpedizionePerMultipla = Array.from(SystemInformation.DataBetweenController.ListaDocSped);
     $scope.ListaDocentiEsclusi               = [];
     if(SystemInformation.DataBetweenController.IstitutoPerIndirizzo != undefined)
     {
        if(SystemInformation.DataBetweenController.IstitutoPerIndirizzo != -1)
           $scope.IstitutoSelezionato = SystemInformation.DataBetweenController.IstitutoPerIndirizzo
        else $scope.IstitutoSelezionato = '';      //= SystemInformation.DataBetweenController.IstitutoPerIndirizzo == undefined ? '' : SystemInformation.DataBetweenController.IstitutoPerIndirizzo;
     }
     
     for(let i = 0;i < $scope.ListaDocentiSpedizione.length;)
     {
         if ($scope.ListaDocentiSpedizione[i].IndirizzoDocente === "" || $scope.ListaDocentiSpedizione[i].ComuneDocente === "" || $scope.ListaDocentiSpedizione[i].CapDocente === "" || $scope.ListaDocentiSpedizione[i].ProvinciaDocente == -1 || $scope.ListaDocentiSpedizione[i].ProvinciaDocenteNome === "")
         {    
             $scope.ListaDocentiEsclusi.push($scope.ListaDocentiSpedizione[i]);
             $scope.ListaDocentiSpedizione.splice(i,1)
         }
         else i++;          
     }
  }     
    
  $scope.ChiaveSpedizione                                  = SystemInformation.DataBetweenController.ChiaveSpedizione;
  $scope.ChiaveDocente                                     = SystemInformation.DataBetweenController.ChiaveDocente;
  SystemInformation.DataBetweenController.ChiaveSpedizione = '';
  SystemInformation.DataBetweenController.ChiaveDocente    = '';
  //SystemInformation.DataBetweenController.ListaDocSped     = [];
  
  if($scope.ChiaveDocente == undefined && $scope.ChiaveSpedizione == undefined && !($scope.SpedizioneMultipla))
  {
   SystemInformation.DataBetweenController = {};
   $state.go("deliveryListPage")
  }
  else
  {
    var LoadTitoli = function()
    {    
      SystemInformation.GetSQL('Accessories', {}, function(Results)  
      {  
        TitoliInfoLista = SystemInformation.FindResults(Results,'BookList');
        if(TitoliInfoLista != undefined)
        { 
           for(let i = 0; i < TitoliInfoLista.length; i++)
               TitoliInfoLista[i] = { 
                                      Chiave       : TitoliInfoLista[i].CHIAVE,
                                      Nome         : TitoliInfoLista[i].TITOLO == null ? 'N.D' : TitoliInfoLista[i].TITOLO,
                                      Quantita     : parseInt(TitoliInfoLista[i].QUANTITA_MGZN),
                                      QuantitaVol  : parseInt(TitoliInfoLista[i].QUANTITA_MGZN_VOL),
                                      QuantitaDisp : parseInt(TitoliInfoLista[i].QUANTITA_DISP),
                                      Codice       : TitoliInfoLista[i].CODICE_ISBN == null ? 'N.D.' : TitoliInfoLista[i].CODICE_ISBN
                                    }
           $scope.ListaTitoli = TitoliInfoLista;
           GestioneParametri();
        }
        else SystemInformation.ApplyOnError('Modello titoli non conforme','');   
      },'SelectTitoliSQL');
    }
    
    var LoadProvince = function()
    {    
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
          LoadTitoli();
        }
        else SystemInformation.ApplyOnError('Modello province non conforme','');    
      });
    }

    var LoadIstituti = function()
    {
      SystemInformation.GetSQL('Institute', {}, function(Results)  
      {  
        IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
        if(IstitutiInfoLista != undefined)
        { 
           for(let i = 0; i < IstitutiInfoLista.length; i++)
               IstitutiInfoLista[i] = { 
                                        Chiave     : IstitutiInfoLista[i].CHIAVE,
                                        Istituto   : IstitutiInfoLista[i].NOME
                                      }
           $scope.ListaIstituti = IstitutiInfoLista;
           LoadProvince();
        }
        else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
      },'SelectSQLOnlyVisible');
    }
    
    LoadIstituti();
        
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

        
    $scope.GridOptions2 = {
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
                          
    var GestioneParametri = function()
    { 
       //NUOVA SPEDIZIONE DOCENTI MULTIPLA
       var IstitutiListaSped = [];
       if($scope.SpedizioneMultipla && $scope.ChiaveDocente == undefined && $scope.ChiaveSpedizione == undefined)
       {
          SystemInformation.GetSQL('Institute', {}, function(Results)  
          {  
            IstitutiListaSped = SystemInformation.FindResults(Results,'InstituteForDeliveryList');
            if(IstitutiListaSped != undefined)
            { 
               $scope.SpedizioneInEditing        = {};
               $scope.SpedizioneInEditing.CHIAVE = -1
               $scope.ListaTitoliSpedizione      = [];
               $scope.SpedizioneInEditing.DATA   = new Date();
               var IstitutoCorrisp               = {};
               
               for(let i = 0; i < IstitutiListaSped.length; i++)
                   IstitutiListaSped[i] = { 
                                            Chiave     : IstitutiListaSped[i].CHIAVE,
                                            Istituto   : IstitutiListaSped[i].NOME,
                                            Indirizzo  : IstitutiListaSped[i].INDIRIZZO,
                                            Comune     : IstitutiListaSped[i].COMUNE,
                                            Cap        : IstitutiListaSped[i].CAP,
                                            Provincia  : IstitutiListaSped[i].PROVINCIA_LISTA_ALL
                                          }
               $scope.ListaIstitutiSped = IstitutiListaSped;

               $scope.ResetCampi = function()
               {
                 if(!$scope.SpedizioneAIstituto)
                 {
                   $scope.IstitutoSelezionato           = '';
                   $scope.SpedizioneInEditing.INDIRIZZO = '';
                   $scope.SpedizioneInEditing.COMUNE    = '';
                   $scope.SpedizioneInEditing.CAP       = '';
                   $scope.SpedizioneInEditing.PROVINCIA = -1;
                 }
               }               

               if($scope.IstitutoSelezionato != '')
               {
                 $scope.SpedizioneAIstituto           = true;
                 IstitutoCorrisp                      = $scope.ListaIstitutiSped.find(function(AIstituto){return(AIstituto.Chiave == $scope.IstitutoSelezionato);});
                 
                 if(IstitutoCorrisp != undefined)
                 {
                    $scope.IstitutoSelezionato           = IstitutoCorrisp.Istituto;
                    $scope.SpedizioneInEditing.INDIRIZZO = IstitutoCorrisp.Indirizzo;
                    $scope.SpedizioneInEditing.COMUNE    = IstitutoCorrisp.Comune;
                    $scope.SpedizioneInEditing.CAP       = IstitutoCorrisp.Cap;
                    $scope.SpedizioneInEditing.PROVINCIA = IstitutoCorrisp.Provincia;
                    $scope.SpedizioneInEditing.ISTITUTO  = IstitutoCorrisp.Chiave;
                 }
                 else
                 {
                    $scope.SpedizioneInEditing.INDIRIZZO = '';
                    $scope.SpedizioneInEditing.COMUNE    = '';
                    $scope.SpedizioneInEditing.CAP       = '';
                    $scope.SpedizioneInEditing.PROVINCIA = -1;
                    $scope.SpedizioneInEditing.ISTITUTO  = -1;
                 }
               }
               
               if($scope.SpedizioneMultipla)
               {
                  $scope.Multipla = true;
                  if($scope.IstitutoSelezionato != '')
                     $scope.NumeroDocenti = $scope.ListaDocentiSpedizionePerMultipla.length
                  else $scope.NumeroDocenti = $scope.ListaDocentiSpedizione.length;
               }
               
               $scope.PassaADaSpedire = function (Titolo)
               {
                 if (Titolo.STATO == 'P')
                 {
                     if(Titolo.Nuovo == true)
                        Titolo.STATO = 'S';
                     else 
                     {
                       Titolo.STATO = 'S';
                       Titolo.Modificato = true;
                     }          
                 }
               }

               $scope.queryIstituto = function(searchTextIstituto)
               {
                  searchTextIstituto = searchTextIstituto.toUpperCase();
                  return($scope.ListaIstitutiSped.grep(function(Elemento) 
                  { 
                    return(Elemento.Istituto.toUpperCase().indexOf(searchTextIstituto) != -1);
                  }));
               }
               
               $scope.selectedItemChangeIstituto = function(itemIstituto)
               {
                 if(itemIstituto != undefined)
                 {
                    $scope.SpedizioneInEditing.INDIRIZZO = '';
                    $scope.SpedizioneInEditing.COMUNE    = '';
                    $scope.SpedizioneInEditing.CAP       = '';
                    $scope.SpedizioneInEditing.PROVINCIA = '';
                    $scope.IstitutoSelezionato           = itemIstituto.Chiave;
                    $scope.SpedizioneInEditing.INDIRIZZO = itemIstituto.Indirizzo;
                    $scope.SpedizioneInEditing.COMUNE    = itemIstituto.Comune;
                    $scope.SpedizioneInEditing.CAP       = itemIstituto.Cap;
                    $scope.SpedizioneInEditing.PROVINCIA = itemIstituto.Provincia;
                    $scope.SpedizioneInEditing.ISTITUTO  = itemIstituto.Chiave;
                    //$scope.SpedizioneAIstituto = true;
                 }
                 else 
                 {
                    $scope.IstitutoSelezionato = -1;
                    //$scope.SpedizioneAIstituto = false;
                 }
               }                     
            }
            else SystemInformation.ApplyOnError('Modello indirizzi istituti per spedizione non conforme','');   
          },'SelectInstituteDelivery');               
       }
       
       //NUOVA SPEDIZIONE DOCENTE       
       if($scope.ChiaveDocente != -1 && $scope.ChiaveSpedizione == -1 && !($scope.SpedizioneMultipla))
       {    
          $scope.SpedizioneInEditing    = {};
          $scope.ProvinciaDoc           = {};
          
          SystemInformation.GetSQL('Teacher', {CHIAVE : $scope.ChiaveDocente}, function(Results)
          {
            DocenteDettaglio = SystemInformation.FindResults(Results,'TeacherDettaglio');
            IstitutiDoc      = SystemInformation.FindResults(Results,'TeacherInstitute');
            ProvinciaDoc     = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Chiave == DocenteDettaglio[0].PROVINCIA);});

            if(DocenteDettaglio != undefined && IstitutiDoc != undefined)
            {

              $scope.ListaIstitutiDoc                    = IstitutiDoc;
              $scope.ListaTitoliSpedizione               = [];
              $scope.ListaTitoliEliminati                = [];
              $scope.SpedizioneInEditing.CHIAVE          = -1;
              $scope.SpedizioneInEditing.DOCENTE         = $scope.ChiaveDocente;
              $scope.SpedizioneInEditing.DOCENTE_NOME    = DocenteDettaglio[0].RAGIONE_SOCIALE;
              $scope.SpedizioneInEditing.PRESSO          = DocenteDettaglio[0].RAGIONE_SOCIALE;
              $scope.SpedizioneInEditing.DATA            = new Date();
              $scope.SpedizioneInEditing.ISTITUTO        = -1;              
              
              if($scope.ListaIstitutiDoc.length == 1)
              {
                 $scope.IstitutoDoc = $scope.ListaIstitutiDoc[0].CHIAVE;
                 $scope.IndirizzoByIstituto($scope.ListaIstitutiDoc[0].CHIAVE)
                 $scope.SpedizioneInEditing.ISTITUTO = $scope.IstitutoDoc;               
              }
              else
              {
                 $scope.SpedizioneInEditing.INDIRIZZO       = '';
                 $scope.SpedizioneInEditing.COMUNE          = '';
                 $scope.SpedizioneInEditing.CAP             = '';
                 $scope.SpedizioneInEditing.PROVINCIA       = -1;
                 $scope.SpedizioneInEditing.PROVINCIA_NOME  = '';
              }               
              /*$scope.SpedizioneInEditing.CHIAVE          = -1;
              $scope.SpedizioneInEditing.DOCENTE         = $scope.ChiaveDocente;
              $scope.SpedizioneInEditing.DOCENTE_NOME    = DocenteDettaglio[0].RAGIONE_SOCIALE;
              $scope.SpedizioneInEditing.PRESSO          = DocenteDettaglio[0].RAGIONE_SOCIALE;
              $scope.SpedizioneInEditing.INDIRIZZO       = DocenteDettaglio[0].INDIRIZZO == null ? '' : DocenteDettaglio[0].INDIRIZZO;
              $scope.SpedizioneInEditing.COMUNE          = DocenteDettaglio[0].COMUNE    == null ? '' : DocenteDettaglio[0].COMUNE;
              $scope.SpedizioneInEditing.CAP             = DocenteDettaglio[0].CAP       == null ? '' : DocenteDettaglio[0].CAP;
              $scope.SpedizioneInEditing.PROVINCIA       = DocenteDettaglio[0].PROVINCIA == null ? -1 : DocenteDettaglio[0].PROVINCIA;
              $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaDoc                  == undefined ? '' : ProvinciaDoc.Nome; 
              $scope.SpedizioneInEditing.DATA            = new Date();
              $scope.ListaIstitutiDoc                    = IstitutiDoc;
              $scope.ListaTitoliSpedizione               = [];
              $scope.ListaTitoliEliminati                = [];*/           
            }       
            else SystemInformation.ApplyOnError('Modello docente per spedizione non conforme','');      
          },'SQLDettaglio'); 
          
          $scope.PassaADaSpedire = function (Titolo)
          {
            if (Titolo.STATO == 'P')
            {
                if(Titolo.Nuovo == true)
                   Titolo.STATO = 'S';
                else 
                {
                  Titolo.STATO = 'S';
                  Titolo.Modificato = true;
                }          
            }
          }        
       }
       
       //MODIFICA SPEDIZIONE DOCENTE       
       if($scope.ChiaveDocente != -1 && $scope.ChiaveSpedizione != -1 && !($scope.SpedizioneMultipla))
       {              
          SystemInformation.GetSQL('Delivery',{CHIAVE : $scope.ChiaveSpedizione},function(Results)
          {
            $scope.SpedizioneInEditing = {};
            
            DettaglioSpedizioneDoc       = SystemInformation.FindResults(Results,'TeacherDelivery');
            DettaglioSpedizioneTitoloDoc = SystemInformation.FindResults(Results,'TeacherDeliveryBook');
           
            if(DettaglioSpedizioneDoc != undefined && DettaglioSpedizioneTitoloDoc != undefined)
            { 
                $scope.SpedizioneInEditing.CHIAVE           = $scope.ChiaveSpedizione;
                $scope.SpedizioneInEditing.DOCENTE          = $scope.ChiaveDocente;
                $scope.SpedizioneInEditing.PRESSO           = DettaglioSpedizioneDoc[0].PRESSO;
                $scope.SpedizioneInEditing.STATO            = DettaglioSpedizioneDoc[0].STATO;
                $scope.SpedizioneInEditing.INDIRIZZO        = DettaglioSpedizioneDoc[0].INDIRIZZO;
                $scope.SpedizioneInEditing.COMUNE           = DettaglioSpedizioneDoc[0].COMUNE;
                $scope.SpedizioneInEditing.CAP              = DettaglioSpedizioneDoc[0].CAP;
                $scope.SpedizioneInEditing.PROVINCIA        = DettaglioSpedizioneDoc[0].PROVINCIA
                $scope.SpedizioneInEditing.DATA             = new Date(DettaglioSpedizioneDoc[0].DATA);
                $scope.ListaTitoliSpedizione                = [];
                $scope.ListaTitoliEliminati                 = [];
                $scope.SpedizioneInEditing.ISTITUTO         = DettaglioSpedizioneDoc[0].ISTITUTO == null ? -1 : DettaglioSpedizioneDoc[0].ISTITUTO;
                
                for(let i = 0;i < DettaglioSpedizioneTitoloDoc.length;i ++)
                {
                    if(DettaglioSpedizioneTitoloDoc[i].SPEDIZIONE == $scope.ChiaveSpedizione)
                    $scope.ListaTitoliSpedizione.push({
                                                        "CHIAVE"        : DettaglioSpedizioneTitoloDoc[i].CHIAVE,
                                                        "SPEDIZIONE"    : DettaglioSpedizioneTitoloDoc[i].SPEDIZIONE,
                                                        "TITOLO"        : DettaglioSpedizioneTitoloDoc[i].TITOLO,
                                                        "NOME_TITOLO"   : DettaglioSpedizioneTitoloDoc[i].NOME_TITOLO,
                                                        "QUANTITA"      : parseInt(DettaglioSpedizioneTitoloDoc[i].QUANTITA),
                                                        "STATO"         : DettaglioSpedizioneTitoloDoc[i].STATO,
                                                        "QUANTITA_MGZN" : parseInt(DettaglioSpedizioneTitoloDoc[i].QUANTITA_MGZN),
                                                        "QUANTITA_DISP" : parseInt(DettaglioSpedizioneTitoloDoc[i].QUANTITA_DISP),
                                                        "Nuovo"         : false,
                                                        "Modificato"    : false,
                                                        "Eliminato"     : false
                                                      }) 
                }
                SystemInformation.GetSQL('Teacher', {CHIAVE : $scope.ChiaveDocente}, function(Results)
                { 
                  $scope.DocenteDati = {};
                  DocenteDettaglio   = SystemInformation.FindResults(Results,'TeacherDettaglio');
                  IstitutiDoc        = SystemInformation.FindResults(Results,'TeacherInstitute');
                  ProvinciaDoc       = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Chiave == DocenteDettaglio[0].PROVINCIA);});

                  if(DocenteDettaglio != undefined && IstitutiDoc != undefined)
                  {
                    $scope.SpedizioneInEditing.DOCENTE_NOME = DocenteDettaglio[0].RAGIONE_SOCIALE;
                    $scope.DocenteDati.PRESSO               = DocenteDettaglio[0].RAGIONE_SOCIALE;
                    $scope.DocenteDati.INDIRIZZO            = DocenteDettaglio[0].INDIRIZZO;
                    $scope.DocenteDati.COMUNE               = DocenteDettaglio[0].COMUNE;
                    $scope.DocenteDati.CAP                  = DocenteDettaglio[0].CAP;
                    $scope.DocenteDati.PROVINCIA            = DocenteDettaglio[0].PROVINCIA;
                    $scope.ListaIstitutiDoc                 = IstitutiDoc;             
                  }       
                  else SystemInformation.ApplyOnError('Modello dati docente per spedizione non conforme','');      
                },'SQLDettaglio'); 
            }
            else SystemInformation.ApplyOnError('Modello spedizione docente non conforme','');      
          },'SQLDettaglioSpedizioneDocente'); 
          
          /*$scope.IndirizzoByIstituto = function (Istituto)
          {
            if(Istituto == -1)
            {
             $scope.SpedizioneInEditing.INDIRIZZO       = DocenteDettaglio[0].INDIRIZZO == null ? '' : DocenteDettaglio[0].INDIRIZZO;
             $scope.SpedizioneInEditing.COMUNE          = DocenteDettaglio[0].COMUNE    == null ? '' : DocenteDettaglio[0].COMUNE;
             $scope.SpedizioneInEditing.CAP             = DocenteDettaglio[0].CAP       == null ? '' : DocenteDettaglio[0].CAP;
             $scope.SpedizioneInEditing.PROVINCIA       = DocenteDettaglio[0].PROVINCIA == null ? -1 : DocenteDettaglio[0].PROVINCIA;
             $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaDoc                  == undefined ? '' : ProvinciaDoc.Nome
            }
            else
            {
              IstitutoCorrisp = $scope.ListaIstitutiDoc.find(function(AIstituto){return(AIstituto.CHIAVE == Istituto);});
              ProvinciaAllCorrisp = $scope.ListaProvinceAll.find(function(AProvincia){return(AProvincia.Nome == IstitutoCorrisp.PROVINCIA_NOME);});
             
              $scope.SpedizioneInEditing.INDIRIZZO       = IstitutoCorrisp.INDIRIZZO  == null ? '': IstitutoCorrisp.INDIRIZZO;
              $scope.SpedizioneInEditing.COMUNE          = IstitutoCorrisp.COMUNE     == null ? '': IstitutoCorrisp.COMUNE;
              $scope.SpedizioneInEditing.CAP             = IstitutoCorrisp.CAP        == null ? '': IstitutoCorrisp.CAP;
              $scope.SpedizioneInEditing.PROVINCIA       = ProvinciaAllCorrisp.Chiave == undefined ? -1 : ProvinciaAllCorrisp.Chiave;
              $scope.SpedizioneInEditing.PROVINCIA_NOME  = ProvinciaAllCorrisp.Nome   == undefined ? '' : IstitutoCorrisp.Nome; 
            }
          }*/ 
          
          $scope.PassaADaSpedire = function (Titolo)
          {
            if (Titolo.STATO == 'P')
            {
                if(Titolo.Nuovo == true)
                   Titolo.STATO = 'S';
                else 
                {
                  Titolo.STATO = 'S';
                  Titolo.Modificato = true;
                }          
            }
          }        
       }     

       //NUOVA SPEDIZIONE CASA EDITRICE
       if($scope.ChiaveDocente == -1 && $scope.ChiaveSpedizione == -1 && !($scope.SpedizioneMultipla))
       {
         $scope.NuovaSpedizioneCasaEd = true;
         $scope.SpedizioneInEditing = {};
         
         $scope.SpedizioneInEditing.CHIAVE          = -1;
         $scope.SpedizioneInEditing.PRESSO          = '';
         $scope.SpedizioneInEditing.STATO           = 'P';
         $scope.SpedizioneInEditing.INDIRIZZO       = '';
         $scope.SpedizioneInEditing.COMUNE          = '';
         $scope.SpedizioneInEditing.CAP             = '';
         $scope.SpedizioneInEditing.ISTITUTO        = -1;
         $scope.SpedizioneInEditing.PROVINCIA       = -1;
         $scope.SpedizioneInEditing.DATA            = new Date();
         $scope.ListaTitoliSpedizione               = [];
         $scope.ListaTitoliEliminati                = []; 
         
          $scope.PassaADaSpedire = function (Titolo)
          {
            if (Titolo.STATO == 'P')
            {
                if(Titolo.Nuovo == true)
                   Titolo.STATO = 'S';
                else 
                {
                  Titolo.STATO = 'S';
                  Titolo.Modificato = true;
                }          
            }
          } 
       }
       
       //MODIFICA SPEDIZIONE CASA EDITRICE
       if($scope.ChiaveDocente == -1 && $scope.ChiaveSpedizione != -1 && !($scope.SpedizioneMultipla))
       {         
         SystemInformation.GetSQL('Delivery',{CHIAVE : $scope.ChiaveSpedizione},function(Results)
         {
           $scope.SpedizioneInEditing = {};
           
           DettaglioSpedizioneCasa       = SystemInformation.FindResults(Results,'PublisherDelivery');
           DettaglioSpedizioneTitoloCasa = SystemInformation.FindResults(Results,'PublisherDeliveryBook');
           
           if(DettaglioSpedizioneCasa != undefined && DettaglioSpedizioneTitoloCasa != undefined)
           { 
               $scope.SpedizioneInEditing.CHIAVE           = $scope.ChiaveSpedizione;
               $scope.SpedizioneInEditing.PRESSO           = DettaglioSpedizioneCasa[0].PRESSO;
               $scope.SpedizioneInEditing.STATO            = DettaglioSpedizioneCasa[0].STATO;
               $scope.SpedizioneInEditing.INDIRIZZO        = DettaglioSpedizioneCasa[0].INDIRIZZO;
               $scope.SpedizioneInEditing.COMUNE           = DettaglioSpedizioneCasa[0].COMUNE;
               $scope.SpedizioneInEditing.CAP              = DettaglioSpedizioneCasa[0].CAP;
               $scope.SpedizioneInEditing.PROVINCIA        = DettaglioSpedizioneCasa[0].PROVINCIA
               $scope.SpedizioneInEditing.DATA             = new Date(DettaglioSpedizioneCasa[0].DATA);
               $scope.SpedizioneInEditing.ISTITUTO         = -1;
               $scope.ListaTitoliSpedizione                = [];
               $scope.ListaTitoliEliminati                 = [];
               
               for(let i = 0;i < DettaglioSpedizioneTitoloCasa.length;i ++)
               {
                   if(DettaglioSpedizioneTitoloCasa[i].SPEDIZIONE == $scope.ChiaveSpedizione)
                   $scope.ListaTitoliSpedizione.push({
                                                       "CHIAVE"        : DettaglioSpedizioneTitoloCasa[i].CHIAVE,
                                                       "SPEDIZIONE"    : DettaglioSpedizioneTitoloCasa[i].SPEDIZIONE,
                                                       "TITOLO"        : DettaglioSpedizioneTitoloCasa[i].TITOLO,
                                                       "NOME_TITOLO"   : DettaglioSpedizioneTitoloCasa[i].NOME_TITOLO,
                                                       "QUANTITA"      : parseInt(DettaglioSpedizioneTitoloCasa[i].QUANTITA),
                                                       "STATO"         : DettaglioSpedizioneTitoloCasa[i].STATO,
                                                       "QUANTITA_MGZN" : parseInt(DettaglioSpedizioneTitoloCasa[i].QUANTITA_MGZN),
                                                       "QUANTITA_DISP" : parseInt(DettaglioSpedizioneTitoloDoc[i].QUANTITA_DISP),                                                       
                                                       "Nuovo"         : false,
                                                       "Modificato"    : false,
                                                       "Eliminato"     : false
                                                     }) 
               }
           }
           else SystemInformation.ApplyOnError('Modello spedizione casa editrice non conforme','');      
         },'SQLDettaglioSpedizioneCasa');
         
         $scope.PassaADaSpedire = function (Titolo)
         {
           if (Titolo.STATO == 'P')
           {
               if(Titolo.Nuovo == true)
                  Titolo.STATO = 'S';
               else 
               {
                 Titolo.STATO = 'S';
                 Titolo.Modificato = true;
               }          
           }
         } 
       }
    }    
   
    $scope.AggiungiTitoloSpedizione = function (ev)
    {    
      $mdDialog.show({ 
                       controller          : DialogControllerTitoloSpedizione,
                       templateUrl         : "template/bookDeliveryPopup.html",
                       targetEvent         : ev,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true
                     })
      .then(function(answer) 
      {}, 
      function() 
      {});
    }
 
    function DialogControllerTitoloSpedizione($scope,$mdDialog)  
    {
      $scope.Titolo        = {};
      $scope.Multipla      = false;
      
      $scope.Titolo = {
                         "CHIAVE"        : -1,
                         "TITOLO"        : -1,
                         "NOME_TITOLO"   : '',
                         "QUANTITA"      : 1,
                         "STATO"         : null,
                         "QUANTITA_MGZN" : null,
                         "QUANTITA_DISP" : 0,
                         "Nuovo"         : true,
                         "Modificato"    : false,
                         "Eliminato"     : false                                   
                      } 
                      
      if($scope.SpedizioneMultipla)
      {
         $scope.Multipla = true;
         if($scope.IstitutoSelezionato != '')
            $scope.NumeroDocenti = $scope.ListaDocentiSpedizionePerMultipla.length
         else $scope.NumeroDocenti = $scope.ListaDocentiSpedizione.length;
      }
         
      $scope.queryTitolo = function(searchTextTit)
      {
         searchTextTit = searchTextTit.toUpperCase();
         return($scope.ListaTitoli.grep(function(Elemento) 
         { 
           return(Elemento.Nome.toUpperCase().indexOf(searchTextTit) != -1 || Elemento.Codice.indexOf(searchTextTit) != -1);
         }));
      }
      
      $scope.selectedItemChangeTitolo = function(itemTit)
      {
        if(itemTit != undefined)
        {
           $scope.Titolo.TITOLO            = itemTit.Chiave;
           $scope.Titolo.NOME_TITOLO       = itemTit.Nome;
           $scope.Titolo.QUANTITA_MGZN     = itemTit.Quantita;
           $scope.Titolo.QUANTITA_MGZN_VOL = itemTit.QuantitaVol;
           $scope.Titolo.QUANTITA_DISP     = itemTit.QuantitaDisp;
        }
      }

      $scope.hide = function() 
      {
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';
        $mdDialog.hide();
      };

      $scope.AnnullaPopupTitolo = function() 
      {
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';
        $mdDialog.cancel();
      };

      $scope.ConfermaPopupTitolo = function()
      { 
        if($scope.Titolo.TITOLO == -1 || $scope.Titolo.QUANTITA == 0 || $scope.Titolo.STATO == null)
        {
          alert ('Dati titolo mancanti!');
          return
        }
        else
        {                         
          $scope.ListaTitoliSpedizione.push($scope.Titolo);
          $scope.TitoloPopup = undefined;
          $scope.searchTextTit = '';
          $mdDialog.hide();
        }             
      }
    }
    
    $scope.EliminaTitolo = function(Titolo)
    {
      if(confirm('Eliminare il titolo ' + Titolo.NOME_TITOLO + ' dalla spedizione?'))
      {
        TitoloCorrispondente = $scope.ListaTitoliSpedizione.findIndex(function(ATitolo){return(ATitolo.CHIAVE == Titolo.CHIAVE);});     
        if ($scope.ListaTitoliSpedizione[TitoloCorrispondente].Nuovo)
            $scope.ListaTitoliSpedizione.splice(TitoloCorrispondente,1)
        else
        {
          $scope.ListaTitoliEliminati.push($scope.ListaTitoliSpedizione[TitoloCorrispondente]);
          $scope.ListaTitoliEliminati[$scope.ListaTitoliEliminati.length-1].Eliminato = true;
          $scope.ListaTitoliSpedizione.splice(TitoloCorrispondente,1);
        }       
      }      
    }
    
    $scope.ModificaTitolo = function (Titolo)
    {
      $mdDialog.show({ 
                       controller          : DialogControllerTitoloSpedizioneMod,
                       templateUrl         : "template/bookDeliveryPopup.html",
                       targetEvent         : Titolo,
                       scope               : $scope,
                       preserveScope       : true,
                       clickOutsideToClose : true,
                       locals              : {Titolo}
                     })
      .then(function(answer) 
      {}, 
      function() 
      {});
    }
    
    function DialogControllerTitoloSpedizioneMod($scope,$mdDialog,Titolo)  
    { 
      $scope.Multipla = false;
      
      $scope.Titolo = {
                         "CHIAVE"        : Titolo.CHIAVE,
                         "TITOLO"        : Titolo.TITOLO,
                         "NOME_TITOLO"   : Titolo.NOME_TITOLO,
                         "QUANTITA"      : parseInt(Titolo.QUANTITA),
                         "QUANTITA_MGZN" : Titolo.QUANTITA_MGZN,
                         "QUANTITA_DISP" : Titolo.QUANTITA_DISP,
                         "STATO"         : Titolo.STATO,
                         "Nuovo"         : Titolo.Nuovo,
                         "Modificato"    : Titolo.Modificato,
                         "Eliminato"     : Titolo.Eliminato                                   
                      }      

      $scope.queryTitolo = function(searchTextTit)
      {
         searchTextTit = searchTextTit.toUpperCase();
         return($scope.ListaTitoli.grep(function(Elemento) 
         { 
           return(Elemento.Nome.toUpperCase().indexOf(searchTextTit) != -1 || Elemento.Codice.indexOf(searchTextTit) != -1);
         }));
      }
            
      $scope.selectedItemChangeTitolo = function(itemTit)
      {
        if(itemTit != undefined)
        {
          $scope.Titolo.TITOLO        = itemTit.Chiave;
          $scope.Titolo.NOME_TITOLO   = itemTit.Nome;
          $scope.Titolo.QUANTITA_MGZN = itemTit.Quantita;
        }
      }
      
      $scope.hide = function() 
      {
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';
        $mdDialog.hide();
      };

      $scope.AnnullaPopupTitolo = function() 
      {
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';
        $mdDialog.cancel();
      };
      
      $scope.ConfermaPopupTitolo = function()
      { 
        TitoloCorrispondente = $scope.ListaTitoliSpedizione.findIndex(function(ATitolo){return (ATitolo.CHIAVE == Titolo.CHIAVE);});
        if($scope.Titolo.TITOLO == -1 || $scope.Titolo.QUANTITA == 0 || $scope.Titolo.STATO == null)
        {
          alert ('Dati titolo mancanti!');
          return
        }
        else
        {        
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].TITOLO        = $scope.Titolo.TITOLO;
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].NOME_TITOLO   = $scope.Titolo.NOME_TITOLO;
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].QUANTITA      = $scope.Titolo.QUANTITA;
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].STATO         = $scope.Titolo.STATO;
          $scope.ListaTitoliSpedizione[TitoloCorrispondente].QUANTITA_MGZN = $scope.Titolo.QUANTITA_MGZN;
          if($scope.ListaTitoliSpedizione[TitoloCorrispondente].Nuovo)
             $scope.ListaTitoliSpedizione[TitoloCorrispondente].Modificato = false
          else
             $scope.ListaTitoliSpedizione[TitoloCorrispondente].Modificato = true;
        }
        $scope.TitoloPopup = undefined;
        $scope.searchTextTit = '';        
        $mdDialog.hide();           
      }
    }
    
    $scope.OnAnnullaSpedizione = function()
    { 
      $scope.SpedizioneInEditing  = {};
      $scope.DocenteDati          = {};
      $scope.ListaIstitutiDoc     = [];
      $scope.ListaTitoliEliminati = [];      
      switch (SystemInformation.DataBetweenController.Provenienza)
      {
         case 'TeacherPage'  : $state.go("teacherListPage");
                               SystemInformation.DataBetweenController = {};
                               break;
         case 'DeliveryPage' : $state.go("deliveryListPage");
                               SystemInformation.DataBetweenController = {};
                               break;
         case 'StartPage'    : $state.go("startPage");
                               SystemInformation.DataBetweenController = {};
                               break;
      }  
    }

    $scope.ConfermaSpedizione = function()
    {
      if($scope.ListaTitoliSpedizione.length == 0)
      {
         alert('NESSUN TITOLO INSERITO PER LA SPEDIZIONE!')
         return
      }
      else
      {
         if ($scope.SpedizioneMultipla && !($scope.SpedizioneAIstituto))
         {
             if($scope.ListaDocentiSpedizione.length > 0)
             {
                for (let d = 0; d < $scope.ListaDocentiSpedizione.length;d ++)
                {
                     $ObjQuery = {Operazioni : []};
                     ParamSpedizione = {
                                         "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                         "DOCENTE"        : $scope.ListaDocentiSpedizione[d].ChiaveDocente,
                                         "PRESSO"         : $scope.ListaDocentiSpedizione[d].NomeDocente,
                                         "INDIRIZZO"      : $scope.ListaDocentiSpedizione[d].IndirizzoDocente,
                                         "COMUNE"         : $scope.ListaDocentiSpedizione[d].ComuneDocente,
                                         "CAP"            : $scope.ListaDocentiSpedizione[d].CapDocente,
                                         "PROVINCIA"      : $scope.ListaDocentiSpedizione[d].ProvinciaDocente,
                                         "DATA"           : $scope.SpedizioneInEditing.DATA,
                                         "ISTITUTO"       : null
                                       }
                     $ObjQuery.Operazioni.push({
                                                 Query     : 'InsertDelivery',
                                                 Parametri : ParamSpedizione   
                                               });
                     for(let t = 0; t < $scope.ListaTitoliSpedizione.length;t ++)
                     {
                         var ParamTitolo = {
                                             "TITOLO"     : $scope.ListaTitoliSpedizione[t].TITOLO,  
                                             "QUANTITA"   : $scope.ListaTitoliSpedizione[t].QUANTITA,
                                             "STATO"      : $scope.ListaTitoliSpedizione[t].STATO
                                           }
                         if($scope.ListaTitoliSpedizione[t].Nuovo)
                         {
                            $ObjQuery.Operazioni.push({
                                                        Query     : 'InsertDeliveryBookAfterInsert',
                                                        Parametri : ParamTitolo,
                                                        ResetKeys : [2]
                                                      });
                         }             
                     }
                     SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                     {
                       $ObjQuery.Operazioni          = [];
                       $scope.SpedizioneInEditing    = {};
                       $scope.ListaDocentiSpedizione = [];
                       $scope.ListaDocentiEsclusi    = [];
                       switch (SystemInformation.DataBetweenController.Provenienza)
                       {
                          case 'TeacherPage'  : $state.go("teacherListPage");
                                                SystemInformation.DataBetweenController = {};
                                                break;
                          case 'DeliveryPage' : $state.go("deliveryListPage");
                                                SystemInformation.DataBetweenController = {};
                                                break;
                          case 'StartPage'    : $state.go("startPage");
                                                SystemInformation.DataBetweenController = {};
                                                break;
                       }          
                     })          
                }
             } else alert('IMPOSSIBILE SPEDIRE, NESSUNO DEI DOCENTI HA UN INDIRIZZO DI SPEDIZIONE VALIDO')
         }
         else if ($scope.SpedizioneMultipla && $scope.SpedizioneAIstituto)
         {
                  for (let d = 0; d < $scope.ListaDocentiSpedizione.length;d ++)
                  {
                       $ObjQuery = {Operazioni : []};
                       ParamSpedizione = {
                                           "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                           "DOCENTE"        : $scope.ListaDocentiSpedizione[d].ChiaveDocente,
                                           "PRESSO"         : $scope.ListaDocentiSpedizione[d].NomeDocente,
                                           "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                           "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                           "CAP"            : $scope.SpedizioneInEditing.CAP,
                                           "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                           "DATA"           : $scope.SpedizioneInEditing.DATA,
                                           "ISTITUTO"       : $scope.SpedizioneInEditing.ISTITUTO
                                         }
                       $ObjQuery.Operazioni.push({
                                                   Query     : 'InsertDelivery',
                                                   Parametri : ParamSpedizione   
                                                 });
                       for(let t = 0; t < $scope.ListaTitoliSpedizione.length;t ++)
                       {
                           var ParamTitolo = {
                                               "TITOLO"     : $scope.ListaTitoliSpedizione[t].TITOLO,  
                                               "QUANTITA"   : $scope.ListaTitoliSpedizione[t].QUANTITA,
                                               "STATO"      : $scope.ListaTitoliSpedizione[t].STATO
                                             }
                           if($scope.ListaTitoliSpedizione[t].Nuovo)
                           {
                              $ObjQuery.Operazioni.push({
                                                          Query     : 'InsertDeliveryBookAfterInsert',
                                                          Parametri : ParamTitolo,
                                                          ResetKeys : [2]
                                                        });
                           }             
                       }
                       SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                       {
                         $ObjQuery.Operazioni = [];                      
                       });          
                  }
                  
                  for (let d = 0; d < $scope.ListaDocentiEsclusi.length;d ++)
                  {
                       $ObjQuery = {Operazioni : []};
                       ParamSpedizione = {
                                           "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                           "DOCENTE"        : $scope.ListaDocentiEsclusi[d].ChiaveDocente,
                                           "PRESSO"         : $scope.ListaDocentiEsclusi[d].NomeDocente,
                                           "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                           "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                           "CAP"            : $scope.SpedizioneInEditing.CAP,
                                           "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                           "DATA"           : $scope.SpedizioneInEditing.DATA,
                                           "ISTITUTO"       : $scope.SpedizioneInEditing.ISTITUTO                                          
                                         }
                       $ObjQuery.Operazioni.push({
                                                   Query     : 'InsertDelivery',
                                                   Parametri : ParamSpedizione   
                                                 });
                       for(let t = 0; t < $scope.ListaTitoliSpedizione.length;t ++)
                       {
                           var ParamTitolo = {
                                               "TITOLO"     : $scope.ListaTitoliSpedizione[t].TITOLO,  
                                               "QUANTITA"   : $scope.ListaTitoliSpedizione[t].QUANTITA,
                                               "STATO"      : $scope.ListaTitoliSpedizione[t].STATO
                                             }
                           if($scope.ListaTitoliSpedizione[t].Nuovo)
                           {
                              $ObjQuery.Operazioni.push({
                                                          Query     : 'InsertDeliveryBookAfterInsert',
                                                          Parametri : ParamTitolo,
                                                          ResetKeys : [2]
                                                        });
                           }             
                       }
                       SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                       {
                         $ObjQuery.Operazioni = [];                      
                       });          
                  }               
                  $scope.SpedizioneInEditing    = {};
                  $scope.ListaDocentiSpedizione = [];
                  $scope.ListaDocentiEsclusi    = [];
                  $scope.ListaDocentiSpedizioneAIstituto = [];

                  switch (SystemInformation.DataBetweenController.Provenienza)
                  {
                     case 'TeacherPage'  : $state.go("teacherListPage");
                                           SystemInformation.DataBetweenController = {};
                                           break;
                     case 'DeliveryPage' : $state.go("deliveryListPage");
                                           SystemInformation.DataBetweenController = {};
                                           break;
                     case 'StartPage'    : $state.go("startPage");
                                           SystemInformation.DataBetweenController = {};
                                           break;
                  }                         
         }
         else
         {         
             if ($scope.SpedizioneInEditing.INDIRIZZO == '' || $scope.SpedizioneInEditing.COMUNE == '' || $scope.SpedizioneInEditing.CAP == '' || $scope.SpedizioneInEditing.PROVINCIA == -1)
             {    
                 alert ('DATI SPEDIZIONE MANCANTI!');
                 return         
             }
             else
             {
               $ObjQuery = {Operazioni : []};
               ParamSpedizione  = {
                                    "CHIAVE"         : $scope.SpedizioneInEditing.CHIAVE,
                                    "DOCENTE"        : $scope.SpedizioneInEditing.DOCENTE == undefined ? null : $scope.SpedizioneInEditing.DOCENTE,
                                    "PRESSO"         : $scope.SpedizioneInEditing.PRESSO,
                                    "INDIRIZZO"      : $scope.SpedizioneInEditing.INDIRIZZO,
                                    "COMUNE"         : $scope.SpedizioneInEditing.COMUNE,
                                    "CAP"            : $scope.SpedizioneInEditing.CAP,
                                    "PROVINCIA"      : $scope.SpedizioneInEditing.PROVINCIA,
                                    "DATA"           : $scope.SpedizioneInEditing.DATA,
                                    "ISTITUTO"       : ($scope.SpedizioneInEditing.ISTITUTO == -1 || $scope.SpedizioneInEditing.ISTITUTO == '') ? null : $scope.SpedizioneInEditing.ISTITUTO  
                                  }
                                     
               var NuovaSpedizione = ($scope.SpedizioneInEditing.CHIAVE == -1);
               if (NuovaSpedizione)
               {
                 $ObjQuery.Operazioni.push({
                                             Query     : 'InsertDelivery',
                                             Parametri : ParamSpedizione   
                                           })
               }
               else
               {
                 $ObjQuery.Operazioni.push({
                                             Query     : 'UpdateDelivery',
                                             Parametri : ParamSpedizione   
                                           })         
               }
               
               if (!NuovaSpedizione && $scope.ListaTitoliEliminati.length != 0)
               {
                  for(let j = 0; j < $scope.ListaTitoliEliminati.length ;j ++)
                  {
                    var ParamTitolo = {
                                        CHIAVE : $scope.ListaTitoliEliminati[j].CHIAVE
                                      }
                    if ($scope.ListaTitoliEliminati[j].Eliminato)
                    {
                     $ObjQuery.Operazioni.push({
                                                 Query     : 'DeleteDeliveryBook',
                                                 Parametri : ParamTitolo
                                               });
                    }
                  }
                  SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
                  {
                    $scope.ListaTitoliEliminati = [];
                    $ObjQuery.Operazioni = [];
                  });  
               }           
               
               for(let i = 0; i < $scope.ListaTitoliSpedizione.length;i ++)
               {
                   var ParamTitolo = {
                                       "TITOLO"     : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                       "QUANTITA"   : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                       "STATO"      : $scope.ListaTitoliSpedizione[i].STATO
                                     }
                   if(NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Nuovo)
                   {
                      $ObjQuery.Operazioni.push({
                                                  Query     : 'InsertDeliveryBookAfterInsert',
                                                  Parametri : ParamTitolo,
                                                  ResetKeys : [2]
                                                });
                   }
                   if(!NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Nuovo)
                   {
                      var ParamTitolo  = {
                                           "SPEDIZIONE" : $scope.SpedizioneInEditing.CHIAVE,
                                           "TITOLO"     : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                           "QUANTITA"   : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                           "STATO"      : $scope.ListaTitoliSpedizione[i].STATO
                                         }
                      $ObjQuery.Operazioni.push({
                                                  Query     : 'InsertDeliveryBook',
                                                  Parametri : ParamTitolo,
                                                  ResetKeys : [1]
                                                });
                   }
                   if(!NuovaSpedizione && $scope.ListaTitoliSpedizione[i].Modificato)
                   {
                     var ParamTitolo  = {
                                          "CHIAVE"   : $scope.ListaTitoliSpedizione[i].CHIAVE,
                                          "TITOLO"   : $scope.ListaTitoliSpedizione[i].TITOLO,  
                                          "QUANTITA" : $scope.ListaTitoliSpedizione[i].QUANTITA,
                                          "STATO"    : $scope.ListaTitoliSpedizione[i].STATO
                                        }
                     $ObjQuery.Operazioni.push({
                                                 Query     : 'UpdateDeliveryBook',
                                                 Parametri : ParamTitolo
                                               });             
                   }             
               }
               
               SystemInformation.PostSQL('Delivery',$ObjQuery,function(Answer)
               {
                 $ObjQuery.Operazioni       = [];
                 $scope.SpedizioneInEditing = {};
                 switch (SystemInformation.DataBetweenController.Provenienza)
                 {
                    case 'TeacherPage'  : $state.go("teacherListPage");
                                          SystemInformation.DataBetweenController = {};
                                          break;
                    case 'DeliveryPage' : $state.go("deliveryListPage");
                                          SystemInformation.DataBetweenController = {};
                                          break;
                    case 'StartPage'    : $state.go("startPage");
                                          SystemInformation.DataBetweenController = {};
                                          break;
                 }          
               });
             }
         }
      }      
    }    
  }
  
}]);
