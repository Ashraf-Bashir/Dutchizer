var engine = {
    lastEngishWord: '',

    isCorrectTranslation: function ( english, dutch ) {
        return dictionary.translations[english] == dutch;
    },

    pickAnEnglishWord: function () {
        var englishWords = Object.keys(dictionary.translations);
        var randomIndex = Math.floor(Math.random() * (englishWords.length-0) );
        var englishWord = englishWords[randomIndex];
        if ( englishWord != this.lastEngishWord ) {
            this.lastEngishWord = englishWord;
            return englishWord;
        }
        else
            return this.pickAnEnglishWord();
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

var uiHandler = {

    init: function() {
        this._initFields();
        this._bindActions();
    },

    _initFields: function() {
        this.$LBL_englishWord     = $('#english_word');
        this.$TXT_dutchWord       = $('#dutch_word');
        this.$LBL_result          = $('#result');
        this.$FILE_dictionary     = $('#dictionary_file');
        this.$DIV_translate       = $('#translate_div');
        this.$TXT_blockSize       = $('#block_size');
        this.$TXT_blockRepitions  = $('#block_repititions');
        this.$DIV_blocksSelection = $('#blocks_selection_div');
        this.$DIV_blocksSize      = $('#block_size_div');
        this.$DIV_blockRepitions  = $('#block_repititions_div');
        this.$BTN_start           = $('#start');
    },

    _bindActions: function() {
        var self = this;

        this.$FILE_dictionary[0].addEventListener('change', function(event) {
            dictionary.parseFile(
                self.$FILE_dictionary[0].files[0],
                function() {
                    self.$LBL_englishWord.text( engine.pickAnEnglishWord() );
                    self.$DIV_blocksSize.show();
                }
            );
        });

        this.$TXT_dutchWord.on('keyup', function(event) {
            if (event.keyCode == 13) {
                if ( engine.isCorrectTranslation( self.$LBL_englishWord.text(), this.value.trim() ) ) {
                    self.$LBL_result.text('correct');
                    setTimeout(
                        function() {
                            self.$LBL_englishWord.text( engine.pickAnEnglishWord() );
                            self.$TXT_dutchWord.val('');
                            self.$LBL_result.text('');
                        }, 1000
                    );
                } else {
                    self.$LBL_result.text(
                        "solution is: '"
                        + dictionary.translations[self.$LBL_englishWord.text()]
                        + "', Type it please!"
                    );
                    setTimeout(
                        function() {
                            self.$LBL_result.text('');
                        }, 2000
                    );
                };
            };
        });

        this.$TXT_blockSize.on('change', function(event){
            self._renderBlocksSelectionDiv();
            self.$DIV_blocksSelection.show();
            self.$DIV_blockRepitions.show();
        });

        this.$TXT_blockRepitions.on('change', function(event) {
            self.$BTN_start.show();
        });

        this.$BTN_start.on('click', function(event) {
            self.$DIV_translate.show();
        });
    },

    _renderBlocksSelectionDiv: function() {
        this.$DIV_blocksSelection.html("");
        var blockCount = Math.ceil( Object.keys(dictionary.translations).length / this.$TXT_blockSize.val() ); 
        for ( var i = 0; i < blockCount; i++ ) {
            $('<input />', { type: 'checkbox', id: 'block_' + i, value: '' }).appendTo(this.$DIV_blocksSelection[0]);
            $('<label />', { 'for': 'block_' + i, text: 'Block ' + (i+1), 'style': "padding-right: 20px;" }).appendTo(this.$DIV_blocksSelection[0]);
        }
    },

};

$( document ).ready( function() {
    uiHandler.init();
});
