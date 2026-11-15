// #target photoshop

/*   

photoshop batch resize vineri, 23 octombrie 2026, 19:46:56 2026
(c) Dan Ichimescu constantindan@gmail.com


pe scurt:
intr un folder trebuie sa existe psd urile master
in acelasi folder un singur fisier txt tab delimited cu nume si w si h in pixeli (nu trebuie sa existe alte fisiere txt)
se deschide un psd din folderul cu mastere si se ruleaza scriptul

Script pt redimensionari in photoshop
1 intr-un folder se pun masterele: pt landscape , patrat si portrait (astea 3 sunt minime, se recomanda mai multe dimensiuni)
2 in acelasi folder se pune fisierul text, exportat din excel cu text tab delimited - redimensionari.txt (contine nume, w si h , cu w si h in pixeli)
3 se deschide un fisier master, oricare, si se ruleaza scriptul
4 in folderul result vor aparea declinarile, fisierele cu noile dimensiuni.
5 nu conteaza denumirea fisierelor psd si txt
6 !!!ATENTIE!!!  in folderul de lucru trebuie sa fie deci un singur fisier text si psd urile master care vor fi folosite in declinare. nu trebuie sa existe alte fisiere txt sau psd care nu au legatura cu declinarile!!!

Ce face scriptul
1 ia calea de lucru din fisierul deschis
2 cauta in folderul de lucru fisierele psd (masterele), si le face ratia – w/h
!! Important: este necesar ca in folderul de lucru sa fie doar fisierele psd master.
3 cauta in folderul de lucru un fisier text, cu orice denumire, si ia datele de redimensionare – nume , w si h.
!! Important: este necesar ca in folderul de lucru sa fie doar fisierul cu datele de redimensionare! Nu alte fisiere cu extensia txt.
4 pt fiecare intrare din fisierul txt , adica pt fiecare rand (datele pt noul fisier declinat din master), creeaza un nou document psd cu numele , w si h si le salveaza in folderul result
5 fisierele noi se redimensioneaza cu image size pe  w sau h in functie de ratie si apoi se mareste canvas ul la dimensiunea ceruta
6 se creeaza un layer nou (cu numele OriginalLayerSize) in capul listei cu layere cu stroke magenta care va fi util la rearanjarea noilor dimensiuni pt ca ofera un marcaj care arata marginea originala a fisierului din master de la care a plecat/declinat.

*/

//_back_left_60
//_logo_left_top_center
//_logo_left_bottom_center



var strtRulerUnits = app.preferences.rulerUnits;
var strtTypeUnits = app.preferences.typeUnits;
app.preferences.typeUnits = TypeUnits.PIXELS;
app.preferences.rulerUnits = Units.PIXELS;
app.displayDialogs = DialogModes.NO;



// alert("aa   "+documents.length)
var documentsOpned = documents.length;
// test daca e deschis un document
if (documentsOpned == 0) {
   alert("No document open! \nPlease open a master document for this action!")
} else {


   var docRef = app.activeDocument;

   var activePath = app.activeDocument.path;
   var arrTxt = [];



   // CREATE PROGRESS WINDOW

   progress = new Window("palette", "Progress", undefined, {
      "closeButton": false
   });
   progress.t = progress.add("statictext");
   progress.t.preferredSize.width = 450;
   progress.b = progress.add("progressbar");
   progress.b.preferredSize.width = 450;
   progress.display = function (message) {
      message && (this.t.text = message);
      this.show();
      this.update();
   };
   progress.increment = function () {
      this.b.value++;
   };
   progress.set = function (steps) {
      this.b.value = 0;
      this.b.minvalue = 0;
      this.b.maxvalue = steps;
   };

   /*   
        progress.close();
       progress.display("Initializing...");
       progress.set(layerRect.rectangles.length);
       progress.increment();
       progress.display(link.name);
   
   */

   var nameFolderEnum = String(activePath + "/" + "result");

   if (Folder(nameFolderEnum).exists == false) { new Folder(nameFolderEnum).create() };
   // start each run with a fresh align log
   if (File(nameFolderEnum + "/align_log.txt").exists) { File(nameFolderEnum + "/align_log.txt").remove() };


   activeDocument.close(SaveOptions.DONOTSAVECHANGES);
   refresh();
   // $.sleep(1000);
   // refresh();
   var filter = String("/\\.(" + "psd" + ")$/i");
   var filterTxt = String("/\\.(" + "txt" + ")$/i");
   var fileListPsdMasters = new Array;
   var fileListTxt = new Array;
   var psdMasterListPathRatia = [];


   //-------------- get all psd files and open for ratia

   getFilelist(filter, fileListPsdMasters);

   // alert("filelist psd master length:" + fileListPsdMasters.length)

   var myString = fileListPsdMasters.join("\n\n");

   // alert("list of files\n" + myString)


   progress.display("Initializing...");
   refresh();
   // $.sleep(500);
   progress.set(fileListPsdMasters.length);

   for (var f = 0; f < fileListPsdMasters.length; f++) {
      // alert(files[f])

      app.open(fileListPsdMasters[f]);
      var docHeight = app.activeDocument.height;
      var docWidth = app.activeDocument.width;
      var ratiaopendoc = docWidth / docHeight;
      // alert(ratiaopendoc)
      psdMasterListPathRatia.push([fileListPsdMasters[f], ratiaopendoc])
      // psdMasterListRatia.push(ratiaopendoc)
      activeDocument.close(SaveOptions.DONOTSAVECHANGES);
      progress.increment();
   }

   psdMasterListPathRatia.sort(compareSecondColumn);

   function compareSecondColumn(a, b) {
      if (a[1] === b[1]) {
         return 0;
      }
      else {
         return (a[1] < b[1]) ? -1 : 1;
      }
   }


   getFilelisttxt(filterTxt, fileListTxt);

   if (fileListTxt.length == 1) {
      // alert(fileListTxt[0])
   } else {
      alert("File txt for operation is not found! \nScript will exit!")
      exit();
   }

   var definitionsFile = File(fileListTxt[0]);
   // alert("definitionsFile "+definitionsFile);

   definitionsFile.open("r");
   var countLines_l = -1;
   var length_txt = 0

   progress.display("Read data...");

   while (!definitionsFile.eof) {
      length_txt++
      progress.display("Read data..");
      // $.sleep(400);
      // refresh();
      var readedLine = definitionsFile.readln().split("\t");//split("\t");
      arrTxt.push(readedLine)
      progress.display("Read data....");
      // $.sleep(400);
      // refresh();
   }
   // progress.close();
   // progress.display("Initializing...");
   // progress.set(layerRect.rectangles.length);
   // progress.increment();
   // progress.display(link.name);
   // alert(length_txt)
   // exit()


   progress.set(length_txt - 1);


   if (arrTxt.length > 1) {

      for (var i = 1; i < arrTxt.length; i++) {
         var numarLinii = countLines_l++;

         // alert("arrTxt" + "\n" + arrTxt[i][0] + "\n" + arrTxt[i][1] + "\n" + arrTxt[i][2])
         //      +"\n"+"readedLine[3] : "+
         //      readedLine[3]+"\n"+"readedLine[4] : "+readedLine[4]+"\n"+"readedLine[5] : "+readedLine[5])

         // var readedLine = definitionsFile.readln().split("\t");//split("\t");
         //   alert("readedLine[0] : "+readedLine[0]+"\n"+"readedLine[1] : "+readedLine[1]+"\n"+"readedLine[2] : "+readedLine[2])
         //      +"\n"+"readedLine[3] : "+
         //      readedLine[3]+"\n"+"readedLine[4] : "+readedLine[4]+"\n"+"readedLine[5] : "+readedLine[5])

         var finalW = Number(arrTxt[i][1]);
         var finalH = Number(arrTxt[i][2]);
         var finalFileName = arrTxt[i][0];

         progress.display("Resizing file: " + finalFileName + " " + " " + " file no. " + i + " from " + (arrTxt.length - 1));
         // $.sleep(1000);
         refresh();
         //   alert("finalW finalH "+finalW+" "+finalH) 

         var ratiaNewDoc = finalW / finalH;
         // alert("closestIndex urmeaza "+ratiaNewDoc) 

         var closestIndex = findClosestPosition(psdMasterListPathRatia, ratiaNewDoc);

         // alert("closestIndex "+closestIndex)          

         app.open(psdMasterListPathRatia[closestIndex][0]);


         ////------ add a stroke to new layer to mark the original dimension

         var newLayer = app.activeDocument.artLayers.add();

         newLayer.name = "OriginalLayerSize";

         var strokeColorRama = new RGBColor();
         strokeColorRama.hexValue = 'ff03d3';
         app.activeDocument.selection.selectAll();
         app.activeDocument.selection.stroke(strokeColorRama, 10);
         app.activeDocument.selection.deselect();

         newLayer.move(app.activeDocument.layers[0], ElementPlacement.PLACEBEFORE);
         newLayer.visible = false;

         //// ---------------

         /// IMAGE SIZE
         // new resize:
         var docHeight = app.activeDocument.height;
         var docWidth = app.activeDocument.width;
         var ratiaopendoc = docWidth / docHeight;
         var ratiafinal = finalW / finalH;

         if (ratiaopendoc > ratiafinal) {
            app.activeDocument.resizeImage(UnitValue(finalW, "px"), null, null, ResampleMethod.BICUBIC);

            app.activeDocument.resizeCanvas(UnitValue(finalW, "px"), UnitValue(finalH, "px"), AnchorPosition.MIDDLECENTER);
         } else {
            app.activeDocument.resizeImage(null, UnitValue(finalH, "px"), null, ResampleMethod.BICUBIC);
            app.activeDocument.resizeCanvas(UnitValue(finalW, "px"), UnitValue(finalH, "px"), AnchorPosition.MIDDLECENTER);
         }

         var docHeight_name = app.activeDocument.height;
         var docWidth_name = app.activeDocument.width;
         // final name:
         // padded number at the beginning, e.g. 01_, 02_ ... (width follows the total number of files, minimum 2)
         var padLength = Math.max(2, String(arrTxt.length - 1).length);
         var fileNumber = String(i);
         while (fileNumber.length < padLength) { fileNumber = "0" + fileNumber; }
         var finalFileNameforSave = fileNumber + "_" + finalFileName + "_" + docWidth_name.as("px") + "x" + docHeight_name.as("px");

         var filePath = nameFolderEnum;

         // alert(" pathForSave "+pathForSave)

         var SaveFile = String(nameFolderEnum + "/" + finalFileNameforSave + ".psd");


         // alert(" SaveFile "+ SaveFile)

         alignElementsInCanvas(); // from another script
         addguides()

         SavePSD(SaveFile);

         app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

         // second pass: reopen the saved file, align again on the final canvas and save again
         app.open(new File(SaveFile));
         alignElementsInCanvas();
         addguides();
         SavePSD(SaveFile);
         app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
         progress.increment();


      }


   }  ///--- end of while





}  ///--- end of else
progress.close();

alert("done")

function addguides() {

   app.activeDocument.guides.removeAll();

   var doc = app.activeDocument;
   var w = doc.width.as("px");
   var h = doc.height.as("px");
   var procenttocut = 0.5; //0.5;
   if (w > h) {
      var square = h / 9 * procenttocut;
   } else {
      var square = w / 9 * procenttocut;
   }

   // Calculate positions
   var v1 = square;
   var v2 = w - square;
   var h1 = square;
   var h2 = h - square;

   // Add guides
   doc.guides.add(Direction.VERTICAL, new UnitValue(v1, "px"));
   doc.guides.add(Direction.VERTICAL, new UnitValue(v2, "px"));
   doc.guides.add(Direction.HORIZONTAL, new UnitValue(h1, "px"));
   doc.guides.add(Direction.HORIZONTAL, new UnitValue(h2, "px"));
   // add guides to the middle of the document
   doc.guides.add(Direction.VERTICAL, new UnitValue(w / 2, "px"));
   doc.guides.add(Direction.HORIZONTAL, new UnitValue(h / 2, "px"));


   var layerNames = {
      backLeft60: "_back_left_60",
      backLeft50: "_back_left_50"
   }

   try {
      selectlayerdupanume(layerNames.backLeft60);
      if (w > h) {
         doc.guides.add(Direction.VERTICAL, new UnitValue(w * 0.3, "px"));
      }
   }
   catch (e) { }


   try {
      selectlayerdupanume(layerNames.backLeft50);
      if (w > h) {
         doc.guides.add(Direction.VERTICAL, new UnitValue(w / 4, "px"));
      }
   }
   catch (e) { }


   // // if is landscape add guides at 1/4 and 3/4 of the width
   // if (w > h) {
   //     doc.guides.add(Direction.VERTICAL, new UnitValue(w / 4, "px"));
   //     //  doc.guides.add(Direction.VERTICAL,  new UnitValue(w*3/4, "px"));
   //     // add guides at middle of the rectangle in left of the visual which is 60% from w
   //     doc.guides.add(Direction.VERTICAL, new UnitValue(w * 0.3, "px"));
   // } else {
   //     // doc.guides.add(Direction.HORIZONTAL,  new UnitValue(h/4, "px"));
   //     // doc.guides.add(Direction.HORIZONTAL,  new UnitValue(h*3/4, "px"));
   // }   


}
function alignElementsInCanvas() {

    // problems found while aligning, written to result/align_log.txt
    var alignLog = [];

    // make a dictionary with specific layer names for easy reference
    var layerNames = {

        //logo 60

        logoLeftTopCenter_60: "_left_top_center_60",
        logoLeftBottomCenter_60: "_left_bottom_center_60",
        logoLeftBottomRight_60: "_left_bottom_right_60",

        // left logo 50
        logoLeftTopCenter_50: "_left_top_center_50",
        logoLeftBottomCenter_50: "_left_bottom_center_50",
        logoLeftBottomRight_50: "_left_bottom_right_50",

        //top
        logoTopCenter: "_top_center",
        logoTopRight: "_top_right",
        logoTopLeft: "_top_left",
        // top bottom
        logoTopBottomCenter_50: "_top_bottom_center_50",
        logoTopBottomCenter_60: "_top_bottom_center_60",

        logo_top_bottom_right_50: "_top_bottom_right_50",
        logo_top_bottom_left_50: "_top_bottom_left_50",

        logo_top_bottom_right_60: "_top_bottom_right_60",
        logo_top_bottom_left_60: "_top_bottom_left_60",

        // bottom
        bottomLeft: "_bottom_left",
        bottomRight: "_bottom_right",
        bottomCenter: "_bottom_center",

        //back
        backLeft60: "_back_left_60",
        backTop60: "_back_top_60",
        backLeft50: "_back_left_50",
        backTop50: "_back_top_50",
   backFull: "_back_full",

   //lines
   center_left_60: "_center_left_60",
   center_left_50: "_center_left_50",

        //center: "_center"
        center: "_center", // on horizontal center, vertical position unchanged
        _center_center: "_center_center", // vertical and horizontal center  


        // center an image on the right side of the document at 60% of the width
        image_center_right_80: "_image_center_right_80",
        // center an image on the right side of the document at 50% of the width
        image_center_right_75: "_image_center_right_75",

        // background image scaled to cover the whole canvas and centered
        align_background: "_align_background"

    };

    // Build a flat lookup set of target name strings for fast matching
    var targetNames = {};
    for (var key in layerNames) {
        if (layerNames.hasOwnProperty(key)) {
            targetNames[layerNames[key]] = true;
        }
    }

    // Enumerate every layer by index (same technique as getNamesPlusIDs) so that
    // layers with duplicate names are each given their own unique ID and processed.
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var applicationDesc = executeActionGet(ref);
    var count = applicationDesc.getInteger(stringIDToTypeID("numberOfLayers"));

    try { activeDocument.backgroundLayer; var startIdx = 0; } catch (e) { var startIdx = 1; }

    // pass 1: collect target layers first, because the _back_ handlers delete and
    // recreate layers, which would shift the indexes while we are still iterating
    var targets = [];
    for (var i = startIdx; i <= count; i++) {
        if (i == 0) continue;

        var layerRef = new ActionReference();
        layerRef.putIndex(charIDToTypeID('Lyr '), i);
        var desc = executeActionGet(layerRef);
        var layerName = desc.getString(charIDToTypeID('Nm  '));
        var layerId = desc.getInteger(stringIDToTypeID('layerID'));

        if (layerName.match(/^<\/Layer group/)) continue;

        // skip groups — only process content layers
        var layerType = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID('layerSection')));
        if (layerType !== 'layerSectionContent') continue;

        // tolerate small name differences: spaces, upper case, " copy", " copy 2"
        var cleanName = normalizeLayerName(layerName);

        // skip layers whose name is not in our target list
        if (!targetNames[cleanName]) {
            if (cleanName.charAt(0) == "_") alignLog.push("UNKNOWN name: '" + layerName + "'");
            continue;
        }

        targets.push({ id: layerId, name: cleanName, original: layerName });
    }

    // pass 2: align each collected layer (runs on the already resized canvas)
    for (var t = 0; t < targets.length; t++) {
        var layerId = targets[t].id;
        var layerName = targets[t].name;

        try {
            // select by ID so duplicate-named layers are each targeted correctly
            selectById({ id: layerId });
            var lr = app.activeDocument.activeLayer;
            lr.visible = true;
            // a locked layer can not be moved
            try { lr.allLocked = false; } catch (e) { }
            try { lr.positionLocked = false; } catch (e) { }

            // build handler name, for example 'align_logo_left_top_center_60'
            var handlerName = 'align' + layerName;
            var handler = null;
            try { handler = eval(handlerName); } catch (e) { }
            if (typeof handler === 'function') {
                try {
                    handler();
                } catch (e) {
                    alignLog.push("FAILED '" + targets[t].original + "': " + e.message);
                }
            } else {
                alignLog.push("NO FUNCTION " + handlerName + "() for '" + targets[t].original + "'");
            }
        } catch (e) {
            alignLog.push("NOT SELECTED '" + targets[t].original + "': " + e.message);
        }
    }

    writeAlignLog(alignLog);

    // return the object so other functions can use it if needed
    return layerNames;

}

// "_Logo_Top_Center copy 2 " -> "_logo_top_center"
function normalizeLayerName(name) {
    var n = name.replace(/^\s+|\s+$/g, "").toLowerCase();
    n = n.replace(/\s+copy(\s+\d+)?$/, "");
    return n;
}

// append the problems of the current document to result/align_log.txt
function writeAlignLog(alignLog) {
    if (alignLog.length == 0) return;
    try {
        var logFile = new File(nameFolderEnum + "/align_log.txt");
        logFile.open("a");
        logFile.writeln("---- " + app.activeDocument.name + " (" + app.activeDocument.width.as("px") + "x" + app.activeDocument.height.as("px") + ")");
        for (var l = 0; l < alignLog.length; l++) {
            logFile.writeln(alignLog[l]);
        }
        logFile.close();
    } catch (e) { }
}

// helper function to get layer info — reused by all align_ functions
function getLayerInfo() {
    var docRef = activeDocument;
    var myactivelayer = docRef.activeLayer;

    var bounds = myactivelayer.bounds;
    var height = bounds[3].value - bounds[1].value;
    var width = bounds[2].value - bounds[0].value;
    var docWidth = docRef.width.as("px");
    var docHeight = docRef.height.as("px");
    if (docWidth > docHeight) {
        square = docHeight / 9 * 2 / 4;
    } else {
        square = docWidth / 9 * 2 / 4;
    }
    var docCenterW = docRef.width.as("px") / 2;
    var docCenterH = docRef.height.as("px") / 2;

    return {
        docRef: docRef,
        layer: myactivelayer,
        bounds: bounds,
        height: height,
        width: width,
        docWidth: docWidth,
        docHeight: docHeight,
        square: square,
        docCenterW: docCenterW,
        docCenterH: docCenterH
    };
}


   function getNamesPlusIDs() {
  
      var ref = new ActionReference();
      ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
      var applicationDesc = executeActionGet(ref);
      var count = applicationDesc.getInteger(stringIDToTypeID("numberOfLayers"));

      try {
         activeDocument.backgroundLayer;
         var i = 0;
      } catch (e) { var i = 1; };
      for (i; i < count; i++) {
         if (i == 0) continue;
         ref = new ActionReference();
         ref.putIndex(charIDToTypeID('Lyr '), i);
         var desc = executeActionGet(ref);
         var layerName = desc.getString(charIDToTypeID('Nm  '));
         var Id = desc.getInteger(stringIDToTypeID('layerID'));
         if (layerName.match(/^<\/Layer group/)) continue;
         var layerType = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID('layerSection')));
         var isLayerSet = (layerType == 'layerSectionContent') ? false : true;
         if (!isLayerSet) {
            // if (layerName.charAt(0) == "_") {  /// conditie!
            //alert(layerName); 


            // if (layerName.search("alpha")>0) 
            if (layerName.search(NumeFolderString) > 0) {

               //	app.activeDocument = app.documents[0];
               //	app.activeDocument = app.documents[NameOfUvDocument];

               selectById({ id: Id })
               //var layerToProcess = activeDocument.layerSets[i].artLayers.getByName (layerName);
               //alert(layerToProcess); 
               //var numeLayerJson = layerName.replace("_", "")
            //    MoveLayerinGroup(NumeFolderString);
            }


            // } /// conditie!

            NamesofLayersUv.push(layerName)
         };
      };
      return NamesofLayersUv.reverse();
   };


function selectById(data) {
    if (data == undefined) return false;
    if (data.id == undefined) return false;

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID('Lyr '), data.id);
    desc.putReference(charIDToTypeID('null'), ref);
    if (data.add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
    if (data.visible) desc.putBoolean(charIDToTypeID('MkVs'), data.visible);
    executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
}


// handler functions for specific layer placements (placeholders)


// // center an image on the right side of the document at 40% of the width and vertical position 
function align_image_center_right_80() {
    var i = getLayerInfo();
    var deltaX = Math.round((-i.bounds[0].value + (i.docWidth * 0.8) - i.width / 2));
    var deltaY = Math.round(i.docCenterH - (i.bounds[1].value + i.height / 2));
    i.layer.translate(deltaX, deltaY);
}

// center an image on the right side of the document at 75 % of the width and vertical position 
function align_image_center_right_75() {
    var i = getLayerInfo();
    var deltaX = Math.round((-i.bounds[0].value + (i.docWidth * 0.75) - i.width / 2));
    var deltaY = Math.round(i.docCenterH - (i.bounds[1].value + i.height / 2));
    i.layer.translate(deltaX, deltaY);
}
        

// align to _center_left_60 

function align_center_left_60() {   
    var i = getLayerInfo();
    var deltaX = Math.round((-i.bounds[0].value + (i.docWidth * 0.3) - i.width / 2));
    var deltaY = 0; // vertical position unchanged
    i.layer.translate(deltaX, deltaY);
}

function align_center_left_50() {   
    var i = getLayerInfo();
    var deltaX = Math.round((-i.bounds[0].value + (i.docWidth / 4) - i.width / 2));
    var deltaY = 0; // vertical position unchanged
    i.layer.translate(deltaX, deltaY);
}


// center center - vertical and horizontal center
function align_center_center() {
    var i = getLayerInfo();
    var deltaX = Math.round(i.docCenterW - (i.bounds[0].value + i.width / 2));

    var deltaY = Math.round(i.docCenterH - (i.bounds[1].value + i.height / 2));
    i.layer.translate(deltaX, deltaY);
}


// bottom center    
function align_bottom_center() {
    var i = getLayerInfo();
    var deltaX = Math.round(i.docCenterW - (i.bounds[0].value + i.width / 2));
    var deltaY = Math.round((-i.bounds[1].value + i.docHeight - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}
// center
function align_center() {
    var i = getLayerInfo();
    var deltaX = Math.round(i.docCenterW - (i.bounds[0].value + i.width / 2));
    var deltaY = 0; // vertical position unchanged
    i.layer.translate(deltaX, deltaY);
}


// logo left
// _left_top_center_60
function align_left_top_center_60() {
    var i = getLayerInfo();

    var deltaX = Math.round((-i.bounds[0].value + (i.docWidth * 0.3) - i.width / 2));
    var deltaY = Math.round((-i.bounds[1].value + i.square));
    i.layer.translate(deltaX, deltaY);
}
// _left_bottom_center_60
function align_left_bottom_center_60() {
    var i = getLayerInfo();

    var deltaX = Math.round((-i.bounds[0].value + (i.docWidth * 0.3) - i.width / 2));
    var deltaY = Math.round((-i.bounds[1].value + i.docHeight - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}
//_left_bottom_right_60
function align_left_bottom_right_60() {
    var i = getLayerInfo();

    // BOTTOM RIGHT CORNER:
    var deltaX = Math.round((-i.bounds[0].value + i.docWidth - i.width - i.square));
    var deltaY = Math.round((-i.bounds[1].value + i.docHeight - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}

//logo left top
// _left_top_center_50
function align_left_top_center_50() {
    var i = getLayerInfo();

    // align to top left center at 1/4 of the width
    var deltaX = Math.round((-i.bounds[0].value + i.docWidth / 4 - i.width / 2));
    var deltaY = Math.round((-i.bounds[1].value + i.square));
    i.layer.translate(deltaX, deltaY);
}
//_left_bottom_center_50
function align_left_bottom_center_50() {
    var i = getLayerInfo();

    // align to bottom left center at 1/4 of the width of the document
    var deltaX = Math.round((-i.bounds[0].value + i.docWidth / 4 - i.width / 2));
    var deltaY = Math.round((-i.bounds[1].value + i.docHeight - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}
// _left_bottom_right_50
function align_left_bottom_right_50() {
    var i = getLayerInfo();

    // BOTTOM RIGHT CORNER:
    var deltaX = Math.round((-i.bounds[0].value + i.docWidth - i.width - i.square));
    var deltaY = Math.round((-i.bounds[1].value + i.docHeight - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}

// top
// _top_center
function align_top_center() {
    var i = getLayerInfo();

    var deltaX = Math.round(i.docCenterW - (i.bounds[0].value + i.width / 2));
    var deltaY = Math.round((-i.bounds[1].value + i.square));
    i.layer.translate(deltaX, deltaY);
}
// _top_left
function align_top_left() {
    var i = getLayerInfo();

    //align to top center to left of document
    var deltaX = Math.round((-i.bounds[0].value + i.square));
    var deltaY = Math.round((-i.bounds[1].value + i.square));
    i.layer.translate(deltaX, deltaY);
}
// _top_right
function align_top_right() {
    var i = getLayerInfo();

    // align to top center to right of document
    var deltaX = Math.round((-i.bounds[0].value + i.docWidth - i.width - i.square));
    var deltaY = Math.round((-i.bounds[1].value + i.square));
    i.layer.translate(deltaX, deltaY);
}
// _top_bottom_center
function align_top_bottom_center_60() {
    var i = getLayerInfo();

    var deltaX = Math.round(i.docCenterW - (i.bounds[0].value + i.width / 2));
    var deltaY = Math.round((-i.bounds[1].value + (i.docHeight * 0.6) - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}
// _top_bottom_center
function align_top_bottom_center_50() {
    var i = getLayerInfo();

    // BOTTOM CENTERING:
    var deltaX = Math.round(i.docCenterW - (i.bounds[0].value + i.width / 2));
    var deltaY = Math.round((-i.bounds[1].value + (i.docHeight * 0.5) - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}



// _top_bottom_right
function align_top_bottom_right_50() {
    var i = getLayerInfo();

    var deltaX = Math.round((-i.bounds[0].value + i.docWidth - i.width - i.square));
    var deltaY = Math.round((-i.bounds[1].value + (i.docHeight * 0.5) - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}

// _top_bottom_left
function align_top_bottom_left_50() {
    var i = getLayerInfo();

    var deltaX = Math.round((-i.bounds[0].value + i.square));
    var deltaY = Math.round((-i.bounds[1].value + (i.docHeight * 0.5) - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}

// _top_bottom_right
function align_top_bottom_right_60() {
    var i = getLayerInfo();

    var deltaX = Math.round((-i.bounds[0].value + i.docWidth - i.width - i.square));
    var deltaY = Math.round((-i.bounds[1].value + (i.docHeight * 0.6) - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}

// _top_bottom_left
function align_top_bottom_left_60() {
    var i = getLayerInfo();

    var deltaX = Math.round((-i.bounds[0].value + i.square));
    var deltaY = Math.round((-i.bounds[1].value + (i.docHeight * 0.6) - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}

// _bottom_left
function align_bottom_left() {
    var i = getLayerInfo();

    // align to bottom left corner with a margin of 'square'
    var deltaX = Math.round((-i.bounds[0].value + i.square));
    var deltaY = Math.round((-i.bounds[1].value + i.docHeight - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}

// _bottom_right
function align_bottom_right() {
    var i = getLayerInfo();

    // align to bottom right corner with a margin of 'square'
    var deltaX = Math.round((-i.bounds[0].value + i.docWidth - i.width - i.square));
    var deltaY = Math.round((-i.bounds[1].value + i.docHeight - i.height - i.square));
    i.layer.translate(deltaX, deltaY);
}



//background

// _align_background — scale the layer / smart object proportionally until it covers
// the whole canvas (the bigger of the two scale factors wins), then center it
function align_align_background() {
    var i = getLayerInfo();
    if (i.width == 0 || i.height == 0) return; // empty layer

    var scale = Math.max(i.docWidth / i.width, i.docHeight / i.height) * 100;
    i.layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);

    // read the bounds again after resize and center on the canvas
    var b = i.layer.bounds;
    var newW = b[2].value - b[0].value;
    var newH = b[3].value - b[1].value;
    var deltaX = Math.round(i.docCenterW - (b[0].value + newW / 2));
    var deltaY = Math.round(i.docCenterH - (b[1].value + newH / 2));
    i.layer.translate(deltaX, deltaY);
}

function align_back_full() {
  var i = getLayerInfo();

//    alert("align_back_fullcanvas");
   var doc = app.activeDocument;
//    var canvasWidth = i.width;
//    var canvasHeight = i.height; 
   var canvasWidth = doc.width;
   var canvasHeight = doc.height;
   var myLayer = app.activeDocument.activeLayer;
   myLayer.remove();
   drawAction(canvasWidth, canvasHeight);
   var myLayer2 = app.activeDocument.activeLayer;
   myLayer2.name = "_back_full";
   
}


function align_back_left_60() {
    // alert("align_back_left_60");

    var doc = app.activeDocument;
    var canvasWidth = (doc.width / 100) * 60;
    var canvasHeight = doc.height;
    var myLayer = app.activeDocument.activeLayer;
    myLayer.remove();
    drawAction(canvasWidth, canvasHeight);

    var myLayer2 = app.activeDocument.activeLayer;
    myLayer2.name = "_back_left_60";
}
function align_back_top_60() {
    var doc = app.activeDocument;
    var canvasWidth = doc.width;
    var canvasHeight = (doc.height / 100) * 60;
    var myLayer = app.activeDocument.activeLayer;
    myLayer.remove();
    drawAction(canvasWidth, canvasHeight);
    var myLayer2 = app.activeDocument.activeLayer;
    myLayer2.name = "_back_top_60";
}
function align_back_left_50() {
    var doc = app.activeDocument;
    var canvasWidth = (doc.width / 100) * 50;
    var canvasHeight = doc.height;
    var myLayer = app.activeDocument.activeLayer;
    myLayer.remove();
    drawAction(canvasWidth, canvasHeight);
    var myLayer2 = app.activeDocument.activeLayer;
    myLayer2.name = "_back_left_50";
}
function align_back_top_50() {
    var doc = app.activeDocument;
    var canvasWidth = doc.width;
    var canvasHeight = doc.height / 2;
    var myLayer = app.activeDocument.activeLayer;
    myLayer.remove();
    drawAction(canvasWidth, canvasHeight);
    var myLayer2 = app.activeDocument.activeLayer;
    myLayer2.name = "_back_top_50";
}


function selectlayerdupanume(numeLr) {
   var idslct = charIDToTypeID("slct");
   var desc280 = new ActionDescriptor();
   var idnull = charIDToTypeID("null");
   var ref28 = new ActionReference();
   var idLyr = charIDToTypeID("Lyr ");
   ref28.putName(idLyr, numeLr);
   desc280.putReference(idnull, ref28);
   var idMkVs = charIDToTypeID("MkVs");
   desc280.putBoolean(idMkVs, false);
   var idLyrI = charIDToTypeID("LyrI");
   var list19 = new ActionList();
   list19.putInteger(131);
   desc280.putList(idLyrI, list19);
   executeAction(idslct, desc280, DialogModes.NO);
}


////---------------------------------

function drawAction(canvasWidth, canvasHeight) {
   // =======================================================
   var idMk = charIDToTypeID("Mk  ");
   var desc5 = new ActionDescriptor();
   var idnull = charIDToTypeID("null");
   var ref1 = new ActionReference();
   var idcontentLayer = stringIDToTypeID("contentLayer");
   ref1.putClass(idcontentLayer);
   desc5.putReference(idnull, ref1);
   var idUsng = charIDToTypeID("Usng");
   var desc6 = new ActionDescriptor();
   var idType = charIDToTypeID("Type");
   var desc7 = new ActionDescriptor();
   var idClr = charIDToTypeID("Clr ");
   var desc8 = new ActionDescriptor();
   var idRd = charIDToTypeID("Rd  ");
   desc8.putDouble(idRd, 255.000000);
   var idGrn = charIDToTypeID("Grn ");
   desc8.putDouble(idGrn, 98.000000);
   var idBl = charIDToTypeID("Bl  ");
   desc8.putDouble(idBl, 0.000000);
   var idRGBC = charIDToTypeID("RGBC");
   desc7.putObject(idClr, idRGBC, desc8);
   var idsolidColorLayer = stringIDToTypeID("solidColorLayer");
   desc6.putObject(idType, idsolidColorLayer, desc7);
   var idShp = charIDToTypeID("Shp ");
   var desc9 = new ActionDescriptor();
   var idunitValueQuadVersion = stringIDToTypeID("unitValueQuadVersion");
   desc9.putInteger(idunitValueQuadVersion, 1);
   var idTop = charIDToTypeID("Top ");
   var idPxl = charIDToTypeID("#Pxl");
   desc9.putUnitDouble(idTop, idPxl, 0.000000);

   var idLeft = charIDToTypeID("Left");
   var idPxl = charIDToTypeID("#Pxl");
   desc9.putUnitDouble(idLeft, idPxl, 0.000000);

   var idBtom = charIDToTypeID("Btom");
   var idPxl = charIDToTypeID("#Pxl");
   // desc9.putUnitDouble( idBtom, idPxl, 3536.000000 );
   desc9.putUnitDouble(idBtom, idPxl, canvasHeight);

   var idRght = charIDToTypeID("Rght");
   var idPxl = charIDToTypeID("#Pxl");
   // desc9.putUnitDouble( idRght, idPxl, 2500.000000 );
   desc9.putUnitDouble(idRght, idPxl, canvasWidth);


   var idtopRight = stringIDToTypeID("topRight");
   var idPxl = charIDToTypeID("#Pxl");
   desc9.putUnitDouble(idtopRight, idPxl, 0.000000);
   var idtopLeft = stringIDToTypeID("topLeft");
   var idPxl = charIDToTypeID("#Pxl");
   desc9.putUnitDouble(idtopLeft, idPxl, 0.000000);
   var idbottomLeft = stringIDToTypeID("bottomLeft");
   var idPxl = charIDToTypeID("#Pxl");
   desc9.putUnitDouble(idbottomLeft, idPxl, 0.000000);
   var idbottomRight = stringIDToTypeID("bottomRight");
   var idPxl = charIDToTypeID("#Pxl");
   desc9.putUnitDouble(idbottomRight, idPxl, 0.000000);
   var idRctn = charIDToTypeID("Rctn");
   desc6.putObject(idShp, idRctn, desc9);
   var idstrokeStyle = stringIDToTypeID("strokeStyle");
   var desc10 = new ActionDescriptor();
   var idstrokeStyleVersion = stringIDToTypeID("strokeStyleVersion");
   desc10.putInteger(idstrokeStyleVersion, 2);
   var idstrokeEnabled = stringIDToTypeID("strokeEnabled");
   desc10.putBoolean(idstrokeEnabled, false);
   var idfillEnabled = stringIDToTypeID("fillEnabled");
   desc10.putBoolean(idfillEnabled, true);
   var idstrokeStyleLineWidth = stringIDToTypeID("strokeStyleLineWidth");
   var idPxl = charIDToTypeID("#Pxl");
   desc10.putUnitDouble(idstrokeStyleLineWidth, idPxl, 1.000000);
   var idstrokeStyleLineDashOffset = stringIDToTypeID("strokeStyleLineDashOffset");
   var idPnt = charIDToTypeID("#Pnt");
   desc10.putUnitDouble(idstrokeStyleLineDashOffset, idPnt, 0.000000);
   var idstrokeStyleMiterLimit = stringIDToTypeID("strokeStyleMiterLimit");
   desc10.putDouble(idstrokeStyleMiterLimit, 100.000000);
   var idstrokeStyleLineCapType = stringIDToTypeID("strokeStyleLineCapType");
   var idstrokeStyleLineCapType = stringIDToTypeID("strokeStyleLineCapType");
   var idstrokeStyleButtCap = stringIDToTypeID("strokeStyleButtCap");
   desc10.putEnumerated(idstrokeStyleLineCapType, idstrokeStyleLineCapType, idstrokeStyleButtCap);
   var idstrokeStyleLineJoinType = stringIDToTypeID("strokeStyleLineJoinType");
   var idstrokeStyleLineJoinType = stringIDToTypeID("strokeStyleLineJoinType");
   var idstrokeStyleMiterJoin = stringIDToTypeID("strokeStyleMiterJoin");
   desc10.putEnumerated(idstrokeStyleLineJoinType, idstrokeStyleLineJoinType, idstrokeStyleMiterJoin);
   var idstrokeStyleLineAlignment = stringIDToTypeID("strokeStyleLineAlignment");
   var idstrokeStyleLineAlignment = stringIDToTypeID("strokeStyleLineAlignment");
   var idstrokeStyleAlignCenter = stringIDToTypeID("strokeStyleAlignCenter");
   desc10.putEnumerated(idstrokeStyleLineAlignment, idstrokeStyleLineAlignment, idstrokeStyleAlignCenter);
   var idstrokeStyleScaleLock = stringIDToTypeID("strokeStyleScaleLock");
   desc10.putBoolean(idstrokeStyleScaleLock, false);
   var idstrokeStyleStrokeAdjust = stringIDToTypeID("strokeStyleStrokeAdjust");
   desc10.putBoolean(idstrokeStyleStrokeAdjust, false);
   var idstrokeStyleLineDashSet = stringIDToTypeID("strokeStyleLineDashSet");
   var list1 = new ActionList();
   desc10.putList(idstrokeStyleLineDashSet, list1);
   var idstrokeStyleBlendMode = stringIDToTypeID("strokeStyleBlendMode");
   var idBlnM = charIDToTypeID("BlnM");
   var idNrml = charIDToTypeID("Nrml");
   desc10.putEnumerated(idstrokeStyleBlendMode, idBlnM, idNrml);
   var idstrokeStyleOpacity = stringIDToTypeID("strokeStyleOpacity");
   var idPrc = charIDToTypeID("#Prc");
   desc10.putUnitDouble(idstrokeStyleOpacity, idPrc, 100.000000);
   var idstrokeStyleContent = stringIDToTypeID("strokeStyleContent");
   var desc11 = new ActionDescriptor();
   var idClr = charIDToTypeID("Clr ");
   var desc12 = new ActionDescriptor();
   var idRd = charIDToTypeID("Rd  ");
   desc12.putDouble(idRd, 0.000000);
   var idGrn = charIDToTypeID("Grn ");
   desc12.putDouble(idGrn, 0.000000);
   var idBl = charIDToTypeID("Bl  ");
   desc12.putDouble(idBl, 0.000000);
   var idRGBC = charIDToTypeID("RGBC");
   desc11.putObject(idClr, idRGBC, desc12);
   var idsolidColorLayer = stringIDToTypeID("solidColorLayer");
   desc10.putObject(idstrokeStyleContent, idsolidColorLayer, desc11);
   var idstrokeStyleResolution = stringIDToTypeID("strokeStyleResolution");
   desc10.putDouble(idstrokeStyleResolution, 300.000000);
   var idstrokeStyle = stringIDToTypeID("strokeStyle");
   desc6.putObject(idstrokeStyle, idstrokeStyle, desc10);
   var idcontentLayer = stringIDToTypeID("contentLayer");
   desc5.putObject(idUsng, idcontentLayer, desc6);
   var idLyrI = charIDToTypeID("LyrI");
   desc5.putInteger(idLyrI, 54);
   executeAction(idMk, desc5, DialogModes.NO);

   // =======================================================
}


function getFilelist(filter, fileListPsdMasters) {

   var files = activePath.getFiles(eval(filter));
   //    alert(files[0])
   for (var f = 0; f < files.length; f++) {

      var file = new File(files[f]);
      var fileName = file.name;
      // alert("filename\n" + fileName)
      if (fileName.match(/\._/) === null) {
         // alert(files[f])
         fileListPsdMasters.push(files[f]);
      }
   }

}



function getFilelisttxt(filterTxt, fileListTxt) {

   var files = activePath.getFiles(eval(filterTxt));
   //    alert(files[0])
   for (var f = 0; f < files.length; f++) {
      // alert(files[f])
      fileListTxt.push(files[f]);
   }

}

function findClosestPosition(psdMasterListPathRatia, ratiaNewDoc) {
   if (psdMasterListPathRatia.length === 0) {
      return -1; // Return -1 if the array is empty.
   }

   var closestIndex = 0;
   var closestDiff = Math.abs(psdMasterListPathRatia[0][1] - ratiaNewDoc); //[2][1]
   // alert("closestDiff "+closestDiff)

   for (var i = 1; i < psdMasterListPathRatia.length; i++) {
      var currentDiff = Math.abs(psdMasterListPathRatia[i][1] - ratiaNewDoc);

      //   alert("currentDiff "+currentDiff)

      if (currentDiff < closestDiff) {
         closestIndex = i;
         closestDiff = currentDiff;
      }
   }

   return closestIndex;
}

function SavePSD(SaveFile) {

   var idsave = charIDToTypeID("save");
   var desc267 = new ActionDescriptor();
   var idAs = charIDToTypeID("As  ");
   var desc268 = new ActionDescriptor();
   var idmaximizeCompatibility = stringIDToTypeID("maximizeCompatibility");
   desc268.putBoolean(idmaximizeCompatibility, true);
   var idPhtthree = charIDToTypeID("Pht3");
   desc267.putObject(idAs, idPhtthree, desc268);
   var idIn = charIDToTypeID("In  ");


   desc267.putPath(idIn, new File(SaveFile));

   var idDocI = charIDToTypeID("DocI");
   desc267.putInteger(idDocI, 234);
   var idLwCs = charIDToTypeID("LwCs");
   desc267.putBoolean(idLwCs, true);
   var idsaveStage = stringIDToTypeID("saveStage");
   var idsaveStageType = stringIDToTypeID("saveStageType");
   var idsaveSucceeded = stringIDToTypeID("saveSucceeded");
   desc267.putEnumerated(idsaveStage, idsaveStageType, idsaveSucceeded);
   executeAction(idsave, desc267, DialogModes.NO);



}