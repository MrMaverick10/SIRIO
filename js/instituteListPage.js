SIRIOApp.controller("instituteListPageController",['$scope','SystemInformation','$state','$rootScope', function($scope,SystemInformation,$state,$rootScope)
{
  $scope.EditingOn          = false;
  $scope.IstitutoInEditing  = {};
  $scope.ListaIstituti      = [];  
  $scope.ListaProvince      = [];
  $scope.ListaPromotori     = [];    
  
  $scope.SezioneMax         = -1;
  $scope.ListaSezioni       = ['A','B','C','D','E','F','G','H','I','L','M','N','O','P','Q','R','S','T','U','V','Z'];    
  $scope.Anno               = [1,2,3,4,5];
  $scope.ListaSezioniFinale = [];
  $scope.ArrayClassiFinale  = [];
  $scope.ClasseCliccata     = [];
  
  $scope.ProvinciaFiltro    = -1;
  $scope.NomeFiltro         = '';  
  
  ScopeHeaderController.CheckButtons();
  
  $scope.CreaListaSelezione = function(sezMax)
  { 
    $scope.ListaSezioniFinale = [];
    for(i = 0; i <= sezMax; i ++)
        $scope.ListaSezioniFinale.push($scope.ListaSezioni[i]);
  }
  
  ResetClassi = function ()
  {
    for(let i = 0;i < $scope.Anno.length;i ++)
    {
      for(let j = 0;j < $scope.ListaSezioni.length;j ++)
      {
        $scope.ClasseCliccata[$scope.ListaSezioni[j] + $scope.Anno[i]] = false;
      }
    }
  }
  
  CaricaClassi = function ()
  {
    for (let k = 0; k < $scope.ArrayClassiFinale.length ; k ++)
         $scope.ClasseCliccata[$scope.ArrayClassiFinale[k].Sezione + $scope.ArrayClassiFinale[k].Anno] = true;
  }
  
  $scope.ModificaListaClassi = function(sezione,anno)
  {
    var DatoTrovato = false;
    
    if($scope.ClasseCliccata[sezione + anno])                                                                       
    {    
      for(let i = 0; i < $scope.ArrayClassiFinale.length; i ++)
      {      
        if (($scope.ArrayClassiFinale[i].Sezione == sezione) && ($scope.ArrayClassiFinale[i].Anno == anno)) 
        {  
          $scope.ArrayClassiFinale[i].Eliminato = false;
          $scope.ArrayClassiFinale[i].Nuovo     = false;
          DatoTrovato                           = true;  
        }
      }        
      if (!DatoTrovato) 
      {
        $scope.ClasseAggiunta = { 
                                  Chiave    : -1,
                                  Eliminato : false,
                                  Nuovo     : true,
                                  Sezione   : sezione,
                                  Anno      : anno     
                                };
        $scope.ArrayClassiFinale.push($scope.ClasseAggiunta); 
        $scope.ClasseAggiunta = {};
      }
    }                      
    else
    {    
        for(let i = 0; i < $scope.ArrayClassiFinale.length; i ++)
        {
          if (($scope.ArrayClassiFinale[i].Sezione == sezione) && ($scope.ArrayClassiFinale[i].Anno == anno))
          {
                SystemInformation.GetSQL('Institute',
                                         {
                                           Istituto : $scope.IstitutoInEditing.Chiave,
                                           Sezione  : $scope.ArrayClassiFinale[i].Sezione,
                                           Anno     : $scope.ArrayClassiFinale[i].Anno
                                         },
                                         function(Results)
                                         {
                                           ContoAdozioni = SystemInformation.FindResults(Results,'GetAdoptionClass');
                                           if(ContoAdozioni != undefined)
                                           {
                                              ContoAdozioni = ContoAdozioni[0].COUNT_ADOZIONI;
                                              var VaiAvanti = true;
                                              if(ContoAdozioni != 0)
                                                 VaiAvanti = confirm('Sono presenti adozioni associate. Eliminare?');
                                              if(VaiAvanti)
                                              {
                                                 if ($scope.ArrayClassiFinale[i].Nuovo)                                                          
                                                     $scope.ArrayClassiFinale.splice(i,1)
                                                 else                                                                                             
                                                 {
                                                     $scope.ArrayClassiFinale[i].Nuovo = false;
                                                     $scope.ArrayClassiFinale[i].Eliminato = true;
                                                 }
                                              }
                                              else $scope.ClasseCliccata[$scope.ArrayClassiFinale[i].Sezione + $scope.ArrayClassiFinale[i].Anno] = true;
                                           }
                                           else SystemInformation.ApplyOnError('Modello adozioni per classe non conforme','');                  
                                         },'GetAdozioniClasse');               
          }  
        }
    }            
  }
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaProvinceOpt = SystemInformation.FindResults(Results,'ProvinceList');
    if (ListaProvinceOpt != undefined) 
    {
      var ListaProvinceTmp = []
      var AddProvincia = function (Chiave,Nome)
      {
        ListaProvinceTmp.push({
                                Chiave : Chiave,
                                Nome   : Nome
                              });
      }
      ListaProvinceOpt.forEach(function(provincia)
      {
        AddProvincia(provincia.CHIAVE,provincia.NOME)
      });
      $scope.ListaProvince = ListaProvinceTmp;
    }
    else SystemInformation.ApplyOnError('Modello province non conforme','');     
  });
  
  SystemInformation.GetSQL('Accessories',{}, function(Results)
  {
    ListaTipologieOpt = SystemInformation.FindResults(Results,'InstituteTypeList');
    if (ListaTipologieOpt != undefined) 
    {
      var ListaTipologieTmp = []
      var AddTipologia = function (Chiave,Descrizione)
      {
        ListaTipologieTmp.push({
                                Chiave      : Chiave,
                                Descrizione : Descrizione
                              });
      }
      ListaTipologieOpt.forEach(function(tipologia)
      {
        AddTipologia(tipologia.CHIAVE,tipologia.DESCRIZIONE)
      });
      $scope.ListaTipologie = ListaTipologieTmp;
    }
    else SystemInformation.ApplyOnError('Modello tipologie non conforme','');     
  });
  
  SystemInformation.GetSQL('User',{}, function(Results)
  {
    ListaPromotoriOpt = SystemInformation.FindResults(Results,'UserInfoList');
    if (ListaPromotoriOpt != undefined) 
    {
      var ListaPromotoriTmp = []
      var AddPromotore = function (Chiave,RagioneSociale)
      {
        ListaPromotoriTmp.push({
                                Chiave         : Chiave,
                                RagioneSociale : RagioneSociale
                              });
      }
      ListaPromotoriOpt.forEach(function(promotore)
      {
        AddPromotore(promotore.CHIAVE,promotore.RAGIONE_SOCIALE)
      });
      $scope.ListaPromotori = ListaPromotoriTmp;
    }
    else SystemInformation.ApplyOnError('Modello promotori non conforme','');     
  });
    
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
  
  $scope.RefreshListaIstituti = function()
  {
    SystemInformation.GetSQL('Institute', {}, function(Results)  
    {
      IstitutiInfoLista = SystemInformation.FindResults(Results,'InstituteInfoList');
      if(IstitutiInfoLista != undefined)
      { 
         var ListaIstitutiTmp = [];   
         var AddIstituto = function (Chiave,Codice,Nome,Promotore,Provincia,ProvinciaNome)
         {
           ListaIstitutiTmp.push({ 
                                   Chiave        : Chiave,
                                   Codice        : Codice,   
                                   Nome          : Nome,  
                                   Promotore     : Promotore,
                                   Provincia     : Provincia, 
                                   ProvinciaNome : ProvinciaNome                                    
                                 });
         }
         IstitutiInfoLista.forEach(function(Istituto)
         {
           AddIstituto(Istituto.CHIAVE,Istituto.CODICE,Istituto.NOME,Istituto.PROMOTORE,Istituto.PROVINCIA,Istituto.NOME_PROVINCIA)
         });
         $scope.ListaIstituti = ListaIstitutiTmp;
      }
      else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
    });
  }
  
  GetCodeSezione = function(Sezione)
  {
     switch(Sezione)
     {
       case 'A' : return(0);
                  break;
       case 'B' : return(1);
                  break;
       case 'C' : return(2);
                  break;
       case 'D' : return(3);
                  break;
       case 'E' : return(4);
                  break;           
       case 'F' : return(5);
                  break;
       case 'G' : return(6);
                  break;
       case 'H' : return(7);
                  break;
       case 'I' : return(8);
                  break;
       case 'L' : return(9);
                  break;
       case 'M' : return(10);
                  break;
       case 'N':  return(11);
                  break; 
       case 'O' : return(12);
                  break;
       case 'P' : return(13);
                  break;
       case 'Q' : return(14);
                  break;
       case 'R' : return(15);
                  break;
       case 'S' : return(16);
                  break;
       case 'T' : return(17);
                  break;
       case 'U' : return(18);
                  break;
       case 'V' : return(19);
                  break;         
       case 'Z' : return(20);
       case 'Z' : return(20);
                  break;
       default  : return(-1);
                  break;
     }        
  }
  
  $scope.ModificaIstituto = function(istituto)
  {
    $scope.EditingOn = true;    
    SystemInformation.GetSQL('Institute', {CHIAVE : istituto.Chiave}, function(Results)
    {
      IstitutoDettaglio = SystemInformation.FindResults(Results, 'InstituteDettaglio');
      IstitutoDettaglioClassi = SystemInformation.FindResults(Results,'ClassiInstitute');
      if(IstitutoDettaglio != undefined && IstitutoDettaglioClassi != undefined)
      {
        // Carica dati istituto 
        $scope.IstitutoInEditing.Chiave             = IstitutoDettaglio[0].CHIAVE;
        $scope.IstitutoInEditing.Codice             = IstitutoDettaglio[0].CODICE      == undefined ? '' : IstitutoDettaglio[0].CODICE;
        $scope.IstitutoInEditing.Nome               = IstitutoDettaglio[0].NOME        == undefined ? '' : IstitutoDettaglio[0].NOME;
        $scope.IstitutoInEditing.Tipologia          = IstitutoDettaglio[0].TIPOLOGIA   == undefined ? -1 : IstitutoDettaglio[0].TIPOLOGIA;
        $scope.IstitutoInEditing.Indirizzo          = IstitutoDettaglio[0].CODICE      == undefined ? '' : IstitutoDettaglio[0].INDIRIZZO;
        $scope.IstitutoInEditing.Comune             = IstitutoDettaglio[0].COMUNE      == undefined ? '' : IstitutoDettaglio[0].COMUNE;
        $scope.IstitutoInEditing.Provincia          = IstitutoDettaglio[0].PROVINCIA   == undefined ? -1 : IstitutoDettaglio[0].PROVINCIA;
        $scope.IstitutoInEditing.Cap                = IstitutoDettaglio[0].CAP         == undefined ? '' : IstitutoDettaglio[0].CAP;
        $scope.IstitutoInEditing.Email              = IstitutoDettaglio[0].EMAIL       == undefined ? '' : IstitutoDettaglio[0].EMAIL;
        $scope.IstitutoInEditing.Pec                = IstitutoDettaglio[0].PEC         == undefined ? '' : IstitutoDettaglio[0].PEC;
        $scope.IstitutoInEditing.SitoWeb            = IstitutoDettaglio[0].SITO_WEB    == undefined ? '' : IstitutoDettaglio[0].SITO_WEB;
        $scope.IstitutoInEditing.SedeSuccursale     = IstitutoDettaglio[0].SEDE        == undefined ? 1  : IstitutoDettaglio[0].SEDE;
        $scope.IstitutoInEditing.Referente_1        = IstitutoDettaglio[0].REFERENTE_1 == undefined ? '' : IstitutoDettaglio[0].REFERENTE_1;
        $scope.IstitutoInEditing.NumeroTelefono_1   = IstitutoDettaglio[0].TELEFONO_1  == undefined ? '' : IstitutoDettaglio[0].TELEFONO_1;
        $scope.IstitutoInEditing.Referente_2        = IstitutoDettaglio[0].REFERENTE_2 == undefined ? '' : IstitutoDettaglio[0].REFERENTE_2;
        $scope.IstitutoInEditing.NumeroTelefono_2   = IstitutoDettaglio[0].TELEFONO_2  == undefined ? '' : IstitutoDettaglio[0].TELEFONO_2;
        $scope.IstitutoInEditing.Referente_3        = IstitutoDettaglio[0].REFERENTE_3 == undefined ? '' : IstitutoDettaglio[0].REFERENTE_3;
        $scope.IstitutoInEditing.NumeroTelefono_3   = IstitutoDettaglio[0].TELEFONO_3  == undefined ? '' : IstitutoDettaglio[0].TELEFONO_3;
        $scope.IstitutoInEditing.PromotoreAssegnato = IstitutoDettaglio[0].PROMOTORE   == undefined ? -1 : IstitutoDettaglio[0].PROMOTORE;
        
        // Carica dati classi
        ResetClassi();
        if(IstitutoDettaglioClassi.length > 0)
        {         
          $scope.SezioneMax = GetCodeSezione(IstitutoDettaglioClassi[IstitutoDettaglioClassi.length-1].SEZIONE);
          $scope.CreaListaSelezione($scope.SezioneMax);
          $scope.ArrayClassiFinale = [];
          for(let i = 0;i < IstitutoDettaglioClassi.length;i ++)
          {
            $scope.ArrayClassiFinale.push({
                                            Eliminato : false,
                                            Nuovo     : false,
                                            Sezione   : IstitutoDettaglioClassi[i].SEZIONE,
                                            Anno      : IstitutoDettaglioClassi[i].ANNO     
                                          })
            CaricaClassi();
          }
        }
        else 
        {
          $scope.SezioneMax = 10;
          $scope.CreaListaSelezione($scope.SezioneMax);
          $scope.ArrayClassiFinale = []       
        }
      }       
      else SystemInformation.ApplyOnError('Modello istituto non conforme',''); 
    },'SQLDettaglio'); 
  }
    
  
  $scope.NuovoIstituto = function()
  { 
    $scope.EditingOn = true; 
    ResetClassi();
    $scope.IstitutoInEditing = {
                                 Chiave             : -1,
                                 Codice             : '',
                                 Nome               : '',
                                 Tipologia          : -1,
                                 Indirizzo          : '',
                                 Comune             : '',
                                 Provincia          : -1,
                                 Cap                : '',
                                 Email              : '',
                                 Pec                : '',
                                 SitoWeb            : '',
                                 SedeSuccursale     : 1,
                                 Referente_1        : '',
                                 NumeroTelefono_1   : '',
                                 Referente_2        : '',
                                 NumeroTelefono_2   : '',
                                 Referente_3        : '',
                                 NumeroTelefono_3   : '',
                                 PromotoreAssegnato : -1                         
                               };
    $scope.SezioneMax        = 10;   
    $scope.ArrayClassiFinale = [];
    $scope.CreaListaSelezione($scope.SezioneMax);
  }
  
  $scope.OnAnnullaIstitutoClicked = function()
  {
    $scope.EditingOn = false;
    $scope.RefreshListaIstituti();
  }
  
  $scope.ConfermaIstituto = function() 
  {       
     var $ObjQuery     = { Operazioni : [] };          
     var ParamIstituto = {
                           CHIAVE      : $scope.IstitutoInEditing.Chiave,
                           CODICE      : $scope.IstitutoInEditing.Codice,
                           NOME        : $scope.IstitutoInEditing.Nome.xSQL(),
                           INDIRIZZO   : $scope.IstitutoInEditing.Indirizzo.xSQL(),
                           TIPOLOGIA   : $scope.IstitutoInEditing.Tipologia == -1 ? null : $scope.IstitutoInEditing.Tipologia,
                           COMUNE      : $scope.IstitutoInEditing.Comune.xSQL(),
                           PROVINCIA   : $scope.IstitutoInEditing.Provincia == -1 ? null : $scope.IstitutoInEditing.Provincia,
                           CAP         : $scope.IstitutoInEditing.Cap.xSQL(),
                           EMAIL       : $scope.IstitutoInEditing.Email.xSQL(),
                           PEC         : $scope.IstitutoInEditing.Pec.xSQL(),
                           SITO_WEB    : $scope.IstitutoInEditing.SitoWeb.xSQL(),
                           SEDE        : $scope.IstitutoInEditing.SedeSuccursale,
                           REFERENTE_1 : $scope.IstitutoInEditing.Referente_1.xSQL(),
                           TELEFONO_1  : $scope.IstitutoInEditing.NumeroTelefono_1.xSQL(),
                           REFERENTE_2 : $scope.IstitutoInEditing.Referente_2.xSQL(),
                           TELEFONO_2  : $scope.IstitutoInEditing.NumeroTelefono_2.xSQL(),
                           REFERENTE_3 : $scope.IstitutoInEditing.Referente_3.xSQL(),
                           TELEFONO_3  : $scope.IstitutoInEditing.NumeroTelefono_3.xSQL(),
                           PROMOTORE   : $scope.IstitutoInEditing.PromotoreAssegnato == -1 ? null : $scope.IstitutoInEditing.PromotoreAssegnato,
                         };
                                                                  
     var NuovoIstituto = ($scope.IstitutoInEditing.Chiave == -1);
     if(NuovoIstituto)     
     {           
       $ObjQuery.Operazioni.push({
                                   Query     : 'InsertInstitute',
                                   Parametri : ParamIstituto
                                 });
     }
     else
     {
       $ObjQuery.Operazioni.push({
                                   Query     : 'UpdateInstitute',
                                   Parametri : ParamIstituto
                                 });
     };
     
     for(let i = 0; i < $scope.ArrayClassiFinale.length ;i ++)
     {  
       var NuovaClasse         = ($scope.ArrayClassiFinale[i].Chiave == -1);
       var ParamClassiIstituto = {
                                   CHIAVE   : $scope.ArrayClassiFinale[i].Chiave,
                                   ANNO     : $scope.ArrayClassiFinale[i].Anno,
                                   SEZIONE  : $scope.ArrayClassiFinale[i].Sezione,
                                   ISTITUTO : $scope.IstitutoInEditing.Chiave
                                 }
       if(NuovoIstituto && NuovaClasse && !($scope.ArrayClassiFinale[i].Eliminato))  
       { 
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertClassAfterInsert',
                                     Parametri : ParamClassiIstituto,
                                     ResetKeys : [2]
                                   });
       }
       if(!NuovoIstituto && NuovaClasse && $scope.ArrayClassiFinale[i].Nuovo && !($scope.ArrayClassiFinale[i].Eliminato))
       {  
         $ObjQuery.Operazioni.push({
                                     Query     : 'InsertClass',
                                     Parametri : ParamClassiIstituto,
                                     ResetKeys : [1]
                                   });
       }
       if (!NuovoIstituto && $scope.ArrayClassiFinale[i].Eliminato)
       {
         $ObjQuery.Operazioni.push({
                                     Query     : 'DeleteAdoption',
                                     Parametri : ParamClassiIstituto
                                   });
         $ObjQuery.Operazioni.push({
                                     Query     : 'DeleteClass',
                                     Parametri : ParamClassiIstituto
                                   });
       }         
     }
  
     SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
     {  
       $scope.EditingOn = false;
       $scope.RefreshListaIstituti();
     });  
  }
  
  $scope.EliminaIstituto = function(Istituto)
  {
    if(confirm('Eliminare l\'istituto: ' + Istituto.Nome + ' ?'))
    {
      var $ObjQuery           = { Operazioni : [] };
      var ParamIstituto       = { CHIAVE     : Istituto.Chiave };
      var ParamClassiIstituto = { ISTITUTO   : Istituto.Chiave}
       
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteClass',
                                  Parametri : ParamClassiIstituto
                                });
      
      $ObjQuery.Operazioni.push({
                                  Query     : 'DeleteInstitute',
                                  Parametri : ParamIstituto
                                });
                                
    
                                
      SystemInformation.PostSQL('Institute',$ObjQuery,function(Answer)
      {
        $scope.RefreshListaIstituti();
      });  
    }
  } 
  
  $scope.RefreshListaIstituti();
 
}]);


SIRIOApp.filter('IstitutoByFiltro',function()
{
  return function(ListaIstituti,ProvinciaFiltro,NomeFiltro)
         {
           if(ProvinciaFiltro == -1 && NomeFiltro == '') return(ListaIstituti);
           var ListaFiltrata = [];
           NomeFiltro = NomeFiltro.toUpperCase();
           
          /* var IstitutoOk = function(Istituto)
           {
              var Result = true;
              if(ProvinciaFiltro != -1)
                 if(Oggetto.Provincia != ProvinciaFiltro)
                    Result = false;
              if(NomeFiltro != '')
                if(Istituto.Nome.toUpperCase().indexOf(NomeFiltro) < 0)
                  Result = false;
              return(Result);
           }
           
            ListaIstituti.forEach(function(Istituto)
             { 
               if(IstitutoOk(Istituto)) 
                  ListaFiltrata.push(Istituto)                       
             });*/
           
           if (ProvinciaFiltro != -1)
           {            
             ListaIstituti.forEach(function(Istituto)
             { 
               if(Istituto.Provincia == ProvinciaFiltro && Istituto.Nome.toUpperCase().indexOf(NomeFiltro) >= 0) 
                  ListaFiltrata.push(Istituto)                       
             })
           }
           else
           {             
             ListaIstituti.forEach(function(Istituto) 
             {
               if(Istituto.Nome.toUpperCase().indexOf(NomeFiltro) >= 0) 
                  ListaFiltrata.push(Istituto);
             });           
           }
            
           return(ListaFiltrata);
         }
});