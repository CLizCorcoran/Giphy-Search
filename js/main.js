// DOM is ready function
$(function () {

    var categoryInfo = null;
    var loadingOffset = 0;
    var loadingLimit = 25;  // Currently this is unchanged.  May add to an option at some point. 
    var favorites = [];
    let findFavorite = (id) => favorites.find(o => o.id === id);
    let findFavoriteIndex = (id) => favorites.findIndex(o => o.id === id);

    var layoutInfo = {
        currentSearch: '',
        heights: [0, 0, 0, 0],
        heightAverage: 0,
        colIdx: 0
    }
    let average = (array) => array.reduce((a, b) => a + b) / array.length;

    /* far - outline heart; fas - solid heart */
    var heart = '<div class="overlay"><i class="far fa-heart"/></div>';
    var emptyHeartDiv = '<div class="overlay hide"><i class="fas fa-link hoverable"></i><i class="far fa-heart"/></div>'
    var solidHeartDiv = '<div class="overlay hide"><i class="fas fa-link"></i><i class="fas fa-heart"/></div>';
    //var air = '<i class="fas fa-air-freshener fresh"></i>';
    var air = '<i class="fas fa-heart fresh"></i>';
    var favoritesSolidHeartDiv = '<div class="favoriteheart"><i class="fas fa-heart"/></div>';
    

    var subcategoryBar = '<div id="subcategories" class="btn-group btn-group-sm" role="group" aria-label="Basic example"><div>';

    var copySuccess = `<div id="copysuccess" class="alert alert-success"><strong>Success</strong> - link copied to clipboard!</div>`;

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

        // If trending is already active, bail out now.  
        if ( $('#categories.active').length)
            return;

        // Find the active nav item.  
        var jNavItem = $('.nav-link.active');
        jNavItem.removeClass('active');
        $('#categories').addClass('active');


        // Reset variables and current collections.  
        initGallery();
        $('#text-search')[0].value = '';
        $('#page-title')[0].innerText = "Categories";

        collectCategories();
    })

    $('#trending').click(function () {

        // If trending is already active, bail out now.  
        if ( $('#trending.active').length)
            return;

        // Find the active nav item.  
        var jNavItem = $('.nav-link.active');
        jNavItem.removeClass('active');
        $('#trending').addClass('active');

        // Reset variables and current collections.  
        initGallery();
        $('#text-search')[0].value = '';
        $('#page-title')[0].innerText = "Trending";

        collectTrendingGifs();
    });

    $('#trending-searches-dropdown').on('click', '.mnu-search', function () {
        
        // Not going to worry about bailing early should the use select the same item twice.  

        // Find the active nav item.  
        var jNavItem = $('.nav-link.active');
        jNavItem.removeClass('active');
        $('#trending-searches').addClass('active');
        
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
        layoutInfo.currentSearch = jSub[0].innerText;   // The more button needs this info.  
        collectSearchGifs(layoutInfo.currentSearch);
    });


    //----
    // Favorites User
    //----
    $('#favorites').click(function () {

        // If already in favorites, ignore the click.  
        if ($('#favorites.active').length)
            return;

        // Find the active nav item.  
        var jNavItem = $('.nav-link.active');
        jNavItem.removeClass('active');
        $('#favorites').addClass('active');

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
    // The 'more' button was clicked.  This might be best with an id.  
    //----
    $('#more').click( function () {

        // Trending takes a different endpoint than all of the other searches. 
        if ( $('#trending.active').length) 
            collectTrendingGifs(loadingOffset);
        else
            collectSearchGifs(layoutInfo.currentSearch, loadingOffset);
    });


    $('#gif-gallery').on('click', '.fa-link', function(e) {

        var jImage = $(this);

        var jGifDiv = jImage.parents('.div-gif');
        jGif = jGifDiv.find('img');

        // Found this on StackOverflow - creates an input to put the to be copied text in.
        //  Selects it and copies it.  Just assuming the copy works.  :)
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(jGif[0].src).select();
        document.execCommand("copy");
        $temp.remove();

        // If the info message has already been added to the dom, show it. 
        //  Otherwise, create it.  
        if ($('#copysuccess').length)
            $('#copysuccess').show();
        else
            $('#main-container').prepend(copySuccess);
  
    });


 
    //----
    // When the user leaves the image, remove any messages.  
    //----
    $('#gif-gallery').on('mouseleave', '.div-gif', function () {
        var jMessage = $('#copysuccess');

        if (jMessage.length)
            jMessage.hide(500);
        });


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
        layoutInfo.currentSearch = strSearch;

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

        removeLoadMoreButton();

        $('#gif-gallery').append(`<div id="gallery-0" class="column"></div>`);
        $('#gif-gallery').append(`<div id="gallery-1" class="column"></div>`);
        $('#gif-gallery').append(`<div id="gallery-2" class="column"></div>`);
        $('#gif-gallery').append(`<div id="gallery-3" class="column"></div>`);

        loadingOffset = 0;
        clearLayout();
    }

    function clearLayout() {
        layoutInfo.strSearch = '';
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

                loadingOffset += data.pagination.count;

                if (loadingOffset < data.pagination.total_count)
                    addLoadMoreButton();
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