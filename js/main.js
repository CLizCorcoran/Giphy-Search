// DOM is ready function
$(function () {

    var currentCategory = 0;
    var currentSearch = '';
    var loadingOffset = 0;
    var loadingLimit = 25;  // Currently this is unchanged.  May add to an option at some point.  

    var heart = '<div class="overlay"><img class="far fa-heart /></div>';

    collectCategories();

    collectTrendingGifs();

    $('#category').change(function () {
        var jSelect = $(this);

        var index = jSelect.val();
        
        if (index === currentCategory)
            return;

        // keep track of the current category and reset loaded offset.  
        currentCategory = index;
        loadingOffset = 0;

        // Empty the current collection
        $('#gif-gallery').empty();

        // Trending uses a slightly different API from search
        if (index == 0)
            collectTrendingGifs();

        // If not trending, then search
        else {
            var jItem = jSelect.children().get(index);
            currentSearch = jItem.text;
            collectSearchGifs(currentSearch);
        }
    })

    
    $('#gif-gallery').on('click', "button", function() {
        if (currentCategory == 0)
            collectTrendingGifs(loadingOffset);
        else
            collectSearchGifs(currentSearch, loadingOffset);
    })

    // Collects and displays the trending gifs.
    function collectTrendingGifs(offset = 0) {
        var url = 'https://api.giphy.com/v1/gifs/trending?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&limit=' + loadingLimit + '&offset=' + loadingOffset + '&rating=g';
        $.get(
            url,
            (data) => {

               // Remove the button should it exist.  
               removeLoadMoreButton();

                // The data parameter contains the string
                $(data.data).each(function (index, element) {
                    var url = element.images.fixed_width.url;
                    var altText = element.title;
                    $('#gif-gallery').append(`<img src="${url}" alt="${altText}" />`);
                })
 
                addLoadMoreButton();

                loadingOffset += data.pagination.count;
            }
        );
    };

    // Collects and displays gifs returned by the search string.  
    function collectSearchGifs(strSearch, offset = 0) {
        var url = 'https://api.giphy.com/v1/gifs/search?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&q=' + strSearch + '&limit=' + loadingLimit + '&offset=' + loadingOffset + '&rating=g&lang=en';
        $.get(
            url,
            (data) => {
                
                // Remove the button should it exist.  
                removeLoadMoreButton();

                // The data parameter contains the string
                $(data.data).each(function (index, element) {
                    var url = element.images.fixed_width.url;
                    var altText = element.title;
                    $('#gif-gallery').append(`<img src="${url}" alt="${altText}"/>`);
                })

                addLoadMoreButton();

                loadingOffset += data.pagination.count;
            }
        );
    };


    function collectCategories() {
        $.get(
            'https://api.giphy.com/v1/gifs/categories?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&q=',
            (data) => {
                
                var text = 'hello world';
 
            }
        );
    }

 
    function removeLoadMoreButton() {
        $('#more').remove();
    }

    function addLoadMoreButton() {
        $('#gif-gallery').append('<button type="button" id="more" class="btn btn-Primary hoverable">Load More...</button>');
    }


})