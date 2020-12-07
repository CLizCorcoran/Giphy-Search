// DOM is ready function
$(function() {

    $.get(
		'https://api.giphy.com/v1/gifs/trending?api_key=pI4DzZvYGmr4Gl941TDrtfkXV8SyhaJZ&limit=25&rating=g', // The URL to call
		(data) => {
            // The data parameter contains the string
            $(data.data).each( function(index, element) {
                    var url = element.images.fixed_width.url;
                    var altText = element.title;
                    var image = 
                    $('#gif-gallery').append(`<img src="${url}" alt="${altText}" />`);
            })
        }
	);


})