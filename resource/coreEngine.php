<?php
include_once 'phpQuery-onefile.php';
require_once dirname(__FILE__) . '/cache.php';
$debug = "false";

if($debug){
	
//print_r(getCharList("http://jp.finalfantasyxiv.com/lodestone/linkshell/21392098230010858", $emptyList));
//print_r(getCharClass("/lodestone/character/1584183/"));
//print_r($_POST);
}


if(isset($_POST['func'])){
	switch ($_POST['func']) {
		case 'getMembers':
			echo json_encode(getMembers($_POST["url"]));
			break;
		case 'getCharClass':
			echo json_encode(getCharClass($_POST["url"],$_POST["name"]));
		default:
			
			break;
	}
}


function getMembers($url){
	$i = 0;
	$charList = getCharList($url,$emptyArray);
    //count($charList);
    if(isset($_POST['func'])){
    	return $charList;
    }
	
	$charList;
    foreach ($charList as $charElem) {
		$charClassList[$i] = getCharClass($charElem["url"]);
		$charClassList[$i]["name"]=$charElem["name"];
		$i++;
	}
	return $charClassList;
//	return json_encode($charClassList);
}

function getCharClass($url,$name){
	$baseUrl = "http://jp.finalfantasyxiv.com";
	debugPrint("getCharClass実行\n");
	debugPrint($url."\n");
	 $cache = getCache($baseUrl.$url);
	
	$html =  phpQuery::newDocumentHTML($cache);
	
	$h_Class = $html['#main .base_body .input_area .base_inner'];

	$h_Classes = $h_Class->find(".class_list td");
	$charClass = array();
	$k = 0;
	
	foreach ($h_Classes as $i => $td) {
		if(pq($td)->text()=="")
			continue;
		switch ($i % 3) {
			case 0:
				$charClass[$k]["Class"] = pq($td)->text();
				break;
			case 1:
				$charClass[$k]["Lv"] = pq($td)->text();
				break;
			case 2:
				$charClass[$k]["ReqExp"] =  pq($td)->text();
				$k++;
				break;
			default:
				break;
		}
		
	}
	return array($charClass, $name);
}


function getCharList($url,&$charList){
	$urls = explode("/", $url);
	
	$cache = getCache($url);
	$html =  phpQuery::newDocumentHTML($cache);

	$h_main = $html['#main'];
	
	$name = $html["#breadcrumb li:eq(3)"]->text();
	
	
//	debugPrint($h_main->text());
	//キャラクター名とリンク先を取得
//	$h_tds = $h_main->find("table td");
	$h_tds = $html->find("table td");
	$i = count($charList);
	foreach($h_tds as $td){
		if($urls[4] == "linkshell"){
			$charList[$i]["name"] = pq($td)->find(".player_name_area a")->text();
		}else{
			$charList[$i]["name"] =  pq($td)->find("a")->text();
		}
		$charList[$i]["url"] =  pq($td)->find("a")->attr("href");
		$i++;
	}
	

	//ページャー取得
	$nextURL = $h_main->find(".pager li.next:first a")->attr("href");

	
	if($nextURL != "" && ($nextURL != $url)){
		debugPrint("次の呼び出し：".$nextURL."\n");
		return getCharList($nextURL, $charList);
	}else{
		debugPrint("No More Next Page\n");
	   return array($charList,$name);
    }
}




/*　キャッシュ取得ラッパー
 * キャッシュが存在しなければとってきて返す
 * urlは実態ファイルのフルパス。ローカルに保存するURLはParseURLで決める。
 */
function getCache($url){
	$cache = new Cache();
	$parsedURL = parseURL($url);
	$localPath = $parsedURL["localPath"];
	
	$value = $cache->get($localPath);
	if ($value === false)
	{
		$value =  file_get_contents($parsedURL["fullUrl"]);
	    $cache->put($localPath,$value);
		debugPrint("キャッシュしました:");
		debugPrint($localPath."\n");
	}else{
		debugPrint("キャッシュからの呼び出し:");
		debugPrint($localPath."\n");
		
	}
	return $value;
	
	
	/*　getCache用URLパーサ
	 * フルパスを引数にとり、返り値に array("fullPath","localPath")を持って返す
	 * 失敗するとそこでプログラムの実行がボッシュート
	 */

}

function parseURL($url){

$urls = explode("/", $url);
switch ($urls[4]) {
	case "freecompany":
		$localPage="";
		$page="";
			if(isset($urls[7]) && ($urls[7] != "")){
				$localPage = "-".substr($urls[7], 1);
				$page = $urls[7];
			}else{
				
				$page = "";
			}
			
			return array("localPath"=>$urls[4]."/".$urls[5].$localPage,
				"fullUrl"=>"http://jp.finalfantasyxiv.com/lodestone/".$urls[4]."/".$urls[5]."/member/$page");
		break;
	case "linkshell":
		$localPage="";
		$page="";
			if(isset($urls[7]) && ($urls[7] != "")){
				$localPage = "-".substr($urls[7], 1);
				$page = $urls[7];
			}else{
				
				$page = "";
			}
			
			return array("localPath"=>$urls[4]."/".$urls[5].$localPage,
				"fullUrl"=>"http://jp.finalfantasyxiv.com/lodestone/".$urls[4]."/".$urls[5].$page);
		break;
	case "character":
		debugPrint("キャラクターページと認識\n");
		return array("localPath" => $urls[4]."/".$urls[5],
		"fullUrl"=> "http://jp.finalfantasyxiv.com/lodestone/".$urls[4]."/".$urls[5]);	
	default:
		debugPrint("\nURL解析失敗\n");
		exit(1);
		break;
	}
}

function debugPrint($str){
	global $debug;	
	if($debug == "true"){
		print($str);
	}
}
