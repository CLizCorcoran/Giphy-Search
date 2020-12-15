// DOM is ready function
$(function () {

    var categoryInfo = null;
    var categoryBreadcrumb = [];
    var currentCategory = 0;
    var currentSearch = '';
    var loadingOffset = 0;
    var loadingLimit = 25;  // Currently this is unchanged.  May add to an option at some point.  

    var layoutInfo = {
        heights: [0, 0, 0, 0],
        heightAverage: 0,
        colIdx: 0
    }
    let average = (array) => array.reduce((a, b) => a + b) / array.length;

    /* far - outline heart; fas - solid heart */
    var heart = '<div class="overlay"><i class="far fa-heart"/></div>';
    var air = '<i class="fas fa-air-freshener fresh"></i>';

    initGallery();
    collectTrendingGifs();

    collectTrendingSearches();

    //----
    // Search Gifs using the search criteria from the search input.  
    //----
    $('#text-search').change(function () {
        var jEdit = $(this);

        var strSearch = jEdit.val().trim();
        if (strSearch.length > 0) {
            $('#page-title')[0].innerText = "Search Results:  " + strSearch;
            searchGifs(strSearch);
        }
    });

    //----
    // Search Gifs using the search criteria from the search input.
    //----
    $('#btn-search').click(function () {
        var jEdit = $('#text-search');

        var strSearch = jEdit.val().trim();
        if (strSearch.length > 0) {
            $('#page-title')[0].innerText = "Search Results:  " + strSearch;
            searchGifs(strSearch);
        }
    });

    $('#categories').click(function() {
        // Reset variables and current collections.  
        initGallery(); 
        $('#text-search')[0].value = '';
        $('#page-title')[0].innerText = "Categories";

        collectCategories();
    })

    $('#trending').click(function () {
        // Reset variables and current collections.  
         initGallery(); 
         $('#text-search')[0].value = '';
         $('#page-title')[0].innerText = "Trending";

        collectTrendingGifs();
    });

    $('#trending-searches-dropdown').on('click', '.mnu-search', function () {
        //-- Note exactly clear why this comes back as an array.  I thought this would be the button.  
        var jBtn = $(this)[0];
        $('#page-title')[0].innerText = "Search Results:  " + jBtn.innerText;

        searchGifs(jBtn.innerText);
    });

    $('#gif-gallery').on('click', '#div-cat', function() {
        
    });


    //----
    // Category dropdown - this should go away
    //----
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
    });

    //----
    // The 'more' button was clicked.  This might be best with an id.  
    //----
    $('#gif-gallery').on('click', "button", function () {
        if (currentCategory == 0)
            collectTrendingGifs(loadingOffset);
        else
            collectSearchGifs(currentSearch, loadingOffset);
    });





    //----
    // When the user mouses into the image, show the overlays (heart, copy link)
    //----
    $('#gif-gallery').on('mouseenter', '.div-gif', function () {
        var jDiv = $(this);

        var jOverlay = jDiv.find('.overlay');

        jOverlay.css('opacity', '1');
    });

    //----
    // When the user leaves the image, remove the overlay.  
    //----
    $('#gif-gallery').on('mouseleave', '.div-gif', function () {
        var jDiv = $(this);

        var jOverlay = jDiv.find('.overlay');

        jOverlay.css('opacity', '0');
    });


    //----
    // User action:  clicking on a heart to 'love' a gif. 
    //---- 
    $('#gif-gallery').on('click', '.far.fa-heart', function () {
        var jImage = $(this);

        jImage.removeClass('far');
        jImage.addClass('fas loved');

        // Now we need to move the heart out of the overlay div and on top of the image.
        var jGifDiv = jImage.parents('.div-gif');
        var jHeart = jImage.find('.fresh');
        jHeart.show();

    });


    //----
    // User action:  clicking a 'loved' heart to unlove the gif. 
    //----
    $('#gif-gallery').on('click', '.fas.fa-heart', function () {
        var jImage = $(this);

        jImage.removeClass('fas loved');
        jImage.addClass('far');
    });

    //----
    // Search gifs using the supplied search string
    function searchGifs(strSearch) {

        // Reset variables and current collections.  
        initGallery(); 

        collectSearchGifs(strSearch);
    }

    //----
    // Remove the more button
    //----
    function removeLoadMoreButton() {
        $('#more').remove();
    };

    //----
    // Append the more button to the list of gifs
    function addLoadMoreButton() {
        var id = getLayoutID();
        $(`#gif-gallery > #${id}`).append('<button type="button" id="more" class="btn btn-Primary hoverable">Load More...</button>');
    };


    //----
    // Init the gallery to a clean state
    //----
    function initGallery() {

        $('#gif-gallery').empty();

        $('#gif-gallery').append(`<div id="gallery-0" class="column"></div>`);
        $('#gif-gallery').append(`<div id="gallery-1" class="column"></div>`);
        $('#gif-gallery').append(`<div id="gallery-2" class="column"></div>`);
        $('#gif-gallery').append(`<div id="gallery-3" class="column"></div>`);

        loadingOffset = 0;
        clearLayout();
    }

    function clearLayout() {
        layoutInfo.heights = [0, 0, 0, 0];
        layoutInfo.heightAverage = 0;
        colIdx = 0;
    };


    function addColumnContent(height) {
        layoutInfo.heights[layoutInfo.colIdx] += height;

        var origColIdx = layoutInfo.colIdx;

        layoutInfo.colIdx++;
        if (layoutInfo.colIdx > 3) {
            layoutInfo.colIdx = 0;
            averageHeights = average(layoutInfo.heights);
        }

        while ((layoutInfo.heights[layoutInfo.colIdx] > layoutInfo.averageHeights) && layoutInfo.colIdx != origColIdx) {
            layoutInfo.colIdx++;
            if (layoutInfo.colIdx > 3) {
                layoutInfo.colIdx = 0;
                layoutInfo.averageHeights = average(layoutInfo.heights);
            }
        }     
    };

    function getLayoutID() {
        return 'gallery-' + layoutInfo.colIdx;
    }


    //-------------------------------------------------------------------------------------------------------------
    //
    //                  CALLS TO THE GIPHY SERVER
    //
    //--------------------------------------------------------------------------------------------------------------

    //----
    // Collects and displays the trending gifs.
    //----
    function collectTrendingGifs(offset = 0) {
 
        var url = 'https://api.giphy.com/v1/gifs/trending?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&limit=' + loadingLimit + '&offset=' + loadingOffset + '&rating=g';
        $.get(
            url,
            (data) => {

                // Remove the button should it exist.  
                removeLoadMoreButton();

                // The data parameter contains the string
                $(data.data).each(function (index, element) {

                    var id = getLayoutID();
                      
                    var url = element.images.fixed_width.url;
                    var altText = element.title;
                    $(`#gif-gallery > #${id}`).append(`<div class="div-gif"><img src="${url}" alt="${altText}" />${air}${heart}</div>`);

                    addColumnContent(element.images.fixed_width.height);
                

                });

                addLoadMoreButton();

                loadingOffset += data.pagination.count;

            });
    };
  

    //----
    // Collects and displays gifs returned by the search string.  
    //----
    function collectSearchGifs(strSearch, offset = 0) {
        var url = 'https://api.giphy.com/v1/gifs/search?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&q=' + strSearch + '&limit=' + loadingLimit + '&offset=' + loadingOffset + '&rating=g&lang=en';
        $.get(
            url,
            (data) => {

                // Remove the button should it exist.  
                removeLoadMoreButton();

                // The data parameter contains the string
                $(data.data).each(function (index, element) {
                    var id = getLayoutID();

                    var url = element.images.fixed_width.url;
                    var altText = element.title;
                    $(`#gif-gallery > #${id}`).append(`<div class="div-gif"><img src="${url}" alt="${altText}"/></div>`);

                    addColumnContent(element.images.fixed_width.height);
                })

                addLoadMoreButton();

                loadingOffset += data.pagination.count;
            }
        );
    };

    //----
    // Collects the trending searches
    //----
    function collectTrendingSearches() {
        $.get(
            //'https://api.giphy.com/v1/gifs/categories?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&q=',
            'https://api.giphy.com/v1/trending/searches?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&q=',
            (data) => {

                //               for (var x = 0; x < 12; x++) {
                $(data.data).each(function (index, element) {
                    $('#trending-searches-dropdown').append(`<button type="button" class="mnu-search dropdown-item">${element}</button>`);
                })
            }
        )
    };


    //----
    // Collects and constructs the Category set of menus.  
    //----
    function collectCategories() {
        $.get(
            //'https://api.giphy.com/v1/gifs/categories?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&q=',
            'https://api.giphy.com/v1/gifs/categories?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&q=',
            (data) => {

                categoryInfo = data.data;
                var divID = 0;

                $(data.data).each(function (index, element) {
                    var id = getLayoutID();
                  
                    var url = element.gif.images.fixed_width.url;
                    var altText = element.name;
                    $(`#gif-gallery > #${id}`).append(`<div class="div-cat" id="${divID}"><text>${element.name}</text><br/><img src="${url}" alt="${altText}"/></div>`);
                    //$('#categories-dropdown').append(`<button type="button" class="mnu-search dropdown-item">${element.name}</button>`);

                    divID++;

                    addColumnContent(element.gif.images.fixed_width.height);
                })
            }
        )
    };

  
})