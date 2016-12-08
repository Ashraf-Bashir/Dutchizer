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
    }
};

var uiHandler = {
    $LBL_englishWord : undefined,
    $TXT_dutchWord   : undefined,
    $LBL_result      : undefined,
    $FILE_dictionary : undefined,
    $DIV_translate   : undefined,

    init: function() {
        this._initFields();
        this._bindActions();
    },

    _initFields: function() {
        this.$LBL_englishWord = $('#english_word');
        this.$TXT_dutchWord   = $('#dutch_word');
        this.$LBL_result      = $('#result');
        this.$FILE_dictionary = $('#dictionary_file');
        this.$DIV_translate   = $('#translate_div');
    },

    _bindActions: function() {
        var self = this;

        this.$FILE_dictionary[0].addEventListener('change', function(event) {
            dictionary.parseFile(
                self.$FILE_dictionary[0].files[0],
                function() {
                    self.$LBL_englishWord.text( engine.pickAnEnglishWord() );
                    self.$DIV_translate.show();
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
    }
};

$( document ).ready( function() {
    uiHandler.init();
});
