
ssa =

" <script> \n" +
 " let acorn = require('acorn'); \n" +
 "  \n" +
 " let aa = acorn.parse('var aa = function (x,y){ }', {ecmaVersion: 2020}); \n" +
 "  \n" +
" console.log(Object.entries(aa)); \n" +
" alert(Object.values(aa));\n" +
" </script> \n" ;

ssa =
"  \n" +
" <script> \n" +
" let babelParser = require('@babel/parser'); \n" +
"  \n" +
"  let ast = []; \n" +
"  \n" +
" //ast = babelParser.parse(code, mergeObjectStructures(defaultAstConfig, config)); \n" +
" ast = babelParser.parse('function ab() { }', {}); \n" +
"  \n" +
" console.log('=>',ast.toString()); \n" +
"  \n" +
" </script> \n" ;

 ssa =
" <script> \n" +

" var ab; \n" +
" var ab,cd; \n" +
"  var ab = '';           // general var   (gv) \n" +
"  let ab = '';           // general let   (gl) \n" +
"  const ab = '';         // general const (gc) \n" +
"  var ast = [   ];          // var array     (va) \n" +
"  let ast = [   ];          // let array     (la) \n " +
"  const ast = [ ];        // const array   (ca) \n" +
"  var ast = {   };          // var object     (vo) \n" +
"  let ast = {   };          // let object     (lo) \n " +
"  const ast = { };        // const object   (co) \n" +
" </script> \n" ;


ssa =
" <html> \n" +
"   <head> \n" +
"     <title>Read Text File Tutorial</title> \n" +
"  \n" +
"     <script type='text/javascript' src='htmlparser.js'></script> \n" +
"   </head> \n" +
"   <body> \n" +
"     <input type='file' onchange='loadFile(this.files[0])'> \n" +
"     <input type='file' name='inputFile' id='inputFile'> \n" +
"     <br> \n" +
"     <pre id='output'></pre> \n" +
"     <script> \n" +
"          var text; \n" +
"          async function loadFile(file) { \n" +
"             let text = await file.text(); \n" +
"             document.getElementById('output').textContent = text; \n" +
"  \n" +
"             var xml = HTMLtoXML(text); \n" +
"  \n" +
"             console.log('',xml); \n" +
"          } \n" +
"  \n" +
"  \n" +
"         document.getElementById('inputFile').addEventListener('change', function() { \n" +
"            var file = new FileReader(); \n" +
"            file.onload = () => { \n" +
"              document.getElementById('output').textContent = file.result; \n" +
"            } \n" +
"             file.readAsText(this.files[0]); \n" +
"         }); \n" +
"     </script> \n" +
"   </body> \n" +
" </html> \n" +
"  \n" ;

ssa=

" 	<script type='text/javascript'> " +
"  \n" +
" if ( window.top == window ){ \n" +
"  	document.location = 'default.html' ; \n" +
"  }\n" +

  " function OpenSample(sample)   \n" +
  " {\n" +
  " 	if ( aa > 0 ) \n" +
  " 		test( a, 'me!!!!' ) ; \n" +
  " }    \n" +
  "     \n" +
  " function ab() \n" +
  " {\n" +
  "    alert('~'); \n" +
  " } \n" +
 "  \n" +
" " +
" 	</script> \n" +

"  \n" ;


ssa =
" <input type='hidden' id='checkvalue' value='yes' /> \n" +
"  \n" +
" <script> \n" +
"  \n" +
" var data = []; \n" +
" var $checkvalue = $('#checkvalue').val(); \n" +
" if($checkvalue === 'yes'){ \n" +
"     alert(''); \n" +
"     data.put($checkvalue); \n" +
" } \n" +
"  \n" +
" if($('#checkvalue').val() === 'yes'){ \n" +
"     alert(''); \n" +
"     data.put($checkvalue); \n" +
" } \n" +
"  \n" +
" $titlePanels = [$('#title-panel-1'), $('#title-panel-2')]; \n" +
" $nameField = $('#player-name-field'); \n" +
" $warningContainer = $('#initial-warning'); \n" +
" $titleContainer = $('#main-title-container'); \n" +
" $sizeBlocks = { male: $('#male-size-container'), female: $('#female-size-container') }; \n" +
" $clothingTable = $('#title-clothing-table'); \n" +
" $warningLabel = $('#title-warning-label'); \n" +
" $titleCandy = [$('#left-title-candy'), $('#right-title-candy')]; \n" +
"  \n" +
" var $gameLoadLabel = $('.game-load-label'); \n" +
" var $gameLoadProgress = $('.game-load-progress'); \n" +
"  \n" +
"  \n" +
"  \n" +
" </script> \n" ;


ssa=
" <script> \n" +
" var opt = { 'aa', { \n" +
"                       { \n" +
"                       } \n" +
"                   } \n" +
"           }; \n" +
" </script> \n" ;



ssa=
" <script> \n" +
" var opt = { 'aa': {  values:  [ {}, {}, {} ]      }}; \n" +
" </script> \n" ;

ssa=
" <script> \n" +
" var opt = { {   {}, {}, {}, {}, {}            } } \n" +
"  \n" +
" </script> \n" ;



ssa =
" <script> \n" +
"  \n" +
" var opt = { \n" +
"     'pussy': { \n" +
"         values: [ \n" +
"             { value: 'orivia' }, \n" +
"             { value: 'jena' }, \n" +
"             { value: 'silly' }, \n" +
"         ] \n" +
"     } \n" +
" }; \n" +
"  \n" +
" </script> \n" ;



ssa =
" <script> \n" +
" var playerTagOptions = { \n" +
"     'sexual_orientation': { \n" +
"         values: [ \n" +
"             { value: 'straight' }, \n" +
"             { value: 'bi-curious' }, \n" +
"             { value: 'bisexual' }, \n" +
"             { value: 'reverse_bi-curious', gender: 'male', text: 'Male-leaning bi-curious ' }, \n" +
"             { value: 'reverse_bi-curious', gender: 'female', text: 'Female-leaning bi-curious' }, \n" +
"             { value: 'gay', gender: 'male' }, \n" +
"             { value: 'lesbian', gender: 'female' }, \n" +
"         ] \n" +
"     } \n" +
" }; \n" +
"  \n" +
" </script> \n" ;


ssa =
" <script> \n" +
"  \n" +
" var playerTagOptions = { \n" +
"     'hair_color': { \n" +
"         values: [ \n" +
"             { value: 'black_hair' }, { value: 'white_hair' }, \n" +
"             { value: 'brunette' }, { value: 'ginger' }, { value: 'blonde' }, \n" +
"             { value: 'green_hair' }, \n" +
"             { value: 'blue_hair' }, \n" +
"             { value: 'purple_hair' }, \n" +
"             { value: 'pink_hair' }, \n" +
"         ], \n" +
"     }, \n" +
"     'eye_color': { \n" +
"         values: [ \n" +
"             { value: 'dark_eyes' }, { value: 'pale_eyes' }, \n" +
"             { value: 'red_eyes' }, { value: 'amber_eyes' }, \n" +
"             { value: 'green_eyes' }, { value: 'blue_eyes' }, \n" +
"             { value: 'violet_eyes' }, \n" +
"         ], \n" +
"     }, \n" +
"     'skin_color': { \n" +
"         type: 'range', \n" +
"         values: [ \n" +
"             { value: 'pale-skinned', from: 0, to: 25 }, \n" +
"             { value: 'fair-skinned', from: 25, to: 50 }, \n" +
"             { value: 'olive-skinned', from: 50, to: 75 }, \n" +
"             { value: 'dark-skinned', from: 75, to: 100 }, \n" +
"         ], \n" +
"     }, \n" +
"     'hair_length': { \n" +
"         values: [ \n" +
"             { value: 'bald', text: 'Bald - No Hair'}, \n" +
"             { value: 'short_hair', text: 'Short Hair - Does Not Pass Jawline'}, \n" +
"             { value: 'medium_hair', text: 'Medium Hair - Reaches Between Jawline and Shoulders'}, \n" +
"             { value: 'long_hair', text: 'Long Hair - Reaches Beyond Shoulders'}, \n" +
"             { value: 'very_long_hair', text: 'Very Long Hair - Reaches the Thighs or Beyond'}, \n" +
"         ], \n" +
"     }, \n" +
"     'physical_build': { \n" +
"         values: [ \n" +
"             { value: 'skinny' }, \n" +
"             { value: 'chubby' }, \n" +
"             { value: 'curvy', gender: 'female' }, \n" +
"             { value: 'athletic' }, \n" +
"             { value: 'muscular' }, \n" +
"         ], \n" +
"     }, \n" +
"     'height': { \n" +
"         values: [ \n" +
"             { value: 'tall' }, \n" +
"             { value: 'average' }, \n" +
"             { value: 'short' }, \n" +
"         ], \n" +
"     }, \n" +
"     'pubic_hair_style': { \n" +
"         values: [ \n" +
"             { value: 'shaved' }, \n" +
"             { value: 'trimmed' }, \n" +
"             { value: 'hairy' }, \n" +
"         ], \n" +
"     }, \n" +
"     'circumcision': { \n" +
"         gender: 'male', \n" +
"         values: [ \n" +
"             { value: 'circumcised' }, \n" +
"             { value: 'uncircumcised' } \n" +
"         ], \n" +
"     }, \n" +
"     'sexual_orientation': { \n" +
"         values: [ \n" +
"             { value: 'straight' }, \n" +
"             { value: 'bi-curious' }, \n" +
"             { value: 'bisexual' }, \n" +
"             { value: 'reverse_bi-curious', gender: 'male', text: 'Male-leaning bi-curious ' }, \n" +
"             { value: 'reverse_bi-curious', gender: 'female', text: 'Female-leaning bi-curious' }, \n" +
"             { value: 'gay', gender: 'male' }, \n" +
"             { value: 'lesbian', gender: 'female' }, \n" +
"         ] \n" +
"     } \n" +
" }; \n" +
"  \n" +
"  \n" +
"  \n" +
"  \n" +
" </script> \n" ;

ssa=
" <script> \n" +
" DEFAULT_CLOTHING_OPTIONS.forEach(function (clothing) { \n" +
"     PLAYER_CLOTHING_OPTIONS[clothing.id] = clothing; \n" +
" }); \n" +
"  \n" +
" </script> \n" ;


ssa=
" <script> \n" +
" /************************************************************ \n" +
"  * Randomly selects two characters for the title images. \n" +
"  ************************************************************/ \n" +
" function selectTitleCandy() { \n" +
"     console.log('Selecting Candy...'); \n" +
"     var candy1 = CANDY_LIST[getRandomNumber(0, CANDY_LIST.length)]; \n" +
"     var candy2 = CANDY_LIST[getRandomNumber(0, CANDY_LIST.length)]; \n" +
"  \n" +
"  \n" +
"  \n" +
"     while (candy1.slice(0, candy1.lastIndexOf('/')) == candy2.slice(0, candy2.lastIndexOf('/'))) { \n" +
"         candy2 = CANDY_LIST[getRandomNumber(0, CANDY_LIST.length)]; \n" +
"     } \n" +
"  \n" +
"     $titleCandy[0].attr('src', 'opponents/' + candy1); \n" +
"     $titleCandy[1].attr('src', 'opponents/' + candy2); \n" +
" } \n" +
"  \n" +
" /************************************************************ \n" +
"  * Update the warning text to say how many items of clothing are being worn. \n" +
"  ************************************************************/ \n" +
" function updateClothingCount(){ \n" +
" 	/* the amount of clothing being worn */ \n" +
" 	var clothingCount = save.selectedClothing(); \n" +
"  \n" +
" 	$warningLabel.html(`Select from 0 to 8 articles. Wear whatever you want. (${clothingCount.length}/8)`); \n" +
" 	return; \n" +
" } \n" +
"  \n" +
" </script> \n" ;


ssa =
"  \n" +
"  \n" +
" <script> \n" +
" var playerTagSelections = {}; \n" +
"  \n" +
" // Order matters here. \n" +
" var DEFAULT_CLOTHING_OPTIONS = []; \n" +
"  \n" +
" var PLAYER_CLOTHING_OPTIONS = {}; \n" +
" DEFAULT_CLOTHING_OPTIONS.forEach(function (clothing) { \n" +
"     PLAYER_CLOTHING_OPTIONS[clothing.id] = clothing; \n" +
" }); \n" +
"  \n" +
" var titleClothingSelectors = []; \n" +
"  \n" +
"  /* Keep in sync with total number of calls to beginStartupStage */ \n" +
" var totalLoadStages = 6; \n" +
" var curLoadStage = -1; \n" +
"  \n" +
"  \n" +
"  \n" +
" function beginStartupStage (label) { \n" +
"     curLoadStage++; \n" +
"     $gameLoadLabel.text(label); \n" +
"     updateStartupStageProgress(0, 1); \n" +
" } \n" +
"  \n" +
" function updateStartupStageProgress (curItems, totalItems) { \n" +
"     /* \n" +
"      * Add the overall loading progress for all prior stages (curLoadStage / totalLoadStages) \n" +
"      * to a fraction of (1 / totalLoadStages). \n" +
"      * (1 / totalLoadStages) * (curItems / totalItems) == curItems / (totalItems * totalLoadStages) \n" +
"      */ \n" +
"     var progress = Math.floor(100 * ( \n" +
"         (curLoadStage / totalLoadStages) + \n" +
"         (curItems / (totalItems * totalLoadStages)) \n" +
"     )); \n" +
"     $gameLoadProgress.text(progress.toString(10)); \n" +
" } \n" +
"  \n" +
" function finishStartupLoading () { \n" +
"     $('#warning-start-container').removeAttr('hidden'); \n" +
"     $('#warning-load-container').hide(); \n" +
" } \n" +
"  \n" +
" /** \n" +
"  * @param {PlayerClothing} clothing \n" +
"  */ \n" +
" function TitleClothingSelectionIcon (clothing) { \n" +
"     this.clothing = clothing; \n" +
"     $(this.elem = clothing.createSelectionElement()) \n" +
"         .addClass('title-content-button').click(this.onClick.bind(this)) \n" +
"         .on('touchstart', function() { \n" +
"             $(this.elem).tooltip('show'); \n" +
"         }.bind(this)).tooltip({ \n" +
"             delay: 50, \n" +
"             title: function() { return clothing.tooltip(); } \n" +
"         }); \n" +
" } \n" +
"  \n" +
" TitleClothingSelectionIcon.prototype.visible = function () { \n" +
"     if (this.clothing.isAvailable()) { \n" +
"         return true; \n" +
"     } \n" +
"  \n" +
"     if (this.clothing.applicable_genders !== 'all' && humanPlayer.gender !== this.clothing.applicable_genders) { \n" +
"         return false; \n" +
"     } \n" +
"  \n" +
"     if (this.clothing.collectible) { \n" +
"         return !this.clothing.collectible.hidden; \n" +
"     } \n" +
"  \n" +
"     return false; \n" +
" } \n" +
"  \n" +
" TitleClothingSelectionIcon.prototype.update = function () { \n" +
"     $(this.elem).removeClass('locked selected'); \n" +
"     if (!this.clothing.isAvailable()) { \n" +
"         $(this.elem).addClass('locked'); \n" +
"     } \n" +
"     if (this.clothing.isSelected()) { \n" +
"         $(this.elem).addClass('selected'); \n" +
"     } \n" +
" } \n" +
"  \n" +
" TitleClothingSelectionIcon.prototype.onClick = function () { \n" +
"     if (this.clothing.isAvailable()) { \n" +
"         this.clothing.setSelected(!this.clothing.isSelected()); \n" +
"         this.update(); \n" +
"         updateClothingCount(); \n" +
"     } \n" +
" } \n" +
"  \n" +
" function setupTitleClothing () { \n" +
"     var prevScroll = 0; \n" +
"     $('#title-clothing-container').on('scroll', function() { \n" +
"         if (Math.abs(this.scrollTop - prevScroll) > this.clientHeight / 4) { \n" +
"             $('#title-clothing-container .player-clothing-select').tooltip('hide'); \n" +
"             prevScroll = this.scrollTop; \n" +
"         } \n" +
"     }).on('show.bs.tooltip', function(ev) { \n" +
"         $('#title-clothing-container .player-clothing-select').not(ev.target).tooltip('hide'); \n" +
"         prevScroll = this.scrollTop; \n" +
"     }); \n" +
"  \n" +
"     loadedOpponents.forEach(function (opp) { \n" +
"         if (!opp.has_collectibles || !opp.collectibles) return; \n" +
"  \n" +
"         opp.collectibles.forEach(function (collectible) { \n" +
"             var clothing = collectible.clothing; \n" +
"             if ( \n" +
"                 (!clothing || !PLAYER_CLOTHING_OPTIONS[clothing.id]) || \n" +
"                 (collectible.status && !includedOpponentStatuses[collectible.status]) \n" +
"             ) { \n" +
"                 return; \n" +
"             } \n" +
"  \n" +
"             var selector = new TitleClothingSelectionIcon(clothing); \n" +
"             titleClothingSelectors.push(selector); \n" +
"         }); \n" +
"     }); \n" +
"  \n" +
"     DEFAULT_CLOTHING_OPTIONS.forEach(function (clothing) { \n" +
"         var selector = new TitleClothingSelectionIcon(clothing); \n" +
"         titleClothingSelectors.push(selector); \n" +
"     }); \n" +
"  \n" +
"     updateClothingCount(); \n" +
" } \n" +
"  \n" +
" /********************************************************************** \n" +
"  *****                   Interaction Functions                    ***** \n" +
"  **********************************************************************/ \n" +
"  \n" +
" /************************************************************ \n" +
"  * The player clicked on one of the gender icons on the title \n" +
"  * screen, or this was called by an internal source. \n" +
"  ************************************************************/ \n" +
" function changePlayerGender (gender) { \n" +
"     save.savePlayer(); \n" +
"     humanPlayer.gender = gender; \n" +
"     save.loadPlayer(); \n" +
"     updateTitleScreen(); \n" +
"     updateSelectionVisuals(); // To update epilogue availability status \n" +
" } \n" +
"  \n" +
" $('.title-gender-button').on('click', function(ev) { \n" +
"     changePlayerGender($(ev.target).data('gender')); \n" +
" }); \n" +
"  \n" +
" function createClothingSeparator () { \n" +
"     var separator = document.createElement('hr'); \n" +
"     separator.className = 'clothing-separator'; \n" +
"     return separator; \n" +
" } \n" +
"  \n" +
" /************************************************************ \n" +
"  * Updates the gender dependent controls on the title screen. \n" +
"  ************************************************************/ \n" +
" function updateTitleScreen () { \n" +
"     $titleContainer.removeClass('male female').addClass(humanPlayer.gender); \n" +
"     $playerTagsModal.removeClass('male female').addClass(humanPlayer.gender); \n" +
"     $('.title-gender-button').each(function() { \n" +
"         $(this).toggleClass('selected', $(this).data('gender') == humanPlayer.gender); \n" +
"     }); \n" +
"  \n" +
"     var availableSelectors = []; \n" +
"     var defaultSelectors = []; \n" +
"     var lockedSelectors = []; \n" +
"  \n" +
"     titleClothingSelectors.forEach(function (selector) { \n" +
"         var clothing = selector.clothing; \n" +
"         $(selector.elem).detach(); \n" +
"  \n" +
"         if (!selector.visible()) { \n" +
"             return; \n" +
"         } \n" +
"  \n" +
"         if (selector.clothing.collectible) { \n" +
"             if (selector.clothing.isAvailable()) { \n" +
"                 availableSelectors.push(selector); \n" +
"             } else { \n" +
"                 lockedSelectors.push(selector); \n" +
"             } \n" +
"         } else { \n" +
"             defaultSelectors.push(selector); \n" +
"         } \n" +
"  \n" +
"         selector.update(); \n" +
"     }); \n" +
"  \n" +
"     $('#title-clothing-container').empty(); \n" +
"  \n" +
"     if (availableSelectors.length > 0) { \n" +
"         $('#title-clothing-container').append(availableSelectors.map(function (s) { \n" +
"             return s.elem; \n" +
"         })).append(createClothingSeparator()); \n" +
"     } \n" +
"  \n" +
"     $('#title-clothing-container').append(defaultSelectors.map(function (s) { \n" +
"         return s.elem; \n" +
"     })); \n" +
"  \n" +
"     if (lockedSelectors.length > 0) { \n" +
"         $('#title-clothing-container').append(createClothingSeparator()).append( \n" +
"             lockedSelectors.map(function (s) { \n" +
"                 return s.elem; \n" +
"             }) \n" +
"         ); \n" +
"     } \n" +
"     updateClothingCount(); \n" +
" } \n" +
"  \n" +
" /************************************************************ \n" +
"  * The player clicked on one of the size icons on the title \n" +
"  * screen, or this was called by an internal source. \n" +
"  ************************************************************/ \n" +
" function changePlayerSize (size) { \n" +
"     humanPlayer.size = size; \n" +
"     $sizeBlocks[humanPlayer.gender].find('.title-size-button').each(function() { \n" +
"         $(this).toggleClass('selected', $(this).data('size') == size); \n" +
"     }); \n" +
" } \n" +
"  \n" +
" $('.title-size-block').on('click', '.title-size-button', function(ev) { \n" +
"     changePlayerSize($(ev.target).data('size')); \n" +
" }); \n" +
"  \n" +
" /************************************************************** \n" +
"  * Add tags to the human player based on the selections in the tag \n" +
"  * dialog and the size. \n" +
"  **************************************************************/ \n" +
" function setPlayerTags () { \n" +
"     var playerTagList = ['human', 'human_' + humanPlayer.gender, \n" +
"                          humanPlayer.size + (humanPlayer.gender == 'male' ? '_penis' : '_breasts')]; \n" +
"  \n" +
"     for (category in playerTagSelections) { \n" +
"         var sel = playerTagSelections[category]; \n" +
"         if (!(category in playerTagOptions)) continue; \n" +
"         playerTagOptions[category].values.some(function (choice) { \n" +
"             if (playerTagOptions[category].type == 'range') { \n" +
"                 if (sel > choice.to) return false; \n" +
"             } else { \n" +
"                 if (sel != choice.value) return false; \n" +
"             } \n" +
"             playerTagList.push(choice.value); \n" +
"             return true; \n" +
"         }); \n" +
"     } \n" +
"     /* applies tags to the player*/ \n" +
"     console.log(playerTagList); \n" +
"     humanPlayer.baseTags = playerTagList.map(canonicalizeTag); \n" +
"     humanPlayer.updateTags(); \n" +
" } \n" +
"  \n" +
" /************************************************************ \n" +
"  * The player clicked on the advance button on the title \n" +
"  * screen. \n" +
"  ************************************************************/ \n" +
" function validateTitleScreen () { \n" +
"     /* determine the player's name */ \n" +
"     var playerName = ''; \n" +
"  \n" +
"     if ($nameField.val() != '') { \n" +
"         playerName = $nameField.val(); \n" +
"     } else if (humanPlayer.gender == 'male') { \n" +
"         playerName = 'Mister'; \n" +
"     } else if (humanPlayer.gender == 'female') { \n" +
"         playerName = 'Miss'; \n" +
"     } \n" +
"  \n" +
"     humanPlayer.first = playerName; \n" +
"     humanPlayer.label = playerName; \n" +
"  \n" +
"     $gameLabels[HUMAN_PLAYER].text(humanPlayer.label); \n" +
"  \n" +
"     /* count clothing */ \n" +
"     var clothingItems = save.selectedClothing(); \n" +
"     console.log(clothingItems.length); \n" +
"  \n" +
"     /* ensure the player is wearing enough clothing */ \n" +
"     if (clothingItems.length > 8) { \n" +
"         $warningLabel.html('You cannot wear more than 8 articles of clothing. Cheater.'); \n" +
"         return; \n" +
"     } \n" +
"  \n" +
"     /* dress the player */ \n" +
"     wearClothing(); \n" +
"     setPlayerTags(); \n" +
"  \n" +
"     save.savePlayer(); \n" +
"     console.log(players[0]); \n" +
"  \n" +
"     setLocalDayOrNight(); \n" +
"     updateAllBehaviours(null, null, SELECTED); \n" +
"     updateSelectionVisuals(); \n" +
"  \n" +
"     Sentry.setTag('screen', 'select-main'); \n" +
"     screenTransition($titleScreen, $selectScreen); \n" +
"  \n" +
"     updateAnnouncementDropdown(); \n" +
"     showAnnouncements(); \n" +
"  \n" +
"     if (curResortEvent && !curResortEvent.resort.checkCharacterThreshold()) { \n" +
"         curResortEvent.resort.setFlag(false); \n" +
"     } \n" +
" } \n" +
"  \n" +
" /********************************************************************** \n" +
"  *****                    Additional Functions                    ***** \n" +
"  **********************************************************************/ \n" +
"  \n" +
" /************************************************************ \n" +
"  * Takes all of the clothing selected by the player and adds it, \n" +
"  * in a particular order, to the list of clothing they are wearing. \n" +
"  ************************************************************/ \n" +
" function wearClothing () { \n" +
"     var position = [[], [], []]; \n" +
"     var typeIdx = { \n" +
"         'important': 0, \n" +
"         'major': 1, \n" +
"         'minor': 2, \n" +
"         'extra': 3, \n" +
"     }; \n" +
"  \n" +
"     save.selectedClothing().sort(function (a, b) { \n" +
"         return typeIdx[a.type] - typeIdx[b.type]; \n" +
"     }).forEach(function (clothing) { \n" +
"         if (clothing.position == UPPER_ARTICLE) { \n" +
"             position[0].push(clothing); \n" +
"         } else if (clothing.position == LOWER_ARTICLE) { \n" +
"             position[1].push(clothing); \n" +
"         } else { \n" +
"             position[2].push(clothing); \n" +
"         } \n" +
"     }); \n" +
"  \n" +
"     /* clear player clothing array */ \n" +
"     humanPlayer.clothing = []; \n" +
"  \n" +
"     /* wear the clothing is sorted order */ \n" +
"     for (var i = 0; i < position[0].length || i < position[1].length; i++) { \n" +
"         /* wear a lower article, if any remain */ \n" +
"         if (i < position[1].length) { \n" +
"             humanPlayer.clothing.push(position[1][i]); \n" +
"         } \n" +
"  \n" +
"         /* wear an upper article, if any remain */ \n" +
"         if (i < position[0].length) { \n" +
"             humanPlayer.clothing.push(position[0][i]); \n" +
"         } \n" +
"     } \n" +
"  \n" +
"     /* wear any other clothing */ \n" +
"     for (var i = 0; i < position[2].length; i++) { \n" +
"         humanPlayer.clothing.push(position[2][i]); \n" +
"     } \n" +
"  \n" +
"     humanPlayer.initClothingStatus(); \n" +
"  \n" +
"     /* update the visuals */ \n" +
"     displayHumanPlayerClothing(); \n" +
" } \n" +
"  \n" +
"  \n" +
" /************************************************************ \n" +
"  * Randomly selects two characters for the title images. \n" +
"  ************************************************************/ \n" +
" function selectTitleCandy() { \n" +
"     console.log('Selecting Candy...'); \n" +
"     var candy1 = CANDY_LIST[getRandomNumber(0, CANDY_LIST.length)]; \n" +
"     var candy2 = CANDY_LIST[getRandomNumber(0, CANDY_LIST.length)]; \n" +
"  \n" +
"  \n" +
"  \n" +
"     while (candy1.slice(0, candy1.lastIndexOf('/')) == candy2.slice(0, candy2.lastIndexOf('/'))) { \n" +
"         candy2 = CANDY_LIST[getRandomNumber(0, CANDY_LIST.length)]; \n" +
"     } \n" +
"  \n" +
"     $titleCandy[0].attr('src', 'opponents/' + candy1); \n" +
"     $titleCandy[1].attr('src', 'opponents/' + candy2); \n" +
" } \n" +
"  \n" +
" /************************************************************ \n" +
"  * Update the warning text to say how many items of clothing are being worn. \n" +
"  ************************************************************/ \n" +
" function updateClothingCount(){ \n" +
" 	/* the amount of clothing being worn */ \n" +
" 	var clothingCount = save.selectedClothing(); \n" +
"  \n" +
" 	$warningLabel.html(`Select from 0 to 8 articles. Wear whatever you want. (${clothingCount.length}/8)`); \n" +
" 	return; \n" +
" } \n" +
"  \n" +
" </script> \n" ;




































