jQuery.ReadR.JS
================

**My Book ReadR V1.12** Polished HTML5/CSS3 and jQuery powered "read-a-book" page.  
"*This start from the idea to design a page specially engineered to read a long text on the web...*" ^^   
GPL/MIT/Copyleft - [@molokoloco](https://twitter.com/#!/molokoloco/) 2011 - <http://b2bweb.fr>

---

- Infos (on my blog)  : <http://www.b2bweb.fr/molokoloco/my-book-readr-v1-12-html5-jquery-polished-page-as-a-book-reader/>
- Plain demo          : <http://www.b2bweb.fr/bonus/piratons-la-democratie.html>
- Main Script         : <https://github.com/molokoloco/My-Book-ReadR/blob/master/js/jquery.readr.js>
- Sources & download  : https://github.com/molokoloco/My-Book-ReadR/>

---


WHAT are we talking about ?
================

My Book Readr, c’est un code source ouvert qui peut permettre à tout à chacun de publier un long texte sur Internet via une page dédiée à la lecture en ligne.

**Principes généraux**

- Mise en page simple, claire et typographique, compatible HTML5
- Création d'un sommaire automatique, à partir des balises de titres (Ex. &lt;H4&gt;) du texte
- Le texte est redimensionnale en largeur (Poignée à droite dans la marge) et en taille de police (CSS basé sur les .em)
- Gestion du défilement vertical de la page, pour ne pas se perdre dans le texte
    - Un indicateur sur le paragraphe en cours de lecture pour stabiliser visuellement le défilement vertical (Repère)
    - Assouplissement du défillement par défaut de la molette, comportement progressif suivant la vitesse
    - Le défilement des chapitres est indiqué dans le sommaire, fixe à l'écran
    - Vignettes dynamiques indiquant le nombre "d'écrans" de la page (Nombre variant suivant l'affichage) et la position verticale actuelle
    - Le fond de page est cliquable et peut glisser de haut en bas
    - Flèches Haut/Bas pour défiler de page en page : Flèches Droite/Gauche pour défiler doucement
    - Fonction de lecture automatique (La touche "Entrée" active un défilement vertical continu réglable)
- Commentaires dynamiques
    - Chaque paragraphe accueil un mini-forum Disqus. API gratuite, qui accepte plusieurs type d'identification (Open ID, Facebook, Google, Twitter, Disqus, etc))
    - Possiblité de commenter le texte en utilisant les petites bulles sur la gauche
    - Sélection du texte pour annoter, copier ou éditer
- Edition WYSIWYG et HTML du texte, avec téléchargement d'une sauvegarde possible
- Création de notes à partir d'extraits de texte et sauvegarde au format .txt

**Utilisation du clavier**

- "Espace" ou "Entrée" : Lecture automatique
- Touches 1,2,3,...,9 pour régler la vitesse (5, valeur par défaut)
- Flèches "Haut" et "Bas" : Défilement de la page, flèches "Gauche" et "Droite" : Défilement doux
- "+" et "-" ou "Ctrl" + "Molette de la souris" : Ajustement de la taille du texte
- ... et "F11" pour le plein écran !


EXAMPLE SETTINGS 
================

See the ReadR demo file here "***./piratons-la-democratie.html***"  
Here a code example for your site :

    <script>
    // Optionnals DISQUS comments system, must by global
    // Remove url to kill Discuss (Don't forget the script above : id="discusRecentsComments")
    var disqus_url              = 'http://www.b2bweb.fr/bonus/piratons-la-democratie.html', // This page URL
        disqus_identifier       = 'pirate', // I give this name...
        disqus_domain           = 'disqus.com', // Don't touch
        disqus_shortname        = 'piratonsladmocratie', // Get it by creating a new forum under Discuss dashboard
        disqus_title            = 'Piratons la d&eacute;mocratie'; // Page title (Will be displayed in comments)
    </script>
    <script src="./js/jquery-1.6.2.min.js"></script>
    <script src="./js/jquery.readr.min.js"></script><!-- Main script -->


LIMITATIONS
================

Défaut : Testé uniquement sous Firefox 6 et Chrome 14 PC... (mais avec un code normalement générique !)


RESSOURCES AND DEPENDENCIES
================

The project is build with **jQuery 1.6.2** from <http://jquery.com/>, but i though 1.5 can work too  

* Frameworks
  * BoilerPlate HTML5 starter pack : https://github.com/paulirish/html5-boilerplate
  * TinyMCE, JS WYSIWYG HTML editor (jQuery version) : http://tinymce.moxiecode.com  
* Plugins
  * jQuery Waypoints v1.1 : https://github.com/imakewebthings/jquery-waypoints/
  * jQuery Mousewheel : http://adomas.org/javascript-mouse-wheel/
  * Copy to clipboard with ZeroClipboard.swf : http://www.steamdev.com/zclip/
* Social APIs
  * DISCUS comment system API : http://docs.disqus.com/developers/universal/
  * Google Plus API : https://code.google.com/intl/fr/apis/+1button/
  * Twitter API : https://twitter.com/about/resources/tweetbutton
  * Facebook API : https://developers.facebook.com/docs/reference/plugins/like/
  * Use Google Fonts API : http://www.google.com/webfonts/v2
