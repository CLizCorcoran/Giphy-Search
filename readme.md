# Find My Gif - Giphy Search Web Application
## Overview
This fun little web application is meant to search for gifs.  It uses API endpoints surfaced by GIPHY (giphy.com).  

The webapp was written for my Web Development class's second project to showcase knowledge in HTML, SASS/CSS, Bootstrap, and jQuery.  Webpack was used to bundle the files together to allow for Find My Gif to be hosted and therefore run through GitHub Pages.  

This app can be run through GitHub Pages at:
https://clizcorcoran.github.io/Giphy-Search/


## User Stories
As a user, I would like to be able to search for Gifs via my own search string.  

As a user, I would like to be able to browse gifs grouped in categories.  

As a user, I would like to be able to tag my favorite gifs so that I can view them all later.  


## About the Web Application
The main, and only, page to this web application is index.html.  Because the application was bundled through webpack, starting page is the index.html within the dist directory.  

The page dynamically changes as the user selects how to search or browse gifs.  


### Gif Gallery

No matter how the user chooses to browse their gifs, the gallery rendering is the same.  Large screen sizes will render 4 columns, medium sizes will render 2, and smaller sizes only 1.  

Gifs are returned with a constant width but varying heights.  Calculations are done to keep the overall column height as similar as 
possible.  

25 gifs are returned at a time; however, a more button is rendered so the user can continuously fetch another 25 until no more gifs are left.  

Hovering over each rendered gif will allow the user to 'favorite' or 'unfavorite' it or to copy the gif's url.  


### Trending
Trending gifs is the pages that comes up by default.  These gifs are collected via the Giphy's Trending endpoint.  


### Categories
The list of categories is obtained via Giphy's Categories endpoint.  That endpoint returns all the categories along with a featured gif for representation.  

Selecting a subcategory simply uses that string as input into Giphy's generic Search endpoint.  



### Popular Searches
The list of trending searches is obtained through Giphy's Trending Search Terms endpoint.  

Selecting a trending search simply uses that string as input into Giphy's generic Search endpoint.  

### Favorites
Favorites allow the user to see all the gifs that have been favorited.  It should be noted that this information is not persisted after the web page is closed.  


## Technologies Used
This website was build using HTML, SASS (compiled into CSS), JavaScript, and jQuery.  Bootstrap was also imported and is used for general theming and in the Navigation bar.  


## Future improvements
I spent a bit more time on this than I was probably meant to.  At some point, I had to stop.  Some things I would like to improve are:

- Favorites:  I did not get the gif layout working as well for Favorites as in the other sections.  I'm also not happy with the rendering on the hearts on this page.  

- Copy gif:  When the user selects the copy link button, the url is pasted into the clipboard.  If the user pastes this link into a text, it is the url that is pasted, not the actual image.  In most cases, the user wants the actual image.  

