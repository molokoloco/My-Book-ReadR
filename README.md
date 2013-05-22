jQuery.ReadR.JS
================

**My Book ReadR V1.12** : Polished framework to read book-as-a-page online (HTML5/CSS3/jQuery)  
"*This start from the idea to design a page specially engineered to read a long text on the web...*" ^^  
GPL/MIT/Copyleft - [@molokoloco](https://twitter.com/#!/molokoloco/) 2011 - <http://b2bweb.fr>

---

- Infos (Blog)        : <http://www.b2bweb.fr/molokoloco/my-book-readr-v1-12-html5-jquery-polished-page-as-a-book-reader/>
- Slides (#ParisJS)   : <http://www.b2bweb.fr/bonus/my-book-readr/>
- **Plain demo**          : <http://www.b2bweb.fr/bonus/piratons-la-democratie.html>
- Sources & download  : <https://github.com/molokoloco/My-Book-ReadR/>

---

**Code was updated but not published for now...
New sources and examples here :**

- My Book ReadR V1.13  
  **http://www.b2bweb.fr/molokoloco/accord-de-libre-echange-transatlantique-readr-ified-with-html5/**
  http://www.b2bweb.fr/molokoloco/etienne-chouard-centralite-du-tirage-au-sort-en-democratie/
- My Book ReadR V1.12b  
  http://www.b2bweb.fr/molokoloco/quotes-from-george-orwell-html5-redesign/
- My Book ReadR V1.12 (HERE)  
  http://www.b2bweb.fr/molokoloco/my-book-readr-v1-12-html5-jquery-polished-page-as-a-book-reader/

**Some plugins extracted from this prototype...**

- **jQuery scrollView** : Viewport scroll and screen vertical helper  
  http://www.b2bweb.fr/molokoloco/jquery-scrollview-viewport-scroll-and-screen-vertical-helper/
- **jQuery Colonize plugin** : In-between titles multicols paragraphs with CSS3  
  http://www.b2bweb.fr/molokoloco/jquery-colonize-plugin-in-between-titles-multicols-paragraphes-with-css3/
- **BeeLine Reader** : Lire plus vite et réduire les erreurs  
  http://www.b2bweb.fr/molokoloco/beeline-reader-lire-plus-vite-et-reduire-les-erreurs/

---

WHAT are we talking about ?
================

My Book Readr, c’est un code source ouvert qui peut permettre de publier un long texte sur Internet via une page dédiée à la lecture en ligne.

* **Principes de base**
    - Mise en page simple, claire et typographique, compatible HTML5
	- Création d'un sommaire, à partir des balises de titres (Ex. &lt;H4&gt;) du texte
	- Le texte est redimensionnable en largeur (Poignée à droite dans la marge) et en taille de police (CSS basé sur les .em)
* **Principes intéractifs**
	- Commentaires dynamiques, chaque paragraphe accueil un mini-forum Disqus. (API gratuite, qui accepte plusieurs type d'identification : Open ID, Facebook, Google, Twitter, Disqus, etc)
	- Sélection du texte pour annoter, copier ou éditer, sauvegarde au format .txt
	- Édition WYSIWYG et HTML du texte, avec téléchargement d'une sauvegarde possible
* **Le défilement vertical de la page**
	- Un indicateur sur le paragraphe en cours de lecture pour stabiliser visuellement le défilement vertical (Repère)
	- Assouplissement du défilement par défaut de la molette, comportement progressif suivant la vitesse et le nombre de "mousewheel"
	- Le chapitre en cours est indiqué dans le sommaire, fixe à l'écran
	- Vignettes dynamiques indiquant le nombre "d'écrans" de la page (Nombre variant suivant l'affichage)
	- Le fond de page est cliquable et peut glisser de haut en bas (Défilement précis)
	- Flèches Haut/Bas pour défiler de d'écran en écran : flèches Droite/Gauche pour défiler plus doucement
	- Fonction de lecture automatique (La touche "Entrée" active un défilement vertical continu réglable)
	- L'URL de la page est mise à jour (#hash) de manière synchronisée
* **Utilisation du clavier**
	- "Espace" ou "Entrée" : Lecture automatique
	- Touches 1,2,3,...,9 pour régler la vitesse (5, valeur par défaut)
	- Flèches "Haut" et "Bas" : Défilement de la page, flèches "Gauche" et "Droite" : Défilement doux
	- "+" et "-" ou "Ctrl" + "Molette de la souris" : Ajustement de la taille du texte
	- ... et "F11" pour le plein écran !


LIMITATIONS
================

Readr.js n'est pas un "plugin" jQuery : trop de dépendances avec le HTML, le CSS et d'autres plugins jQuery : C'est un mini-framework. (Livré avec un example ou un simple texte HTML4/5 est a remplacer

Défauts :
	- Testé uniquement sous Firefox 6/7 et Chrome 14/16 PC... (mais avec un code normalement générique !)
	- Pas de CSS trop poussé : On ne peut pas mettre de "text-shadow" ou de "border-radius", etc... sans perdre en performances
	- ...


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
