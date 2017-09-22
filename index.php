<?php
//	include_once("resource/index.html");
	include_once 'resource/coreEngine.php';
?>
<!DOCTYPE html>
<html lang="ja">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

		<title>FF14 ロードストーンFCLSメンバービューア</title>
		<meta name="description" content="フリーカンパニー、リンクシェルのメンバーのクラス/ジョブレベルを一纏めにして表示するサイトです">
		<meta name="viewport" content="width=device-width; initial-scale=1.0">
		<link rel="stylesheet" href="resource/style.css" />
		<script src="resource/jquery-2.0.3.min.js"></script>
		<script src="http://fruitriin.sakura.ne.jp/FF14Crawler/count/txcount.cgi" type="text/javascript"></script>
		<script src="resource/jquery.socialbutton-1.9.1.min.js" type="text/javascript"></script>
		<!-- Replace favicon.ico & apple-touch-icon.png in the root of your domain and delete these references -->
<!--		<link rel="shortcut icon" href="/favicon.ico">
		<link rel="apple-touch-icon" href="/apple-touch-icon.png">-->
	</head>

	<body>
		<div id="wrap">

			<section id="main">
			<header>
				<h1>FF14 ロードストーンFCLSメンバービューア</h1>ver0.1.x rev2013/08/28 23h52m
			</header>
				<p>このサイトは、<a href="http://jp.finalfantasyxiv.com/lodestone/">FINAL FANTASY XIV, The Lodestone</a>から<br>
				公開情報を用いてフリーカンパニー、リンクシェルのメンバーの全ジョブ、クラスのレベルを一覧することを目的としています。</p>
				<p>ログインが必要な情報、非公開の情報を活用することはありません。</p>
				<p class="counter"> </p>
				<div id="inputArea">
					<form action="./index.php" method="get">
					FCまたはLSのページのURLを入力<br>
					<input type="text" name="URL"><input type="submit">
					</form>
				</div>
				
				<div>
					<h4>Q&amp;A</h4>
					<ul>
						<li>Q.くそ遅い</li>
						<ul><li>初回（未キャッシュのキャラ）はキャッシュしながらなのですごく遅い。<br>
							負担をかけないためにキャッシュを取りに行く時は1ページにつき1秒のウェイトをかませてるのでなおさら重い。<br>
							一度キャッシュしたキャラクターについては一定時間キャッシュから読み込むのでいくらか早くなる。
						</li></ul>
						<li>Q.やってみたけど止まってない？</li>
						<ul><li>
							A.実行URLと表示されていてページ下端に読み込み完了の文字が表示されてなければ処理中。まったり待つべし。
						</li></ul>
<!--						<li>Q.フリカンIDってなに？</li>
						<ul><li>
							A.ロドストでフリーカンパニー表示したときにURLに含まれるやたら長い数字のこと。<br>
							一応作ってみたけどURL入力でいいよね？取っ払うかも。
						</li></ul>-->
						<li>Q.見栄えがクソ/使いにくい</li>
						<ul><li>
							A.私にも14ちゃん遊ばせてええええ！！！！！１１１これ仮なんですううううううううう
						</li></ul>
						<li>Q.規約的に大丈夫？</li>
						<ul><li>
							A.ファイナルファンタジーXIV 著作物利用許諾条件読む限り、<br>
							<i>1.利用できる著作物（以下「本著作物」といいます）<br>
							ファイナルファンタジーXIV公式サイト、公式フォーラム、および関連サイト内に掲載されているテキスト・情報・画像・動画</i><br>
							とあるし、
							ロードストーン利用規約読む限り、二次利用禁止とか書かれてないし、<br>むしろクラス情報なんかは公開情報なので非表示にできないとか書いてあったから大丈夫かなぁと思うんだけどどうなんだろう。
						</li></ul>
					</ul>
				</div>
				<div>
					<h4>今後の予定</h4>
					<ul>現在すべてPHPで動作してるので、サーバーサイドはPHP、クライアントサイドはJavaScriptに切り分けて読み込み中に進行度を表示する</ul>
					<ul>伴って一定レベル以上のクラスのみハイライト、最もレベルの高いクラスのハイライトなどのオプション</ul>
					<ul>テーブル表示以外に一定レベル以上クラスのみ、レベルの高い順クラス表示などのオプション</ul>
					<ul>現在キャッシュしているのがHTML全文なので負担に応じて必要な配列オブジェクトの形でキャッシュするかSQLでキャッシュするかする</ul>
					<ul><li>予定は未定。遊びたいし。ログインできない日が続くとがりがり進みそうだけど</li></ul>
				</div>
				
		        <div id="socialbuttons" class="clearfix">
		          <div class="twitter"> </div>
		          <div class="facebook"> </div>
		          <div class="google"> </div>
		          <div class="hatena"> </div>
		        </div>
				
				<div id="tableArea"></div>


<?php
//	print_r($_GET);
	$url = "";
	$baseUrl = "http://jp.finalfantasyxiv.com/lodestone/";
	if(isset($_GET["URL"])){
		if($_GET["URL"] != ""){
			$urls = explode("/", $_GET["URL"]);
			if($urls[3] == "lodestone" &&(($urls[4] == "linkshell") ||( $urls[4] == "freecompany"))){
							$url = $baseUrl.$urls[4]."/".$urls[5];
			}else{
				echo "URL解析エラー。フリーカンパニーもしくはリンクシェルのURLを入力してください。<br>\n";
				echo $_GET["URL"];
			}
		}
		/*else if($_GET["FreeCompany"] != ""){
			$url = $baseUrl."freecompany/".$_GET["FreeCompany"];
		}else if($_GET["LinkShell"] != ""){
			$url = $baseUrl."linkshell/".$_GET["LinkShell"];
		}*/
	}
	if($url != ""){
		echo "実行URL：".$url;
		$members = getMembers($url);
		echo $members[1];
		echo "<table border>\n";
				
		$head = "<tr><td nowrap rowspan='2'>キャラ名</td><td colspan='5'>ファイター</td><td colspan='3'>ｿｰｻﾗｰ</td>"
				."<td colspan='8'>クラフター</td><td colspan='3'>ｷﾞｬｻﾞﾗｰ</td></tr>"
				."<tr><td>剣術士</td><td>格闘士</td><td>斧術士</td><td>槍術士</td><td>弓術士</td>"
				."<td>幻術士</td><td>呪術士</td><td>巴術士</td>"
				."<td>木工師</td><td>鍛冶師</td><td>甲冑師</td><td>彫金師</td><td>革細工師</td><td>裁縫師</td><td>錬金術師</td><td>調理師</td>"
				."<td>採掘師</td><td>園芸師</td><td>漁師</td></tr>";
		echo $head;
		foreach($members[0] as $i => $member){
			echo "<tr><td class='Name'>".$member["name"]."</td>";
			for($i =0; count($member)-2 > $i; $i++){
				if($i == 5) continue;
				echo "<td>";
				echo $member[$i]["Lv"];
				echo "</td>";
				}
			echo "</tr>\n";	
	 	}
		echo "</table>";
		echo "読み込み完了";
	}
?>

			</section>
		
				
			

			<section id="sidebar">
				<nav>なんかリンクとかおく予定</nav>
				<div class="ads">
					<script type="text/javascript"><!--
					google_ad_client = "ca-pub-5973846129825898";
					/* FF14LSクローラー */
					google_ad_slot = "7831585559";
					google_ad_width = 120;
					google_ad_height = 600;
					//-->
					</script>
					<script type="text/javascript"
					src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
					</script>
				</div>
			</section>
			
			<script type="text/javascript">
			
			  var _gaq = _gaq || [];
			  _gaq.push(['_setAccount', 'UA-42820292-2']);
			  _gaq.push(['_trackPageview']);
			
			  (function() {
			    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			  })();
			window.google_analytics_uacct = "UA-42820292-2";
			</script>
		<footer>
				<p>
					Copyright  by <a href="https://twitter.com/fruitriin">Twitter@FruitRiin</a><br>
					記載されている会社名・製品名・システム名などは、各社の商標、または登録商標です。
				</p>
		</footer>
		</div>

	</body>
</html>
