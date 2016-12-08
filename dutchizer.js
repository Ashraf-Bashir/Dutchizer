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

$( document ).ready( function() {
    var $LBL_englishWord = $('#english_word');
    var $TXT_dutchWord = $('#dutch_word');
    var $LBL_result = $('#result');
    var $FILE_dictionary = $('#dictionary_file');
    var $DIV_translate = $('#translate_div');

    $FILE_dictionary[0].addEventListener('change', function(event) {
        dictionary.parseFile(
            $FILE_dictionary[0].files[0],
            function() {
                $LBL_englishWord.text( engine.pickAnEnglishWord() );
                $DIV_translate.show();
            }
        );
    });

    $TXT_dutchWord.on('keyup', function(event) {
        if (event.keyCode == 13) {
            if ( engine.isCorrectTranslation( $LBL_englishWord.text(), this.value ) ) {
                $LBL_result.text('correct');
                setTimeout(
                    function() {
                        $LBL_englishWord.text( engine.pickAnEnglishWord() );
                        $TXT_dutchWord.val('');
                        $LBL_result.text('');
                    }, 1000
                );
            } else {
                $LBL_result.text(
                    "solution is: '"
                    + dictionary.translations[$LBL_englishWord.text()]
                    + "', Type it please!"
                );
                setTimeout(
                    function() {
                        $LBL_result.text('');
                    }, 2000
                );
            };
        };
    });
});
