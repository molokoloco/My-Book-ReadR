<?php

$local = (strpos($_SERVER['SERVER_ADDR'], '127.0.0.1') !== FALSE ? TRUE : FALSE);
$WWW = ( $local ? 'http://localhost/_FRAMEWORK_/readr/' : 'http://www.b2bweb.fr/bonus/' );

// customPhpLibs... ---------------------------------------------

function clean($string) {
	$bad = array('|</?\s*SCRIPT.*?>|si', '|</?\s*OBJECT.*?>|si', '|</?\s*META.*?>|si', '|</?\s*APPLET.*?>|si', '|</?\s*LINK.*?>|si', '|</?\s*FRAME.*?>|si', '|</?\s*IFRAME.*?>|si', '|</?\s*JAVASCRIPT.*?>|si', '|JAVASCRIPT:|si', '|</?\s*FORM.*?>|si', '|</?\s*INPUT.*?>|si', '|CHAR\(|si', '|INTO OUTFILE|si', '|LOAD DATA|si', '|EVAL\(|si', '|CONCAT|');
	$string = preg_replace($bad, array(''), ' '.$string.' ');
	//$string  = mysql_real_escape_string($string);
	$string = addslashes($string);
	$string = str_replace('\\n','\n',$string);
	$string = str_replace('\\r','\r',$string);
	return trim($string);
}

function aff($string) {
	return stripslashes($string);	
}

function cleanName($string) {
	if (empty($string)) return $string;
	elseif (is_numeric($string)) return $string;
	$string = strtolower(' '.clean($string).' ');
	$special = array('&', 'O', 'Z', '-', 'o', 'z', 'Y', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ù', 'ú', 'û', 'ü', 'ý', 'ÿ', '.', ' ', '+', '\'');
$normal = array('et', 'o', 'z', '-', 'o', 'z', 'y', 'a', 'a', 'a', 'a', 'a', 'a', 'ae', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'd', 'n', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'y', 'a', 'a', 'a', 'a', 'a', 'a', 'ae', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'o', 'n', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'y', 'y', '_', '_', '-', '-');
	$string = str_replace($special, $normal, $string);
	$string = preg_replace('/[^a-z0-9_\-]/', '', $string);
	$string = preg_replace('/[\-]{2,}/', '-', $string);
	$string = preg_replace('/[\_]{2,}/', '_', $string);
	$string = substr($string, 1, -1);
	return $string;
}

function getExt($string) {
	$string = basename($string);
	if (strrpos($string,'.') === false) return '';
	$ext = strtolower(strrchr($string, '.'));
	$ext = substr($ext, 1);
	if ($ext == 'jpeg') $ext = 'jpg';
	if ($ext == 'mpeg') $ext = 'mpg';
	return $ext;
}

function makeName($path, $nb='60', $noExt=false) { // 070220155402_las-vegas-blvd.jpg
	$filename = basename($path);
	$ext = getExt($filename);
	$filename = substr(cleanName(preg_replace('|.'.$ext.'|si', '', $filename)), 0, $nb);
	return date(ymdHis).'_'.$filename.($noExt ? '' : (empty($ext) ? '' : '.'.$ext));
}
function unHtmlEntities($string) {
	//return  html_entity_decode(aff($string),ENT_COMPAT,'ISO-8859-15');
	$trans_tbl = get_html_translation_table(HTML_ENTITIES);
	$trans_tbl = array_flip($trans_tbl);
	return strtr($string, $trans_tbl);
}

function make_iso($str) {
	if (!$str) return;
	if (!function_exists('mb_detect_encoding')) return $str;
	$cod = mb_detect_encoding($str, 'UTF-8, ISO-8859-1');
	if ($cod == 'UTF-8') return utf8_decode($str);
	else return $str;
}

function make_utf($str) {
	if (!$str) return;
	if (!function_exists('mb_detect_encoding')) return $str;
	$cod = mb_detect_encoding($str, 'UTF-8, ISO-8859-1');
	if ($cod != 'UTF-8') return utf8_encode($str);
	else return $str;
}
function stripTags($string) {
	$string = preg_replace('/<br(.*?)>/', ' \n',$string); // Retour a la ligne avec espace
	$string = preg_replace('/<\/(pre|ul|li|p|table|tr)>/', ' \n', $string);
	$string = preg_replace('/<(.*?)>/', '',$string);
	$string = preg_replace('/(\n\n)+/', '\n\n', $string);
	return $string;
}

function jsonClean($string) {
	$bad = array('’', '“', '”');
	$better = array("'", '"', '"');
	$string = str_replace($bad, $better, $string);
	$string = stripslashes(make_iso($string));
	$string = str_replace($bad, $better, $string); // twice...
	$string = clean(stripTags(html_entity_decode($string, ENT_QUOTES, 'ISO-8859-1')));
	$string = str_replace(chr(10), ' ',$string);
	$string = str_replace(chr(13), '',$string);
	$string = str_replace('"', '\"',stripslashes($string));
	return $string;
}

function array2json($arrItems) {
	$jsonStr = '';
	foreach($arrItems as $item) {
		$itemStr = '';
		foreach((array)$item as $att=>$val) $itemStr .= '"'.$att.'":"'.jsonClean($val).'",';
		$jsonStr .= '{'.substr($itemStr, 0, -1).'},';
	}
	return '['.substr($jsonStr, 0, -1).']';
}

/*function yahooYql($feedUrl) {
	$path = 'http://query.yahooapis.com/v1/public/yql?q=';
	$path .= urlencode("SELECT * FROM feed WHERE url='$feedUrl'");
	$path .= "&format=json";
	return file_get_contents($path, true);
}*/
function generateId($prefix='obj_') {
	static $idObjects = 0;
	if ($prefix != 'obj_') $prefix = cleanName($prefix);	
	return $prefix.$idObjects++;
}

function js($script, $echo=TRUE) {
	$JS = '<script type="text/javascript">'.chr(13).chr(10).'// <![CDATA['.chr(13).chr(10);
	$JSE = chr(13).chr(10).'// ]]>'.chr(13).chr(10).'</script>';
	$js = $JS.chr(13).chr(10).$script.chr(13).chr(10).$JSE;
	if ($echo) echo $js;
	else return $js;
}

function db($var='') {
	$args = func_get_args();
	if (count($args) > 1) {
		foreach ($args as $arg) db($arg);
		return;
	}
	$t_id = generateId('db_');
	echo '<textarea id="'.$t_id.'" style="width:100%;height:250px;font:11px courier;color:#FFFFFF;background:#FF66CC;text-align:left;white-space:pre;padding:4px" rows="3" cols="7">';
	if (is_bool($var)) echo ($var ? 'TRUE' : 'FALSE');
	elseif ($var === '0' || $var === 0) echo $var;
	elseif (!empty($var)) var_export($var);
	else echo '*** No Value ***';
	echo '</textarea><br />';
	js("var lignes = document.getElementById('".$t_id."').value.split('\\n');
	document.getElementById('".$t_id."').style.height = (lignes.length*18+30)+'px';");
}

function d($var='<< PHP says that you killing him softly >>') {
	db($var);
	die();
}

// TELECHARGER  ---------------------------------------------
function getMime($string) {
	switch(getExt($string)){
		case '.gz': $mtype = 'application/x-gzip'; break;
		case '.tgz': $mtype = 'application/x-gzip'; break;
		case '.zip': $mtype = 'application/zip'; break;
		case '.pdf': $mtype = 'application/pdf'; break;
		case '.png': $mtype = 'image/png'; break;
		case '.gif': $mtype = 'image/gif'; break;
		case '.jpg': case '.jpeg': $mtype = 'image/jpeg'; break;
		case '.doc': $mime = 'application/msword'; break;
		case '.xls': $mime = 'application/vnd.ms-excel'; break;
		case '.ppt': case '.pps': $mime = 'application/vnd.ms-powerpoint'; break;
		case '.txt': $mtype = 'text/plain'; break;
		case '.htm': case '.html': $mtype = 'text/html'; break;
		case '.pdf': $mime = 'application/pdf'; break;
		case '.mp3': $mime = 'audio/mpeg'; break;
		case '.wav': $mime = 'audio/x-wav'; break;
		case '.mpeg': case '.mpg': case '.mpe': $mime = 'video/mpeg'; break;
		case 'mov': $mime = 'video/quicktime'; break;
		case 'avi': $mime = 'video/x-msvideo'; break;
		default: $mtype = 'application/octet-stream'; break;
	}
	return $mtype;
}

function telecharger($fileOrContent, $nom='') {
	if (is_file($fileOrContent)) {
		$nom = basename($fileOrContent);
		$fileOrContent = file_get_contents($fileOrContent);
	}
	$mime = getMime($nom);
	$maintenant = gmdate('D, d M Y H:i:s').' GMT';
	@ob_end_clean();
	//@ini_set('zlib.output_compression', '0');
	header('Content-Type: '.$mime);
	header('Content-Disposition: attachment; filename="'.$nom.'"');
	//header("Content-Disposition: inline; filename=$nom");
	//header("Content-Transfer-Encoding: binary");
	//if (navDetect() == 'msie') {
	  //header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	 // header('Pragma: public');
	//}
	//else
	header('Pragma: no-cache');
	header('Last-Modified: '.$maintenant);
	header('Expires: '.$maintenant); 
	header('Content-Length: '.strlen($fileOrContent));
	die($fileOrContent);
}

?>