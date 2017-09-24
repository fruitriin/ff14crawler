<?php
include_once 'resource/phpQuery-onefile.php';
require_once dirname(__FILE__) . '/resource/cache.php';
$debug = "false";

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

/**
 * メンバーの名前とクラスを返す
 * @param $url
 * @return array
 */
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

/**
 * キャラクターの全クラスとレベルと要求経験値のクラスを返す
 * @param $url
 * @param $name
 * @return array
 */
function getCharClass($url,$name){
    global $debug;
    $debug = false;
    $baseUrl = "http://jp.finalfantasyxiv.com";
    debugPrint("getCharClass実行\n");
    debugPrint($url."\n");
    $cache = getCache($baseUrl.$url);

    $html =  phpQuery::newDocumentHTML($cache);

    $h_Classes = $html['.character__level__list li'];
    $charClass = array();
    $k = 0;

    foreach ($h_Classes as $k => $td) {
        $charClass[$k]["Class"] = pq($td)->find("img")->attr("data-tooltip");
        $charClass[$k]["Lv"] = pq($td)->text();
//		if(pq($td)->text()=="")
//			continue;
//		switch ($i % 3) {
//			case 0:
//				$charClass[$k]["Class"] = pq($td)->attr("data-tooltip");
//				break;
//			case 1:
//				$charClass[$k]["Lv"] = pq($td)->text();
//				break;
//			case 2:
//				$charClass[$k]["ReqExp"] =  pq($td)->text();
//				$k++;
//				break;
//			default:
//				break;
//		}

    }
    return array($charClass, $name);
}

/**
 * キャラクターのリストのURLと名前のリストを返す
 * @param $url
 * @param $charList
 * @return array
 */
function getCharList($url,&$charList){
    $urls = explode("/", $url);

    $url .= "members/";
    debugPrint($url);
    $cache = getCache($url);
    $html =  phpQuery::newDocumentHTML($cache);

    debugPrint($html);

    $h_main = $html['#main'];

    $name = $html["#breadcrumb li:eq(3)"]->text();


//	debugPrint($h_main->text());
    //キャラクター名とリンク先を取得
//	$h_tds = $h_main->find("table td");
    $h_tds = $html->find(".ldst__window li.entry");
    $i = count($charList);
    foreach($h_tds as $td){
        $charList[$i]["name"] = pq($td)->find(".entry__name")->text();
//旧仕様ではlinkshellとfreecompanyは名前の格納が別々
//		if($urls[4] == "linkshell"){
//			$charList[$i]["name"] = pq($td)->find(".entry__name")->text();
//		}else{
//			$charList[$i]["name"] =  pq($td)->find("a")->text();
//		}
        $charList[$i]["url"] =  pq($td)->find(".entry__bg")->attr("href");
        $i++;
    }


    //ページャー取得
    $nextURL = $h_main->find("a.btn__pager__next")->attr("href");


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
        $bt = debug_backtrace();
        error_log($str ."\n[{$bt[0]["file"]}/{$bt[0]["line"]}]\n");
    }
}
