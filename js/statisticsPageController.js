SIRIOApp.controller("statisticsPageController",['$scope','SystemInformation','$state','$mdDialog','ZConfirm', function($scope,SystemInformation,$state,$mdDialog,ZConfirm)
{ 
  $scope.NrAlunni               = 20;
  $scope.ListaStatistica        = [];
  $scope.ListaDate              = [];
  $scope.ListaPromotori         = []; 
  $scope.ListaIstituti          = [];
  $scope.ListaProvince          = [];
  $scope.ListaTitoli            = [];
  $scope.ListaGruppiIstituti    = [];
  $scope.ListaMaterie           = [];
  $scope.ListaGruppiEditoriali  = [];
  $scope.RegistraAdozVisible    = true;
  $scope.PromotoreFiltro        = -1;
  $scope.GruppoIstitutoFiltro   = -1;
  $scope.ProvinciaFiltro        = -1;
  $scope.TitoloFiltro           = -1;
  $scope.IstitutoFiltro         = -1;
  $scope.MateriaFiltro          = -1;
  $scope.GruppoEditorialeFiltro = -1;
  $scope.PrimaData              = -1;
  $scope.SecondaData            = null;
  $scope.RegistrazioneInCorso   = false;
  $scope.StatisticaPresente     = true;
  $scope.NuoveAdozioniFiltro    = false;
  $scope.VolumiUniciPrimiFiltro = false;
  $scope.CaricamentoInCorso     = false;

  $scope.DatiCumulativi = {
                            NrRigheTotali    : 0,
                            NrClassiTot_1    : 0,
                            NrClassiTot_2    : 0,
                            DifferenzaClassi : 0,
                            NrClassiGestite  : 0,
                            NrNuoveAdozioni  : 0
                          }

  ScopeHeaderController.CheckButtons();
  
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
                                             limit: 25,
                                             page: 1
                                           },
                         limitOptions    : [10, 25, 50, 100]
  };

  $scope.ConvertiData = function (Data)
  {
     return(ZFormatDateTime('dd/mm/yyyy',ZDateFromHTMLInput(Data)));
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
      $scope.TitoloFiltro = itemTit.Chiave;
    else $scope.TitoloFiltro = -1;
  }  
  
  $scope.queryIstituto = function(searchTextIstituto)
  {
     searchTextIstituto = searchTextIstituto.toUpperCase();
     return($scope.ListaIstituti.grep(function(Elemento) 
     { 
       return(Elemento.Nome.toUpperCase().indexOf(searchTextIstituto) != -1);
     }));
  }
  
  $scope.selectedItemChangeIstituto = function(itemIstituto)
  {
    if(itemIstituto != undefined)
      $scope.IstitutoFiltro = itemIstituto.Chiave
    else $scope.IstitutoFiltro = -1;
  }

  $scope.GetGruppiEditoriali = function()
  {
    SystemInformation.GetSQL('PublisherGroup', {}, function(Results)  
    {
      ListaGruppiEditorialiTmp = SystemInformation.FindResults(Results,'GroupInfoList');
      if(ListaGruppiEditorialiTmp != undefined)
      { 
         for(let i = 0;i < ListaGruppiEditorialiTmp.length;i ++)
             ListaGruppiEditorialiTmp[i] = {
                                             Chiave      : parseInt(ListaGruppiEditorialiTmp[i].CHIAVE),
                                             Descrizione : ListaGruppiEditorialiTmp[i].DESCRIZIONE
                                           }
         $scope.ListaGruppiEditoriali = ListaGruppiEditorialiTmp
         if($scope.ListaDate.length > 0)
         {
           $scope.SecondaData = $scope.ListaDate[0].DataStatistica;
           $scope.GeneraStatistica();
         }
         else $scope.StatisticaPresente = false;
      } 
      else SystemInformation.ApplyOnError('Modello gruppi editoriali non conforme','');   
    });
  }

  $scope.GetMaterie = function()
  {
    SystemInformation.GetSQL('Subject',{}, function(Results)
    {
      ListaMaterieTmp = SystemInformation.FindResults(Results,'SubjectInfoList');
      if (ListaMaterieTmp != undefined) 
      {
        for(let i = 0; i < ListaMaterieTmp.length; i++)
            ListaMaterieTmp[i] = {
                                   Chiave  : parseInt(ListaMaterieTmp[i].CHIAVE),
                                   Materia : ListaMaterieTmp[i].DESCRIZIONE
                                 }
        $scope.ListaMaterie = ListaMaterieTmp;
        $scope.GetGruppiEditoriali();
      }
      else SystemInformation.ApplyOnError('Modello materie non conforme','');     
    });
  }

  $scope.GetNrAlunni = function ()
  {
    SystemInformation.GetSQL('CompanyData',{}, function (Results)
    {
      DatiDitta = SystemInformation.FindResults(Results,'GetCompanyData');
      if (DatiDitta != undefined)
      {
        $scope.NrAlunni = parseInt(DatiDitta[0].NR_ALUNNI);
        $scope.GetMaterie();
      }
      else SystemInformation.ApplyOnError('Modello media numero alunni non conforme','');
    });
  }

  $scope.GetGruppiIstituti = function()
  {
    SystemInformation.GetSQL('InstituteType', {}, function(Results)  
    {
      ListaGruppiTmp = SystemInformation.FindResults(Results,'InstituteGroupInfo');
      if(ListaGruppiTmp != undefined)
      { 
         for(let i = 0;i < ListaGruppiTmp.length;i ++)
         ListaGruppiTmp[i] = {
                               Chiave      : parseInt(ListaGruppiTmp[i].CHIAVE),
                               Descrizione : ListaGruppiTmp[i].DESCRIZIONE
                             }
         $scope.ListaGruppiIstituti = ListaGruppiTmp;
         $scope.GetNrAlunni();
      }
      else SystemInformation.ApplyOnError('Modello gruppi istituti non conforme','');   
    },'SelectGroups');
  }
  
  $scope.GetTitoli = function()
  {
    SystemInformation.GetSQL('Book', {}, function(Results)  
    {  
      ListaTitoliTmp = SystemInformation.FindResults(Results,'BookListNoFilter');
      if(ListaTitoliTmp != undefined)
      { 
         for(let i = 0; i < ListaTitoliTmp.length; i++)
             ListaTitoliTmp[i] = { 
                                   Chiave : parseInt(ListaTitoliTmp[i].CHIAVE),
                                   Nome   : ListaTitoliTmp[i].TITOLO,
                                   Codice : ListaTitoliTmp[i].CODICE_ISBN
                                 }
         $scope.ListaTitoli  = ListaTitoliTmp;
         $scope.GetGruppiIstituti();
      }
      else SystemInformation.ApplyOnError('Modello titoli gestiti non conforme','');   
    },'SelectSQLNoFilter');
  }

  $scope.GetProvince = function()
  {
    SystemInformation.GetSQL('Accessories',{}, function(Results)
    {
      ListaProvinceTmp = SystemInformation.FindResults(Results,'ProvinceList');
      if (ListaProvinceTmp != undefined) 
      {
        for(let i = 0; i < ListaProvinceTmp.length; i++)
            ListaProvinceTmp[i] = {
                                    Chiave : parseInt(ListaProvinceTmp[i].CHIAVE),
                                    Nome   : ListaProvinceTmp[i].NOME
                                  }
        $scope.ListaProvince = ListaProvinceTmp;
        $scope.GetTitoli();
      }
      else SystemInformation.ApplyOnError('Modello province non conforme',''); 
    });
  }

  $scope.GetIstituti = function()
  {
    SystemInformation.GetSQL('Institute', {}, function(Results)  
    { 
      ListaIstitutiTmp = SystemInformation.FindResults(Results,'InstituteInfoListOnlyVisibile');
      if(ListaIstitutiTmp != undefined)
      {      
         for(let i = 0; i < ListaIstitutiTmp.length; i++)     
             ListaIstitutiTmp[i] = { 
                                     Chiave : parseInt(ListaIstitutiTmp[i].CHIAVE),
                                     Nome   : ListaIstitutiTmp[i].NOME
                                   }    
         $scope.ListaIstituti = ListaIstitutiTmp;
         $scope.GetProvince();
      }
      else SystemInformation.ApplyOnError('Modello istituti non conforme','');   
    },'SelectSQLOnlyVisible');
  }

  $scope.GetPromotori = function()
  {
    SystemInformation.GetSQL('User', {}, function(Results)  
    {
      ListaPromotoriTmp = SystemInformation.FindResults(Results,'UserInfoList');
      if(ListaPromotoriTmp != undefined)
      { 
        for(let i = 0;i < ListaPromotoriTmp.length;i ++)   
            ListaPromotoriTmp[i] = { 
                                       Chiave         : parseInt(ListaPromotoriTmp[i].CHIAVE),
                                       RagioneSociale : ListaPromotoriTmp[i].RAGIONE_SOCIALE,
                                       Username       : ListaPromotoriTmp[i].USERNAME,   
                                    };
          $scope.ListaPromotori = ListaPromotoriTmp;
          $scope.GetIstituti();
      }
      else SystemInformation.ApplyOnError('Modello promotori non conforme','');   
    });
  }

  $scope.GetDate = function()
  {
     SystemInformation.GetSQL('Statistics', {}, function(Results)  
     {
       ListaDateTmp = SystemInformation.FindResults(Results,'GetAllDates');
       if(ListaDateTmp != undefined)
       { 
         for(let i = 0;i < ListaDateTmp.length;i ++)
         {
             ListaDateTmp[i] = { 
                                  ChiaveTmp      : i,
                                  DataFormattata : $scope.ConvertiData(ListaDateTmp[i].DATA),
                                  DataStatistica : ListaDateTmp[i].DATA
                               };
         }
         $scope.ListaDate   = ListaDateTmp;
         /*if($scope.ListaDate.length == 0)
            $scope.SecondaData = null
         else $scope.SecondaData = $scope.ListaDate[0].DataStatistica;*/
         $scope.GetPromotori();     
       }
       else SystemInformation.ApplyOnError('Modello date statistiche precedenti conforme','');   
     },'SelecteDates');
  }

  $scope.GetAdozioniAttuali = function()
  {
    SystemInformation.ExecuteExternalScript('SIRIOExtraGetRegisterCurrentAdoption',{ Registrazione : "F" },function(Answer) 
    {
      var TmpStatistica = Answer.AdozioniAttuali;
      if(TmpStatistica != [])
      {
        for(let i = 0;i < TmpStatistica.length;i ++)
        {
            TmpStatistica[i] = { 
                                 ChiaveIstituto : TmpStatistica[i].K_IST == undefined ? -1 : parseInt(TmpStatistica[i].K_IST),
                                 EditoreTitolo  : TmpStatistica[i].E_TIT = undefined ? 'N.D.' : TmpStatistica[i].E_TIT,
                                 NomeIstituto   : TmpStatistica[i].N_IST == undefined ? 'N.D.' : TmpStatistica[i].N_IST,
                                 ChiaveTitolo   : TmpStatistica[i].K_TIT == undefined ? -1 : parseInt(TmpStatistica[i].K_TIT),
                                 CodiceTitolo   : TmpStatistica[i].C_TIT == undefined ? 'N.D.' : TmpStatistica[i].C_TIT,
                                 NomeTitolo     : TmpStatistica[i].N_TIT == undefined ? 'N.D.' : TmpStatistica[i].N_TIT,
                                 PrezzoTitolo   : TmpStatistica[i].P_TIT == undefined ? '0.0' : TmpStatistica[i].P_TIT.replace(",", "."),
                                 ValoreAdozioni : 0.0,
                                 NrClassi       : TmpStatistica[i].CLS   == undefined ? 'N.D.' : parseInt(TmpStatistica[i].CLS),
                                 NrClassiPrec   : '-' 
                               };
            TmpStatistica[i].ValoreAdozioni = (parseFloat(TmpStatistica[i].PrezzoTitolo) * $scope.NrAlunni * TmpStatistica[i].NrClassi).toFixed(2).toString();
        }
        $scope.ListaStatistica = TmpStatistica;
        $scope.ListaStatistica.sort((a, b) => a.CodiceTitolo < b.CodiceTitolo ? -1 : 1).sort((a, b) => a.NomeTitolo < b.NomeTitolo ? -1 : 1).sort((a, b) => a.CodiceIstituto < b.CodiceIstituto ? -1 : 1).sort((a, b) => a.NomeIstituto < b.NomeIstituto ? -1 : 1);

        $scope.GetDate();
      }
    });
  }

  $scope.GeneraStatistica = function()
  {
    $scope.CaricamentoInCorso = true;
    if($scope.ListaDate.length != 0)
    {
      if($scope.SecondaData == null)
         $scope.SecondaData = $scope.ListaDate[0].DataStatistica;

      var ParamStatistica = {
                               FiltroPromotore     : $scope.PromotoreFiltro,     
                               FiltroGruppoIst     : $scope.GruppoIstitutoFiltro,
                               FiltroProvincia     : $scope.ProvinciaFiltro,     
                               FiltroTitolo        : $scope.TitoloFiltro,        
                               FiltroIstituto      : $scope.IstitutoFiltro,      
                               FiltroMateria       : $scope.MateriaFiltro,
                               FiltroGruppoEd      : $scope.GruppoEditorialeFiltro,     
                               PrimaStatistica     : $scope.PrimaData,        
                               SecondaStatistica   : $scope.SecondaData,
                               FiltroNuoveAdozioni : $scope.NuoveAdozioniFiltro == true ? "T" : "F",
                               FiltroVolUniciPrimi : $scope.VolumiUniciPrimiFiltro == true ? "T" : "F"
                            };
      SystemInformation.ExecuteExternalScript('SIRIOExtraStatistics',ParamStatistica,function(Answer) 
      {
        var ListaAdozioniGenerata = Answer.StatisticaFinale;
        var CountNuoveAdozioni    = 0;
        var CountClassi_1         = 0;
        var CountClassi_2         = 0;
        var CountClassiGestite    = 0;
        for (let i = 0;i < ListaAdozioniGenerata.length;i ++)
        {
             ListaAdozioniGenerata[i] = { 
                                          ChiaveIstituto : ListaAdozioniGenerata[i].K_IST == undefined ? -1 : parseInt(ListaAdozioniGenerata[i].K_IST),
                                          EditoreTitolo  : ListaAdozioniGenerata[i].E_TIT = undefined ? 'N.D.' : ListaAdozioniGenerata[i].E_TIT,
                                          NomeIstituto   : ListaAdozioniGenerata[i].N_IST == undefined ? 'N.D.' : ListaAdozioniGenerata[i].N_IST,
                                          ChiaveTitolo   : ListaAdozioniGenerata[i].K_TIT == undefined ? -1 : parseInt(ListaAdozioniGenerata[i].K_TIT),
                                          CodiceTitolo   : ListaAdozioniGenerata[i].C_TIT == undefined ? 'N.D.' : ListaAdozioniGenerata[i].C_TIT,
                                          NomeTitolo     : ListaAdozioniGenerata[i].N_TIT == undefined ? 'N.D.' : ListaAdozioniGenerata[i].N_TIT,
                                          PrezzoTitolo   : ListaAdozioniGenerata[i].P_TIT == undefined ? '0.0' : ListaAdozioniGenerata[i].P_TIT.replace(",", "."),
                                          EditoreGestito : ListaAdozioniGenerata[i].K_E_TIT == undefined ? false : true,
                                          ValoreAdozioni : 0.0,
                                          NrClassi       : ListaAdozioniGenerata[i].CLS_A == undefined ? 'N.D.' : parseInt(ListaAdozioniGenerata[i].CLS_A),
                                          NrClassiPrec   : ListaAdozioniGenerata[i].CLS_B == undefined ? 'N.D.' : parseInt(ListaAdozioniGenerata[i].CLS_B),
                                        };
              ListaAdozioniGenerata[i].ValoreAdozioni = (parseFloat(ListaAdozioniGenerata[i].PrezzoTitolo) * $scope.NrAlunni * ListaAdozioniGenerata[i].NrClassi).toFixed(2).toString()
              if((ListaAdozioniGenerata[i].NrClassi > 0) && (ListaAdozioniGenerata[i].NrClassiPrec == 0))
                 CountNuoveAdozioni += ListaAdozioniGenerata[i].NrClassi;
              if(ListaAdozioniGenerata[i].EditoreGestito)  
                 CountClassiGestite += ListaAdozioniGenerata[i].NrClassi;
              CountClassi_1 += ListaAdozioniGenerata[i].NrClassi;
              CountClassi_2 += ListaAdozioniGenerata[i].NrClassiPrec;
        };
        ListaAdozioniGenerata.sort((a, b) => a.CodiceTitolo < b.CodiceTitolo ? -1 : 1).sort((a, b) => a.NomeTitolo < b.NomeTitolo ? -1 : 1).sort((a, b) => a.CodiceIstituto < b.CodiceIstituto ? -1 : 1).sort((a, b) => a.NomeIstituto < b.NomeIstituto ? -1 : 1);

        $scope.DatiCumulativi.NrRigheTotali    = ListaAdozioniGenerata.length;
        $scope.DatiCumulativi.NrClassiTot_1    = CountClassi_1;
        $scope.DatiCumulativi.NrClassiTot_2    = CountClassi_2;
        $scope.DatiCumulativi.DifferenzaClassi = CountClassi_1 - CountClassi_2;
        if($scope.DatiCumulativi.DifferenzaClassi > 0)
           $scope.DatiCumulativi.DifferenzaClassi = '+' + $scope.DatiCumulativi.DifferenzaClassi;
        $scope.DatiCumulativi.NrNuoveAdozioni  = CountNuoveAdozioni;
        $scope.DatiCumulativi.NrClassiGestite  = CountClassiGestite; 

        $scope.ListaStatistica = ListaAdozioniGenerata;
        $scope.CaricamentoInCorso = false;
      }); 
    }
    else ZCustomAlert($mdDialog,'ATTENZIONE','Non è presente nessuna statistica di confronto!');   
  }

  $scope.EliminaStatistica = function()
  {
    var EliminaStat = function()
    {
       var $ObjQuery = {Operazioni : []};
       $ObjQuery.Operazioni.push({
                                   Query     : 'DeleteStatistic',
                                   Parametri : { DATA : $scope.SecondaData }
                                 });
       SystemInformation.PostSQL('Statistics',$ObjQuery,function(Answer)
       {
          ZCustomAlert($mdDialog,'OK!',"LA STATISTICA SELEZIONATA E' STATA ELIMINATA");
          $scope.GetAdozioniAttuali();
       });
    };
    var ConfirmSemiFinale = function()
    {
       ZConfirm.GetConfirmBox('ATTENZIONE!',"Confermare l'eliminazione della statistica selezionata? I dati verranno cancellati permanentemente, con nessuna possibilità di recupero!",ConfirmFinale,function(){});
    }
    var ConfirmFinale = function()
    {
       ZConfirm.GetConfirmBox('ATTENZIONE!',"Confermando l'eliminazione i dati non saranno mai più disponibili! Se si è consapevoli di questo cliccare conferma per l'ultima volta.",EliminaStat,function(){});
    }
    if($scope.SecondaData != null)
    {
       StatisticaIndex = $scope.ListaDate.findIndex(function(AStatistica){return(AStatistica.DataStatistica == $scope.SecondaData)});
       if(StatisticaIndex != -1)
          ZConfirm.GetConfirmBox('ATTENZIONE!','Eliminare la statistica relativa alla data ' + $scope.ListaDate[StatisticaIndex].DataFormattata + ' ?',ConfirmSemiFinale,function(){});
    }
    else ZCustomAlert($mdDialog,'ATTENZIONE','Non è stata selezionata nessuna statistica!');
  }

  $scope.EsportaStatisticaXls = function()
  {
    var NomeDocumento = "STATISTICA";
    if($scope.PrimaData == -1)
    {
       NomeDocumento += '_ATTUALE';
       Data_1         = 'ATTUALE'
    }
    else 
    {
       StatisticaIndex_1 = $scope.ListaDate.findIndex(function(AStatistica){return(AStatistica.DataStatistica == $scope.PrimaData)});
       if(StatisticaIndex_1 != -1)
       {
          NomeDocumento += '_' + $scope.ListaDate[StatisticaIndex_1].DataFormattata;
          Data_1        = $scope.ListaDate[StatisticaIndex_1].DataFormattata;
       }
    }
    if($scope.PrimaData == -1 && $scope.SecondaData == null)
       NomeDocumento = 'ADOZIONI_ATTUALI';
    
    StatisticaIndex_2 = $scope.ListaDate.findIndex(function(AStatistica){return(AStatistica.DataStatistica == $scope.SecondaData)});
    if(StatisticaIndex_2 != -1)
    {
       NomeDocumento += '_' + $scope.ListaDate[StatisticaIndex_2].DataFormattata; 
       Data_2         = $scope.ListaDate[StatisticaIndex_2].DataFormattata; 
    }
    else Data_2       = 'ATTUALE';
    
    var WBook = {
                  SheetNames : [],
                  Sheets     : {}
                };

    var SheetName          = "DATI ADOZIONI";
    var BodySheet          = {};
    var SheetNameCum       = "DATI CUMULATIVI";
    var BodySheetCum       = {};
    var SheetNameFiltri    = "FILTRI";
    var BodySheetFiltri    = {}; 
    
    BodySheet['A1'] = SystemInformation.GetCellaIntestazione('NOME ISTITUTO');
    BodySheet['B1'] = SystemInformation.GetCellaIntestazione('CODICE ISBN');
    BodySheet['C1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheet['D1'] = SystemInformation.GetCellaIntestazione('EDITORE');
    BodySheet['E1'] = SystemInformation.GetCellaIntestazione('VALORE ADOZIONI');
    BodySheet['F1'] = SystemInformation.GetCellaIntestazione('CLASSI 1');
    BodySheet['G1'] = SystemInformation.GetCellaIntestazione('CLASSI 2');

    BodySheetCum['A1'] = SystemInformation.GetCellaIntestazione('N° RIGHE');
    BodySheetCum['B1'] = SystemInformation.GetCellaIntestazione('N° CLASSI 1');
    BodySheetCum['C1'] = SystemInformation.GetCellaIntestazione('N° CLASSI 2');
    BodySheetCum['D1'] = SystemInformation.GetCellaIntestazione('DIFFERENZA CLASSI');
    BodySheetCum['E1'] = SystemInformation.GetCellaIntestazione('NR° CLASSI GESTITE 1');
    BodySheetCum['F1'] = SystemInformation.GetCellaIntestazione('NR° NUOVE ADOZIONI 1');

    BodySheetFiltri['A1'] = SystemInformation.GetCellaIntestazione('ISTITUTO');
    BodySheetFiltri['B1'] = SystemInformation.GetCellaIntestazione('PROVINCIA');
    BodySheetFiltri['C1'] = SystemInformation.GetCellaIntestazione('TIPO ISTITUTO');
    BodySheetFiltri['D1'] = SystemInformation.GetCellaIntestazione('TITOLO');
    BodySheetFiltri['E1'] = SystemInformation.GetCellaIntestazione('MATERIA');
    BodySheetFiltri['F1'] = SystemInformation.GetCellaIntestazione('SOLO NUOVE ADOZIONI');
    BodySheetFiltri['G1'] = SystemInformation.GetCellaIntestazione('SOLO VOLUMI PRIMI E UNICI');
    BodySheetFiltri['H1'] = SystemInformation.GetCellaIntestazione('PROMOTORE');
    BodySheetFiltri['I1'] = SystemInformation.GetCellaIntestazione('GRUPPO EDITORIALE');
    BodySheetFiltri['J1'] = SystemInformation.GetCellaIntestazione('DATA STATISTICA 1');
    BodySheetFiltri['K1'] = SystemInformation.GetCellaIntestazione('DATA STATISTICA 2');

    for(let i = 0;i < $scope.ListaStatistica.length;i ++)
    {
          BodySheet['A' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].NomeIstituto);          
          BodySheet['B' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].CodiceTitolo);
          BodySheet['C' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].NomeTitolo);
          BodySheet['D' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].EditoreTitolo);
          BodySheet['E' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].ValoreAdozioni.toString());
          BodySheet['F' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].NrClassi.toString());
          BodySheet['G' + parseInt(i + 2)] = SystemInformation.GetCellaDati('s', $scope.ListaStatistica[i].NrClassiPrec.toString());   
    }

    BodySheetCum['A' + parseInt(2)] = SystemInformation.GetCellaDati('s', $scope.DatiCumulativi.NrRigheTotali.toString());          
    BodySheetCum['B' + parseInt(2)] = SystemInformation.GetCellaDati('s', $scope.DatiCumulativi.NrClassiTot_1.toString());
    BodySheetCum['C' + parseInt(2)] = SystemInformation.GetCellaDati('s', $scope.DatiCumulativi.NrClassiTot_2.toString());
    BodySheetCum['D' + parseInt(2)] = SystemInformation.GetCellaDati('s', $scope.DatiCumulativi.DifferenzaClassi.toString());
    BodySheetCum['E' + parseInt(2)] = SystemInformation.GetCellaDati('s', $scope.DatiCumulativi.NrClassiGestite.toString());
    BodySheetCum['F' + parseInt(2)] = SystemInformation.GetCellaDati('s', $scope.DatiCumulativi.NrNuoveAdozioni.toString());

    IstitutoF         = IstitutoF = $scope.searchTextTit == "" ? "TUTTI" : $scope.searchTextIstituto; 
    ProvinciaF        = $scope.ListaProvince.find(function (Elemento){return Elemento.Chiave == $scope.ProvinciaFiltro});
    ProvinciaF        = ProvinciaF == undefined ? "TUTTE" : ProvinciaF.Nome;
    TipoScuolaF       = $scope.ListaGruppiIstituti.find(function (Elemento){return Elemento.Chiave == $scope.GruppoIstitutoFiltro});
    TipoScuolaF       = TipoScuolaF == undefined ? "TUTTI" : TipoScuolaF.Descrizione; 
    TitoloF           = $scope.ListaTitoli.find(function (Elemento){return Elemento.Chiave == $scope.TitoloFiltro});
    TitoloF           = TitoloF == undefined ? "TUTTI" : TitoloF.Nome + ' - ISBN : ' + TitoloF.Codice;
    MateriaF          = $scope.ListaMaterie.find(function (Elemento){return Elemento.Chiave == $scope.MateriaFiltro});
    MateriaF          = MateriaF == undefined ? "TUTTE" : MateriaF.Materia;
    NuoveAdozF        = $scope.NuoveAdozioniFiltro ? "SI" : "NO";
    VolumiUniciPrimiF = $scope.VolumiUniciPrimiFiltro ? "SI" : "NO";   
    PromotoreF        = $scope.ListaPromotori.find(function (Elemento){return Elemento.Chiave == $scope.PromotoreFiltro});
    PromotoreF        = PromotoreF == undefined ? "TUTTI" : PromotoreF.RagioneSociale; 
    switch($scope.GruppoEditorialeFiltro)
    {
      case -1 : GruppoEdF = "TUTTI";
                break;
      case -2 : GruppoEdF = "GESTITI";
                break;
      case -3 : GruppoEdF = "NON GESTITI";
                break;
      default : GruppoEdF = $scope.ListaGruppiEditoriali.find(function (Elemento){return Elemento.Chiave == $scope.GruppoEditorialeFiltro}); 
                            GruppoEdF = GruppoEdF == undefined ? "-" : GruppoEdF.Descrizione;
    } 

    BodySheetFiltri['A' + parseInt(2)] = SystemInformation.GetCellaDati('s', IstitutoF);          
    BodySheetFiltri['B' + parseInt(2)] = SystemInformation.GetCellaDati('s', ProvinciaF);
    BodySheetFiltri['C' + parseInt(2)] = SystemInformation.GetCellaDati('s', TipoScuolaF);
    BodySheetFiltri['D' + parseInt(2)] = SystemInformation.GetCellaDati('s', TitoloF);
    BodySheetFiltri['E' + parseInt(2)] = SystemInformation.GetCellaDati('s', MateriaF);
    BodySheetFiltri['F' + parseInt(2)] = SystemInformation.GetCellaDati('s', NuoveAdozF);
    BodySheetFiltri['G' + parseInt(2)] = SystemInformation.GetCellaDati('s', VolumiUniciPrimiF);
    BodySheetFiltri['H' + parseInt(2)] = SystemInformation.GetCellaDati('s', PromotoreF);
    BodySheetFiltri['I' + parseInt(2)] = SystemInformation.GetCellaDati('s', GruppoEdF);
    BodySheetFiltri['J' + parseInt(2)] = SystemInformation.GetCellaDati('s', Data_1);
    BodySheetFiltri['K' + parseInt(2)] = SystemInformation.GetCellaDati('s', Data_2);     

    BodySheet["!cols"] = [ 
                          {wpx: 250},            
                          {wpx: 250},
                          {wpx: 350},
                          {wpx: 250},
                          {wpx: 150},
                          {wpx: 100},
                          {wpx: 100}
                        ];

    BodySheetCum["!cols"] = [             
                              {wpx: 100},
                              {wpx: 100},
                              {wpx: 100},
                              {wpx: 200},
                              {wpx: 150},
                              {wpx: 150}
                            ];

    BodySheetFiltri["!cols"] = [             
                                 {wpx: 250},
                                 {wpx: 150},
                                 {wpx: 150},
                                 {wpx: 350},
                                 {wpx: 250},
                                 {wpx: 150},
                                 {wpx: 250},
                                 {wpx: 250},
                                 {wpx: 250},
                                 {wpx: 200},
                                 {wpx: 200}
                               ];

    BodySheet['!ref']       = 'A1:G1' + parseInt($scope.ListaStatistica.length + 1);
    BodySheetCum['!ref']    = 'A1:F1' + 2;
    BodySheetFiltri['!ref'] = 'A1:K1' + 2;

    WBook.SheetNames.push(SheetName);
    WBook.SheetNames.push(SheetNameCum);
    WBook.SheetNames.push(SheetNameFiltri);
    WBook.Sheets[SheetName]       = BodySheet;
    WBook.Sheets[SheetNameCum]    = BodySheetCum;
    WBook.Sheets[SheetNameFiltri] = BodySheetFiltri;

    var wbout = XLSX.write(WBook, {bookType:'xlsx', bookSST:true, type: 'binary'});
    saveAs(new Blob([SystemInformation.s2ab(wbout)],{type:"application/octet-stream"}), NomeDocumento + ".xlsx");

  }

  $scope.RegistraStatoAdozioni = function()
  { 
     var RegistraDati = function()
     {
       $scope.RegistrazioneInCorso = true;
       var $ObjQuery = {Operazioni : []};
       $ObjQuery.Operazioni.push({
                                   Query     : 'DeleteTodayStatistic',
                                   Parametri : {}
                                 });
         SystemInformation.PostSQL('Statistics',$ObjQuery,function(Answer)
         {
           SystemInformation.ExecuteExternalScript('SIRIOExtraGetRegisterCurrentAdoption',{ Registrazione : "T" },function(Answer) 
           {
             $ObjQuery = {Operazioni : []};
             ZCustomAlert($mdDialog,'OK!',"LO STATO DELLE ADOZIONI ATTUALI E' STATO SALVATO CORRETTAMENTE.");
             $scope.GetAdozioniAttuali();
             $scope.RegistrazioneInCorso = false;
             $scope.StatisticaPresente   = true;
           });
         });
     }
     ZConfirm.GetConfirmBox('AVVISO','Sei sicuro di voler registrare lo stato attuale delle adozioni?',RegistraDati,function(){});
  }

  $scope.GetAdozioniAttuali();

}]);