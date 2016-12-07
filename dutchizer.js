var translations = {
    'woman' : 'vrouw',
    'man' : 'man',
};

var engine = {
    lastEngishWord: '',
    isCorrectTranslation: function ( english, dutch ) {
        return translations[english] == dutch;
    },
    pickAnEnglishWord: function () {
        var englishWords = Object.keys(translations);
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

$( document ).ready( function() {
    var $LBL_englishWord = $('#english_word');
    var $TXT_dutchWord = $('#dutch_word');
    var $LBL_result = $('#result');

    var englishWord = engine.pickAnEnglishWord();
    $LBL_englishWord.text( englishWord );
    
    $TXT_dutchWord.on('keyup', function(event) {
        if (event.keyCode == 13) {
            if ( engine.isCorrectTranslation( englishWord, this.value ) ) {
                $LBL_result.text('correct');
                setTimeout(
                    function() {
                        englishWord = engine.pickAnEnglishWord();
                        $LBL_englishWord.text( englishWord );
                        $TXT_dutchWord.val('');
                    }, 1000
                );
            } else {
                $LBL_result.text('try again');
            };
        };
    });
});