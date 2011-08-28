<?php

//header('Content-Type: text/html; charset=utf-8');
require_once(dirname(__FILE__).'/functions.php');

$action = (!empty($_REQUEST['action']) ? $_REQUEST['action'] : '');
### db($_REQUEST);

switch($action) {
	
	case 'saveNotes' : // Save Notes
		$saveText = (!empty($_POST['saveText']) ? clean($_POST['saveText']) : '-VIDE-');
		telecharger(aff($saveText), 'piratons-la-democratie_notes.txt');	
	break;
	
	case 'saveText' : // Save Text
		$saveText = (!empty($_POST['textEdit']) ? clean($_POST['textEdit']) : '-VIDE-');
		$saveText = '<!--// Saved from http://www.b2bweb.fr/bonus/piratons-la-democratie.html @ '.date("H:i:s d/m/Y").' -->
<!DOCTYPE html> 
<html> 
<head> 
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta http-equiv="content-language" content="fr"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<title>Piratons la démocratie</title>
	<meta name="description" content="Piratons la démocratie, un livre de Paul da Silva 2011" />
	<meta name="viewport" content="width=720" />
	<link type="text/css" rel="stylesheet" href="http://www.b2bweb.fr/bonus/css/modernizr.css" />
	<link rel="stylesheet" type="text/css" href="http://www.b2bweb.fr/bonus/css/styles.css" />
	<script src="http://www.b2bweb.fr/bonus/js/modernizr-2.0.min.js"></script>
</head>
<body>
	<div class="spacer"><a name="top" id="top"></a></div>	
	<section>
		<article id="article" role="main" class="rounded">
			'.aff($saveText).'
		</article>
	</section>
	<div id="autor" class="stageSpace"> 
		<p>A <a href="https://github.com/molokoloco/My-Book-ReadR/" target="_blank" title="Get the code ! Fork me on GitHub">page</a> by <a href="mailto:molokoloco@gmail.com" id="a_0" title="Aka Julien G, contactez-moi par email">molokoloco</a> <img src="./images/copyleft.png" alt="Copyleft" width="12" height="12" border="0" title="Copyleft"/> <a href="http://www.b2bweb.fr/" title="b2bweb.fr" target="_blank">b2bweb.fr</a> 2011 <img src="./images/html5_logo_25.png" alt="Copyleft" width="16" height="16" border="0" title="HTML5 Powered"/>
		<a href="https://github.com/molokoloco/My-Book-ReadR/" id="ribbon" title="Get the code ! Fork me on GitHub">Fork Me !</a></p>
	</div>
</body>
</html>';
		telecharger($saveText, 'piratons-la-democratie-edit.html');
	break;
}

?>