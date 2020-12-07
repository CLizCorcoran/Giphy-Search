// DOM is ready function
$(function () {

    var currentCategory = 0;

    collectTrendingGifs();

    $('#category').change(function () {
        var jSelect = $(this);

        var index = jSelect.val();
        
        if (index === currentCategory)
            return;

        // Trending uses a slightly different API from search
        if (index == 0)
            collectTrendingGifs();

        // If not trending, then search
        else {
            var jItem = jSelect.children().get(index);

            collectSearchGifs(jItem.text);
        }
     
 
    })

    // Collects and displays the trending gifs.
    function collectTrendingGifs() {

        $.get(
            'https://api.giphy.com/v1/gifs/trending?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&limit=25&rating=g', // The URL to call
            (data) => {
                // Empty the current collection
                $('#gif-gallery').empty();

                // The data parameter contains the string
                $(data.data).each(function (index, element) {
                    var url = element.images.fixed_width.url;
                    var altText = element.title;
                    var image =
                        $('#gif-gallery').append(`<img src="${url}" alt="${altText}" />`);
                })
            }
        );
    };

    // Collects and displays gifs returned by the search string.  
    function collectSearchGifs(strSearch) {
        var url = 'https://api.giphy.com/v1/gifs/search?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&q=' + strSearch + '&limit=25&offset=0&rating=g&lang=en';
        $.get(
            url,
            (data) => {
                // Empty the current collection
                $('#gif-gallery').empty();

                // The data parameter contains the string
                $(data.data).each(function (index, element) {
                    var url = element.images.fixed_width.url;
                    var altText = element.title;
                    var image =
                        $('#gif-gallery').append(`<img src="${url}" alt="${altText}" />`);
                })
            }
        );
    };


})