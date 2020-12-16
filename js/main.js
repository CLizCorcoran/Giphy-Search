// DOM is ready function
$(function () {

    var categoryInfo = null;
    var categoryBreadcrumb = [];
    var currentCategory = 0;
    var currentSearch = '';
    var loadingOffset = 0;
    var loadingLimit = 25;  // Currently this is unchanged.  May add to an option at some point. 
    var favorites = [];
    let findFavorite = (id) => favorites.find(o => o.id === id);
    let findFavoriteIndex = (id) => favorites.findIndex(o => o.id === id);

    var layoutInfo = {
        heights: [0, 0, 0, 0],
        heightAverage: 0,
        colIdx: 0
    }
    let average = (array) => array.reduce((a, b) => a + b) / array.length;

    /* far - outline heart; fas - solid heart */
    var heart = '<div class="overlay"><i class="far fa-heart"/></div>';
    var emptyHeartDiv = '<div class="overlay hide"><i class="fas fa-link"></i><i class="far fa-heart"/></div>'
    var solidHeartDiv = '<div class="overlay hide"><i class="fas fa-link"></i><i class="fas fa-heart"/></div>';
    //var air = '<i class="fas fa-air-freshener fresh"></i>';
    var air = '<i class="fas fa-heart fresh"></i>';
    var favoritesSolidHeartDiv = '<div class="favoriteheart"><i class="fas fa-heart"/></div>';
    

    var subcategoryBar = '<div id="subcategories" class="btn-group btn-group-sm" role="group" aria-label="Basic example"><div>';

    initGallery();
    collectTrendingGifs();

    collectTrendingSearches();

    const mediaQueryList = window.matchMedia("(screen)");


    
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

    $('#categories').click(function () {
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


    //----
    // A category was selected.  Show the gifs for the category plus its subcategories.  
    //----
    $('#gif-gallery').on('click', '.div-cat', function () {
        var jCat = $(this);

        var idx = jCat.prop('id');

        initGallery();

        $('#page-title')[0].innerText = "Category: " + categoryInfo[idx].name;

        $('#page-title').after(subcategoryBar);

        $('#subcategories').append(`<button type="button" class="btn btn-secondary subcategory active">All ${categoryInfo[idx].name}</button>`);
        $(categoryInfo[idx].subcategories).each(function (index, element) {
            $('#subcategories').append(`<button type="button" class="btn btn-secondary subcategory">${element.name}</button>`);
        });

        collectSearchGifs(categoryInfo[idx].name);





        /*
                var divID = 0;
        
                $(categoryInfo[idx].subcategory).each(function (index, element) {
                    var id = getLayoutID();
                  
                    var url = element.gif.images.fixed_width.url;
                    var altText = element.name;
                    $(`#gif-gallery > #${id}`).append(`<div class="div-cat" id="${divID}"><text>${element.name}</text><br/><img src="${url}" alt="${altText}"/></div>`);
                    //$('#categories-dropdown').append(`<button type="button" class="mnu-search dropdown-item">${element.name}</button>`);
        
                    divID++;
        
                    addColumnContent(element.gif.images.fixed_width.height);
                })
        */
    });

    //---
    // A subcategory was selected
    //---
    $('#page').on('click', '.subcategory', function () {
        var jSub = $(this);
        var jActive = $('.active');

        // If the active button was pressed, move along.  
        if (jActive === jSub)
            return;

        // Make this subcategory active now.  
        jActive.removeClass('active');
        jSub.addClass('active');

        //$('#page-title')[0].innerHTML += `<br/>Subcategory:  ${jSub[0].innerText}`;

        initGallery(false);

        collectSearchGifs(jSub[0].innerText);


    })


    //----
    // Favorites User
    //----
    $('#favorites').click(function () {
        // Reset variables and current collections.  
        initGallery();
        $('#text-search')[0].value = '';
        $('#page-title')[0].innerHTML = `<i class="fas fa-heart"></i>&nbsp;Favorites`;


        favorites.forEach(element => {

            var id = getLayoutID();

            var url = element;
            //var altText = element.title;
            $(`#gif-gallery > #${id}`).append(`<div class="div-gif"><img id="${element.id}" src="${element.url}" />${favoritesSolidHeartDiv}</div>`);

            addColumnContent(element.height);


        });
    });

    function addFavorite(id, url, height) {
        var favorite = { id: id, url: url, height: height };

        favorites.push(favorite);
    }

    function removeFavorite(id) {
        var idx = findFavoriteIndex(id);
        favorites.splice(idx, 1);
    }


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
    $('#more').click( function () {
        if (currentCategory == 0)
            collectTrendingGifs(loadingOffset);
        else
            collectSearchGifs(currentSearch, loadingOffset);
    });


    $('#gif-gallery').on('click', '.fa-link', function(e) {

        var jImage = $(this);


        var jGifDiv = jImage.parents('.div-gif');
        jGif = jGifDiv.find('img');

        //jCopy = $('#copylink');

        //jCopy.val(jGif[0].src);
        //jCopy[0].focus();

        //jCopy[0].select();

        //var successful = document.execCommand('copy');

        
            var $temp = $("<input>");
            //$temp.attr('value', jGif[0].src);
            $("body").append($temp);
            $temp.val(jGif[0].src).select();
            document.execCommand("copy");
            $temp.remove();
       
/*
        // copy the selection
        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch(e) {
            succeed = false;
        }
*/
        
        //e.clipboardData = jGif[0].src;
 /*
            textArea.value = text;
          
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
          
            try {
              var successful = document.execCommand('copy');
              var msg = successful ? 'successful' : 'unsuccessful';
              console.log('Copying text command was ' + msg);
            } catch (err) {
              console.log('Oops, unable to copy');
            }
          
            document.body.removeChild(textArea);
          }

          */
    });


    /*
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
    */


    //----
    // Love User action:  clicking on a heart to 'love' a gif. 
    //---- 
    $('#gif-gallery').on('click', '.far.fa-heart', function () {
        var jImage = $(this);

        jImage.removeClass('far');
        jImage.addClass('fas');

        //var jGif = jImage.prev("img");

        // Now we need to move the heart out of the overlay div and on top of the image.
        var jGifDiv = jImage.parents('.div-gif');
        jGifDiv.addClass('loved');
        //var jHeart = jImage.find('.fresh');
        //jHeart.show();

        jGif = jGifDiv.find('img');
        gifHeight = jGif.attr('fwheight');

        addFavorite(jGif[0].id, jGif[0].src, gifHeight);

        // Add information to favorites array.  
        //favorites.push(jGif[0].src);

    });


    //----
    // Unlove User action:  clicking a 'loved' heart to unlove the gif. 
    //----
    $('#gif-gallery').on('click', '.fas.fa-heart', function () {
        var jImage = $(this);

        jImage.removeClass('fas');
        jImage.addClass('far');

        var jGifDiv = jImage.parents('.div-gif');
        jGifDiv.removeClass("loved");
        var jGif = jGifDiv.find('img');

        removeFavorite(jGif[0].id);

        //var idx;

        //favorites.indexOf(jGif[0].url);
        //favorites.splice(idx, 1);
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
        //$('#more').remove();
        $('#more').hide();
    };

    //----
    // Append the more button to the list of gifs
    function addLoadMoreButton() {
        //var id = getLayoutID();
        //$(`#gif-gallery > #${id}`).append('<button type="button" id="more" class="btn btn-Primary hoverable">Load More...</button>');

        $('#more').show();
    };


    //----
    // Init the gallery to a clean state
    //----
    function initGallery(removeSubcategories = true) {

        if (removeSubcategories)
            $('#subcategories').remove();

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
        layoutInfo.colIdx = 0;
    };


    function addColumnContent(height) {
        layoutInfo.heights[layoutInfo.colIdx] += Number(height);

        var origColIdx = layoutInfo.colIdx;

        /*
                layoutInfo.colIdx++;
                if (layoutInfo.colIdx > 3) {
                    layoutInfo.colIdx = 0;
                    averageHeights = average(layoutInfo.heights);
                }
        */

        //       while ((layoutInfo.heights[layoutInfo.colIdx] > layoutInfo.heightAverage) && layoutInfo.colIdx != origColIdx) {
        while ((layoutInfo.heights[layoutInfo.colIdx] > layoutInfo.heightAverage)) {
            layoutInfo.colIdx++;
            if (layoutInfo.colIdx > 3) {
                layoutInfo.colIdx = 0;
                //var sum = layoutInfo.heights.reduce((a, b) => a + b);
                //layoutInfo.heightAverage = sum / layoutInfo.heights.length;

                //let average = (array) => array.reduce((a, b) => a + b) / array.length;
                layoutInfo.heightAverage = average(layoutInfo.heights);
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
                    var height = element.images.fixed_width.height;
                    var isFavorite = findFavorite(element.id);
                    var heartDiv = isFavorite ? solidHeartDiv : emptyHeartDiv;
                    var loved = isFavorite ? "loved" : "";

                    $(`#gif-gallery > #${id}`).append(`<div class="div-gif ${loved}"><img id="${element.id}" fwheight="${height}" src="${url}" alt="${altText}" />${air}${heartDiv}</div>`);

                    addColumnContent(height);


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

                    var height = element.images.fixed_width.height;
                    var isFavorite = findFavorite(element.id);
                    var heartDiv = isFavorite ? solidHeartDiv : emptyHeartDiv;
                    var loved = isFavorite ? "loved" : "";

                    $(`#gif-gallery > #${id}`).append(`<div class="div-gif ${loved}"><img id="${element.id}" fwheight="${height}"src="${url}" alt="${altText}"/>${air}${heartDiv}</div>`);

/*
                    var height = element.images.fixed_width.height;
                    var isFavorite = findFavorite(element.id);
                    var heartDiv = isFavorite ? solidHeartDiv : emptyHeartDiv;
 

                    $(`#gif-gallery > #${id}`).append(`<div class="div-gif ${loved}"><img id="${element.id}" fwheight="${height}" src="${url}" alt="${altText}" />${air}${heartDiv}</div>`);
*/

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