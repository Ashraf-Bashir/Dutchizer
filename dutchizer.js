var engine = {
    lastEngishWord: '',

    blocksIndices: [0],
    blockSize: 5,
    blockRepitions: 5,

    _wordsCount: 0,
    _activeEnglishWords: [],

    isCorrectTranslation: function ( english, dutch ) {
        return dictionary.translations[english] == dutch;
    },

    getWordsCount: function () {
        return this._activeEnglishWords.length;
    },

    pickAnEnglishWord: function () {
        var englishWords = this._getEnglishWords();
        var randomIndex = Math.floor(Math.random() * (englishWords.length-0) );
        var englishWord = englishWords[randomIndex];
        if ( englishWord != this.lastEngishWord ) {
            this.lastEngishWord = englishWord;
            return englishWord;
        }
        else
            return this.pickAnEnglishWord();
    },

    _getEnglishWords: function () {
        var englishWords = [];
        for ( var i = 0; i < this.blocksIndices.length ; i++ ) {
            var blockIndex = this.blocksIndices[i];
            var startIndex = blockIndex * this.blockSize;
            var endIndex = startIndex + this.blockSize - 1;
            if ( endIndex > Object.keys(dictionary.translations).length - 1 )
                endIndex = Object.keys(dictionary.translations).length - 1;
            englishWords = englishWords.concat(
                Object.keys(dictionary.translations).slice( startIndex, endIndex + 1 )
            );
        }
        this._activeEnglishWords = englishWords;
        return this._activeEnglishWords;
    },
};

var dictionary = {
    translations: {},

    parseFile: function(file, onsuccess) {
        this._clearTranslations();
        var reader = new FileReader();
        var self = this;
        reader.onload = function(event) {
            self._constructTranslations(reader.result);
            onsuccess();
        }
        reader.readAsText(file);
    },

    _constructTranslations: function(fileContent) {
        var lines = fileContent.split("\n");
        for ( var i = 0; i < lines.length; i++ ) {
            var line = lines[i];
            var words = line.split("\t");
            var englishWord = words[0].trim();
            var dutchWord   = words[1].trim();
            this.translations[englishWord] = dutchWord;
        }
    },

    _clearTranslations: function() {
        this.translations = {};
    },

};

var utils = {
    removeItem: function (arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    },
};

var textToSpeech = {
    _speechSynthesisUtterance: undefined,
    _language_code: 'nl-NL',

    init: function () {
        var self = this;
        this._speechSynthesisUtterance = new SpeechSynthesisUtterance();
        window.speechSynthesis.onvoiceschanged = function() {
            self._setLanguage();
        };
    },

    _setLanguage: function() {
        var self = this;
        this._speechSynthesisUtterance.voice = window.speechSynthesis.getVoices().filter(
            function(voice) {
                return voice.lang == self._language_code;
            }
        )[0];
    },

    speak: function(text) {
        this._speechSynthesisUtterance.text = text;
        window.speechSynthesis.speak(this._speechSynthesisUtterance);
    }
};

var progressBar = {
    _container: undefined,
    _bar: undefined,
    _label: undefined,
    _steps: 100,
    _stepPercentage: 1,
    _currentPercentage: 0,
    init: function (steps) {
        this._container = $('#progress')[0];
        this._bar = $('#bar')[0];
        this._label = $('#progress_label')[0];
        this.reset(steps);
    },
    show: function () {
        $(this._container).show();
    },
    move: function () {
        this._currentPercentage = this._currentPercentage + this._stepPercentage;
        if ( this._currentPercentage > 100 )
            this._currentPercentage = 100;
        this._redraw();
    },
    _initStepPercentage: function () {
        this._stepPercentage = 100 / this._steps;
    },
    reset: function (steps) {
        if (steps) {
            this._steps = steps;
            this._initStepPercentage();
        }
        this._currentPercentage = 0;
        this._redraw();
    },
    _redraw: function() {
        this._bar.style.width = parseInt(this._currentPercentage)  + '%';
        this._label.innerHTML = this._currentPercentage.toFixed(2) + '%';
    },
};

var uiHandler = {

    init: function() {
        this._initFields();
        this._bindActions();
    },

    _initFields: function() {
        this.$LBL_englishWord     = $('#english_word');
        this.$TXT_dutchWord       = $('#dutch_word');
        this.$LBL_correctAnswer   = $('#correct_answer');
        this.$FILE_dictionary     = $('#dictionary_file');
        this.$DIV_translate       = $('#translate_div');
        this.$TXT_blockSize       = $('#block_size');
        this.$TXT_blockRepitions  = $('#block_repititions');
        this.$DIV_blocksSelection = $('#blocks_selection_div');
        this.$DIV_blocksSize      = $('#block_size_div');
        this.$DIV_blockRepitions  = $('#block_repititions_div');
        this.$BTN_start           = $('#start');
        this.$IMG_resultIcon      = $('#result_icon');
    },

    _showCorrectIcon: function() {
        this.$IMG_resultIcon.attr('src', 'Images/correct.png');
        this.$IMG_resultIcon.show();
    },

    _showWrongIcon: function() {
        this.$IMG_resultIcon.attr('src', 'Images/wrong.png');
        this.$IMG_resultIcon.show();
    },

    _bindActions: function() {
        var self = this;

        this.$FILE_dictionary[0].addEventListener('change', function(event) {
            dictionary.parseFile(
                self.$FILE_dictionary[0].files[0],
                function() {
                    self._renderBlocksSelectionDiv();
                    self.$DIV_blocksSize.show();
                    self.$DIV_blocksSelection.show();
                    self.$DIV_blockRepitions.show();
                    self.$BTN_start.show();
                }
            );
        });

        this.$TXT_dutchWord.on('keyup', function(event) {
            if (event.keyCode == 13) {
                if ( engine.isCorrectTranslation( self.$LBL_englishWord.text(), this.value.trim() ) ) {
                    self.$LBL_correctAnswer.text('');
                    self._showCorrectIcon();
                    progressBar.move();
                    textToSpeech.speak(this.value.trim());
                    setTimeout(
                        function() {
                            self.$LBL_englishWord.text( engine.pickAnEnglishWord() );
                            self.$TXT_dutchWord.val('');
                            self.$LBL_correctAnswer.text('');
                            self.$IMG_resultIcon.hide();
                        }, 1000
                    );
                } else {
                    self._showWrongIcon();
                    var correctAnswer = dictionary.translations[self.$LBL_englishWord.text()];
                    self.$LBL_correctAnswer.text( correctAnswer );
                    textToSpeech.speak( correctAnswer );
                    setTimeout(
                        function() {
                            self.$LBL_correctAnswer.text('');
                            self.$IMG_resultIcon.hide();
                        }, 2000
                    );
                };
            };
        });

        this.$TXT_blockSize.on('change', function(event){
            self._renderBlocksSelectionDiv();
            engine.blockSize = parseInt( self.$TXT_blockSize.val() );
        });

        this.$TXT_blockRepitions.on('change', function(event) {
            engine.blockRepitions = parseInt( self.$TXT_blockRepitions.val() );
        });

        this.$BTN_start.on('click', function(event) {
            self._startAsking();
            progressBar.init( engine.getWordsCount() * engine.blockRepitions );
            progressBar.show();
        });

        $('body').on('change', 'input[type="checkbox"]', function() {
            if ( this.checked ) {
                engine.blocksIndices.push( parseInt( this.id.replace('block_', '') ) );
            } else {
                utils.removeItem(
                    engine.blocksIndices,
                    parseInt( this.id.replace('block_', '') )
                );
            }
        });
    },

    _startAsking: function() {
        this.$LBL_englishWord.text( engine.pickAnEnglishWord() );
        this.$DIV_translate.show();
    },

    _renderBlocksSelectionDiv: function() {
        this.$DIV_blocksSelection.html("");
        var blockCount = Math.ceil( Object.keys(dictionary.translations).length / this.$TXT_blockSize.val() ); 
        for ( var i = 0; i < blockCount; i++ ) {
            if ( i != 0 && i % 5 == 0 )
                $('<br />').appendTo(this.$DIV_blocksSelection[0]);
            $('<input />', { type: 'checkbox', id: 'block_' + i, value: '' }).appendTo(this.$DIV_blocksSelection[0]);
            $('<label />', { 'for': 'block_' + i, text: 'Block ' + (i+1), 'style': "padding-right: 20px;" }).appendTo(this.$DIV_blocksSelection[0]);
        }
        $('#block_0').prop( "checked", true );
    },

};

$( document ).ready( function() {
    textToSpeech.init();
    uiHandler.init();
});
