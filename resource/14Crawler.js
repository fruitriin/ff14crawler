var version = "1.7.0";

$.ajaxSetup({
    url: "coreEngine.php",
    method: "POST",
    dataType: "json"
});
var headers = {
    "default": ["ナイト / 剣術士", "戦士 / 斧術士", "暗黒騎士",
        "白魔道士 / 幻術士", "学者", "占星術師",
        "モンク / 格闘士", "竜騎士 / 槍術士", "忍者 / 双剣士", "侍",
        "吟遊詩人 / 弓術士", "機工士", "黒魔道士 / 呪術士", "召喚士 / 巴術士", "赤魔道士",
        "木工師", "鍛冶師", "甲冑師", "彫金師", "革細工師", "裁縫師", "錬金術師", "調理師",
        "採掘師", "園芸師", "漁師"],
    "role": ["ナイト / 剣術士", "戦士 / 斧術士", "暗黒騎士",
        "モンク / 格闘士", "竜騎士 / 槍術士", "忍者 / 双剣士", "侍",
        "吟遊詩人 / 弓術士", "機工士", "黒魔道士 / 呪術士", "召喚士 / 巴術士", "赤魔道士",
        "白魔道士 / 幻術士", "学者", "占星術師",
        "木工師", "鍛冶師", "甲冑師", "彫金師", "革細工師", "裁縫師", "錬金術師", "調理師",
        "採掘師", "園芸師", "漁師"],
    "NestDefault": {
        "戦闘職":{
            "ファイター": ["ナイト / 剣術士", "戦士 / 斧術士", "モンク / 格闘士", "竜騎士 / 槍術士", "忍者 / 双剣士", "詩人 / 弓術士"],
            "ｿｰｻﾗｰ": ["白魔道士 / 幻術士", "学者", "黒魔道士 / 呪術士", "召喚士 / 巴術士"],
            "ExJob": ["暗黒騎士", "機工士", "占星術師", "侍","赤魔道士"],
        },
        "制作・採取職":{
            "クラフター": ["木工師", "鍛冶師", "甲冑師", "彫金師", "革細工師", "裁縫師", "錬金術師", "調理師"],
            "ｷﾞｬｻﾞﾗｰ": ["採掘師", "園芸師", "漁師"]
        }
    },
    "NestRole": {
        "Tank": ["ナイト / 剣術士", "戦士 / 斧術士", "暗黒騎士"],
        "DPS": ["モンク / 格闘士", "竜騎士 / 槍術士", "忍者 / 双剣士", "侍", "詩人 / 弓術士", "機工士", "黒魔道士 / 呪術士", "召喚士 / 巴術士", "赤魔道士"],
        "Healer": ["白魔道士 / 幻術士", "学者", "占星術師"],
        "Crafter": ["木工師", "鍛冶師", "甲冑師", "彫金師", "革細工師", "裁縫師", "錬金術師", "調理師"],
        "Gatherer": ["採掘師", "園芸師", "漁師"]
    }
};

function data(func, url, name) {
    this.func = func;
    this.url = url;
    this.name = name;
}

var numberOfJobSplit = 14
var response;
var debug;
var allData;
var config = {
    mode: "tableAsDefault",
    listOption: {lLv: 1, hLv: 99, filterNumOfLevels: true, cutNum: 5},
    currentURL: "",
    showMode:"戦闘職",
    FCs: {},
    LSs: {}
};

$(function () {
    loadConfig();
    setButtons();
    $("h1").after("ver " + version);
    makeInputArea();
    loadURL();
});

function loadURL() {
    var loadData = window.location.search;
    var args = loadData.split("&");
    if (loadData == "") {
        return;
    }
    var url = "http://jp.finalfantasyxiv.com/lodestone/";
    if (args[0].substr(3) == "l") {
        url += "linkshell/";
    }
    else {
        url += "freecompany/";
    }
    url += args[1].substr(2);
    config.mode = args[2].substr(2);
    config.listOption.lLv = args[3].substr(4);
    config.listOption.hLv = args[4].substr(4);
    config.listOption.filterNumOfLevels = args[5].substr(4);
    config.listOption.cutNum = args[6].substr(4);

    getMemberList(url);
}

/**
 * ローカルストレージの情報の読み込み
 */
function loadConfig(){
    if(window.localStorage.hasOwnProperty("LSCrawlerConfig")){
        config = JSON.parse(window.localStorage.getItem("LSCrawlerConfig"));
    }else{
        /*
        for(var i =0; localStorage.length>i; i++){
            if(localStorage.key(i) == "LSCrawlerConfig" || localStorage.key(i) == "config"){
                continue;
            }
            if(localStorage.key(i) == "conf" ){
                localStorage.removeItem("conf");
                continue;
            }
            var saves = JSON.parse(localStorage.getItem(localStorage.key(i)));
            config[saves.cat + "s"][saves.name] = new Object();
            config[saves.cat + "s"][saves.name].name = saves.name;
            config[saves.cat + "s"][saves.name].url = saves.url;
            localStorage.removeItem(localStorage.key(i));
        }*/

    }
}

function setConfigArea() {
    var confArea = $("#confArea");
    var checked = ["checked", "", ""];
    var html2 = "<br>";
    switch (config.mode) {
        case "default":
        case "tableAsDefault":
            var checked = ["checked", "", ""];
            break;
        case "role":
        case "tableAsRole":
            var checked = ["", "checked", ""];
            break;
        case "listAsClass":
            var checked = ["", "", "checked"];
            var checkedNumOfLevels = "";
            if (config.listOption.filterNumOfLevels) {
                checkedNumOfLevels = "checked";
            }
            html2 = "フィルタ：最低レベル<input type=text name=lLv  size=1 maxlength=2 value=" + config.listOption.lLv + "></input>"
                + "最高レベル<input type=text name=hLv  size=1 maxlength=2 value=" + config.listOption.hLv + ">の範囲内<br>"
                + "<input type=checkbox name=filterNumOfLevels " + checkedNumOfLevels + ">上位"
                + "<input type=text name=numOfLevel size=1 maxlength=2 value=" + config.listOption.cutNum + ">つのレベル帯までで表示をカットする<br>";
            break;
    }

    switch (config.showMode){
        default:
        case "戦闘職":
            var showModeChecked = ["checked", ""]
            break;
        case "制作・採取職":
            var showModeChecked = ["", "checked"]
            break;

    }

    html2 += "<a href='./?t=" + config.t + "&u=" + config.u + "&m=" + config.mode + "&lLv=" + config.listOption.lLv
        + "&hLv=" + config.listOption.hLv + "&fno=" + config.listOption.filterNumOfLevels
        + "&cno=" + config.listOption.cutNum + "'>表示復帰URL</a>"
    var html = "表示形式："
        + "<input type=radio name=useType id=tableAsDefault value=default " + checked[0] + "><label for='tableAsDefault'>デフォルト</label>"
        + "<input type=radio name=useType id='tableAsRole' value=role " + checked[1] + "><label for='tableAsRole'>ロール別</label>"
        + "<input type=radio name=useType id='listAsClass' value=listAsClass " + checked[2] + "><label for='listAsClass'>リスト形式クラスレベルランキング</label> "
        + "<br>"
        + "表示職種："
        + "<input type=radio name=showMode id='battleClassMode' value='戦闘職' "+ showModeChecked[0] + "><label for='battleClassMode'>戦闘職</label>"
        + "<input type='radio' name='showMode' id='gather_craftClassMode' value='制作・採取職' "+ showModeChecked[1] + "><label for='gather_craftClassMode'>制作・採取職</label>"
        + "<br>"
    confArea.html(html + html2);
}

function makeInputArea() {
    var html = "<p>FCまたはLSのページのURLを入力<br>\n"
        + '<input type="text" name="URL"><input type="submit" value="取得"></p>\n';
    var FCs = "";
    var LSs = "";

    $.each(config.LSs, function (i, elem) {
        LSs += '<span class="button" name="getMembers" value="' + elem.url + '">' + elem.name + '</span> '
            + '<a href="' + elem.url + '" target="_blank"><img src="resource/arrow.png"></a> '
            + '<span class="button" name="removeHistory" value="' + elem.name + '">[削]</span>　';
    });
    $.each(config.FCs, function (i, elem) {
        FCs += '<span class="button" name="getMembers" value="' + elem.url + '">' + elem.name + '</span> '
            + '<a href="' + elem.url + '" target="_blank"><img src="resource/arrow.png"></a> '
            + '<span class="button" name="removeHistory" value="' + elem.name + '">[削]</span>　';
    });

    if (FCs != "")
        html += "<p id=FCs>過去に表示したFC<br>\n" + FCs + "</p>";
    if (LSs != "")
        html += "<p id=LSs>過去に表示したLS<br>\n" + LSs + "</p>";
    $("#inputArea").html(html);
}

function setButtons() {
    //FC/LSページのURLを入力　取得ボタン
    $(document).on("click", "input[type=submit]", function () {
        getMemberList("");
    });
    //履歴から読み込みリンク
    $(document).on("click", "#inputArea .button[name=getMembers]", function () {
        getMemberList($(this).attr("value"));
    });
    //履歴を消すボタン
    $(document).on("click", "#inputArea .button[name=removeHistory]", function () {
        delete config[$(this).parent().attr("id")][$(this).attr("value")];
        localStorage.setItem("LSCrawlerConfig", JSON.stringify(config));
        makeInputArea();
    });
    //表示形式の切り替えボタン
    $(document).on("click", "#confArea input[name=useType]", function () {
        switch ($(this).val()) {
            case "default":
            case "tableAsDefault":
                config.mode = "tableAsDefault";
                localStorage.setItem("LSCrawlerConfig", JSON.stringify(config));
                setTableAsDefault();
                break;
            case "role":
            case "tableAsRole":
                config.mode = "tableAsRole";
                localStorage.setItem("LSCrawlerConfig", JSON.stringify(config));
                setTableAsRole();
                break;
            case "listAsClass":
                config.mode = "listAsClass";
                localStorage.setItem("LSCrawlerConfig", JSON.stringify(config));
                setListAsClass();
                break;
        }
    });
    //ランキングの表示制御
    $(document).on("change", "#confArea input[type=text]", function () {
        switch ($(this).attr("name")) {
            case "lLv":
                config.listOption.lLv = $(this).val();
                break;
            case "hLv":
                config.listOption.hLv = $(this).val();
                break;
            case "numOfLevel":
                config.listOption.cutNum = $(this).val();
                break;
        }
        localStorage.setItem("LSCrawlerConfig", JSON.stringify(config));
        setListAsClass();
    })
    $(document).on("change", "#confArea input[type=checkbox]", function () {
        switch ($(this).attr("name")) {
            case "filterNumOfLevels":
                config.listOption.filterNumOfLevels = $(this).prop("checked");
                break;
        }
        localStorage.setItem("LSCrawlerConfig", JSON.stringify(config));
        setListAsClass();
    })
    //表示職種別切り替え
    //表示形式の切り替えボタン
    $(document).on("click", "#confArea input[name=showMode]", function () {
        switch ($(this).val()) {
            default:
            case "戦闘職":
                config.showMode = "戦闘職";
                localStorage.setItem("LSCrawlerConfig", JSON.stringify(config));
                break;
            case "制作・採取職":
                config.showMode = "制作・採取職";
                localStorage.setItem("LSCrawlerConfig", JSON.stringify(config));
                break;
        }
        switch(config.mode){
            case "default":
            case "tableAsDefault":
                setTableAsDefault();
                break;
            case "role":
            case "tableAsRole":
                setTableAsRole();
                break;
            case "listAsClass":
                setListAsClass();
                break;
        }
    });
}

//メンバーリストの取得と表示
//引数無しの場合、URLはinputタグから拾う
function getMemberList(url) {
    //urlの検査用に分割
    if (url == "") {
        var urls = $("input[name=URL]").val().split("/");
    } else {
        var urls = url.split("/");
    }

    //分割したURLの検査とFC/LSを分類
    if ((urls.length < 5) || (urls[2].split(".")[1] != "finalfantasyxiv") || (urls[3] != "lodestone")) {
        //URLが不正です
        return;
    } else if (urls[4] == "linkshell") {
        var categoly = "LS";
        var catLong = "リンクシェル";
        var url = "http://jp.finalfantasyxiv.com/lodestone/" + urls[4] + "/" + urls[5] + "/";
    } else if (urls[4] == "freecompany") {
        var categoly = "FC";
        var catLong = "フリーカンパニー";
        var url = "http://jp.finalfantasyxiv.com/lodestone/" + urls[4] + "/" + urls[5] + "/";
    } else {
        //LS/FCのURLじゃありません。
        return;
    }
    config.t = "f";
    if (urls[4] == "linkshell") config.t = "l";
    config.u = urls[5];

    //メンバーリストの読み込み開始
    $("#inputArea").html("<img src='resource/loadinfo.gif'>読み込み中・・・");
    var getListData = new data("getMembers", url);
    $.ajax({data: getListData}).done(function (res) {

        //FC/LS名とURLをローカルストレージに保存
        var save = {
            "name": res[1], "cat": categoly, "catLong": catLong,
            "url": "http://jp.finalfantasyxiv.com/lodestone/" + urls[4] + "/" + urls[5] + "/"
        };
        config[categoly + "s"][res[1]] = {};
        config[categoly + "s"][res[1]].name = res[1];
        config[categoly + "s"][res[1]].url = save.url;
        localStorage.setItem("LSCrawlerConfig", JSON.stringify(config))
        //全キャラ名とランク順、URLをグローバル変数確保
        allData = res[0];

        //FC/LS名出力
        var html = "<h2 class=curtain>" + catLong + "</h2><h3>◆" + res[1] + "</h3>\n"
            + "<div id='confArea'></div>"
            + "<div id='coreArea'>\n<table border>";

        var head1 = "<tr><td nowrap rowspan='2'>キャラ名</td>";
        var head2 = "<tr>";

        $.each(headers.NestDefault["戦闘職"], function (key, e) {
            head1 += "<td class='nowrap' colspan='" + this.length + "'>" + key + "</td>";
            $.each(this, function () {
                head2 += "<td>" + this.split("/")[0].trim() + "</td>";
            });
        });
        head1 += "</tr>";
        head2 += "</tr>";

        html += head1 + head2;

        //キャラクター名テーブル出力
        res[0].forEach(function (e, i, a) {
            html += "<tr><td data-index='" + i + "' class='Name'>" + e.name + "</td></tr>";
        });
        html += "</table></div>";
        $("#tableArea").html(html);

        //各キャラクターのクラスレベル取得する
        $.asyncEach(res[0], function ($dfd, $value, $index) {
            var getCharData = new data("getCharClass", $value.url, $value.name);
            $.ajax({data: getCharData, async: "false"})
                .done(function (response, status, data) {
                    var td = $("td:contains(" + response[1].split("\\").join("") + ")");

                    //各キャラクターの全クラス、レベルをキャラクター別に確保
                    var index = td.attr("data-index");
                    allData[index].Classes = new Object();

                    var html = "";

                    $.each(response[0], function (i, a) {
                        //空行対策のおまじない　でした
                        //if( i == 20) return true;
                        var style = "Lv10";
                        if (!isNaN(this.Lv)) {
                            style = "Lv" + (Math.floor(parseInt(this.Lv) / 10) + 1) + "0";
                        }

                        allData[index].Classes[this.Class] = this;
                        if(i > numberOfJobSplit){
                            return
                        }
                        html += "<td class='" + style + "'>" + this.Lv + "</td>";
                    });
                    td.after(html);
                    return $dfd.resolve();
                });
        }).then(function () {
            makeInputArea();

            switch (config.mode) {
                case "role":
                case "tableAsRole":
                    setTableAsRole();
                    break;
                case "listAsClass":
                    setListAsClass();
                    break;
                default:
                    setTableAsDefault();
                    break;
            }
            setConfigArea();
        })
    });
}

/**
 * デフォルトモードの表を作成する
 */
function setTableAsDefault() {
    console.log("setTableAsDefault")
    var listAsDefault = headers.default

    var html = "<div id='confArea'></div><table border=1>\n";
    var head1 = "<tr><td nowrap rowspan='2'>キャラ名</td>";
    var head2 = "<tr>";
    $.each(headers.NestDefault[config.showMode], function (key, e) {
        head1 += "<td class='nowrap' colspan='" + this.length + "'>" + key.split("/")[0].trim() + "</td>";
        $.each(this, function () {
            head2 += "<td>" + this.split("/")[0].trim() + "</td>";
        });
    });
    head1 += "</tr>";
    head2 += "</tr>";
    html += head1 + head2;

    allData.forEach(function (Char, i, a) {
        html += "<tr><td data-index='" + i + "' class='Name'><a href='http://jp.finalfantasyxiv.com/" + Char.url + "'>" + Char.name + "</a></td>";

        listAsDefault.forEach(function (c, i, a) {
            if(
                config.showMode == "戦闘職" && i > numberOfJobSplit
                || config.showMode == "制作・採取職" && i <= numberOfJobSplit
            )return
            if(Char.Classes[c] === undefined){
                c =  c.split("/")[1].trim();
            }
            var style = "Lv10";
            if (Char.Classes[c]!==undefined &&!isNaN(Char.Classes[c].Lv)) {
                style = "Lv" + (Math.floor(parseInt(Char.Classes[c].Lv) / 10) + 1) + "0";
            }else{
                Char.Classes[c].Lv = "-"
            }
            html += "<td class='" + style + "'>" + Char.Classes[c].Lv + "</td>";
        });
        html += "</tr>";
    });
    html += "</table>";
    $("#coreArea").html(html);
    setConfigArea();
}

/**
 * ロール別の表を作成する
 */
function setTableAsRole() {
    console.log("setTableAsRole")
    var listAsDefault = headers.role;
    var html = "<div id='confArea'></div><table border>\n";
    if(config.showMode == "戦闘職"){
        html += "<tr><td nowrap rowspan='2'>キャラ名</td><td colspan='3'>Tank</td><td colspan='9'>DPS</td><td colspan='3'>Healer</td>"
            // + "<td colspan='8'>クラフター</td><td colspan='3'>ｷﾞｬｻﾞﾗｰ</td>" +
            +"</tr>\n";
    }else{
        html += "<tr><td nowrap rowspan='2'>キャラ名</td>"
            + "<td colspan='8'>クラフター</td><td colspan='3'>ｷﾞｬｻﾞﾗｰ</td>" +
            +"</tr>\n";

    }

    html += "<tr>";
    listAsDefault.forEach(function (e, i, a) {
        if(
            config.showMode == "戦闘職" && i > numberOfJobSplit
            || config.showMode == "制作・採取職" && i <= numberOfJobSplit
        )return
        //ヒーラーの巴術士を学者に書き換え
        // if (i == 10) {
        //     html += "<td>学者</td>";
        // } else {
            html += "<td>" + e.split("/")[0].trim() + "</td>";
        // }
    });
    html += "</tr>";

    allData.forEach(function (Char, i, a) {

        html += "<tr><td data-index='" + i + "' class='Name'><a href='http://jp.finalfantasyxiv.com/" + Char.url + "'>" + Char.name + "</a></td>";

        listAsDefault.forEach(function (c, i, a) {
            if(
                config.showMode == "戦闘職" && i > numberOfJobSplit
                || config.showMode == "制作・採取職" && i <= numberOfJobSplit
            )return
            if(Char.Classes[c] === undefined && c.split("/").length == 2){
                c =  c.split("/")[1].trim();
            }
            var style = "Lv10";
            if (Char.Classes[c]!==undefined && !isNaN(Char.Classes[c].Lv)) {
                style = "Lv" + (Math.floor(parseInt(Char.Classes[c].Lv) / 10) + 1) + "0";
            }else{
                Char.Classes[c] = new Object()
                Char.Classes[c] = {
                    Lv : "-",
                    Class : c
                }
            }

            //学者だけLv30未満の場合は表示しない
            if (i == 5 && (Char.Classes[c].Lv < 30)) {
                html += "<td class='Lv10'>-</td>";
            } else {
                html += "<td class='" + style + "'>" + Char.Classes[c].Lv + "</td>";
            }
        });
        html += "</tr>";
    });
    html += "</table>";
    $("#coreArea").html(html);
    setConfigArea();
}

function setListAsClass() {
    console.log("set List as Class")
    lLv = parseInt(config.listOption.lLv);
    hLv = parseInt(config.listOption.hLv);
    if (typeof lLv === "undefined") lLv = 1;
    if (typeof hLv === "undefined") hLv = 99;

    var html = "<div class='inner'>";

    var listAsDefault = headers.default;
    var allDataForSort = [];
    allData.forEach(function(data){
        var charctordata = {
            name : data.name,
            Classes : {}
        }

        Object.keys(data.Classes).forEach(function(charclass){
            var keyes = charclass.split("/")
            if(keyes[1] !== undefined){
                key = keyes[1].trim()
            }else{
                key = keyes[0].trim()
            }
            charctordata.Classes[key] = {Class: key, Lv: data.Classes[charclass].Lv}
        })
        allDataForSort.push(charctordata);
    })

    listAsDefault.forEach(function (Class, i, a) {
        html += "<h4>" + a[i] + "</h4>";
        var Classes = Class.split("/")
        if(Classes[1] !== undefined){
            Class = Classes[1].trim()
        }else{
            Class = Classes[0].trim()
        }
        var sortedList = objSort(allDataForSort, "Classes", Class, "Lv", true);
        var tmp;
        var count = [0];
        sortedList.forEach(function (c, i, a) {
            if(c.Classes[Class] === undefined){
                Class =  Class.split("/")[1].trim();
            }
            if (lLv > c.Classes[Class].Lv || c.Classes[Class].Lv > hLv) {
                return true;
            }

            if (tmp != c.Classes[Class].Lv) {
                //レベルが他のキャラと変化する時
                if (config.listOption.filterNumOfLevels && count[0] >= config.listOption.cutNum) {
                    return false;
                }
                if (count[0] != 0) {
                    html += "<br>";
                }
                count[0]++;
                html += "Lv" + c.Classes[Class].Lv + "：";
            } else {
                html += " / "
            }
            var style = "Lv10";
            if (!isNaN(c.Classes[Class].Lv)) {
                style = "Lv" + (Math.floor(parseInt(c.Classes[Class].Lv) / 10) + 1) + "0";
            }
            tmp = c.Classes[Class].Lv;
            html += "<span class=" + style + ">" + c.name + "</span>";
        });


    });

    $("#coreArea").html(html);
    setConfigArea();
}


/*Defferdのループ
 * jQuery.Deferredを使って非同期ループしよう！ - とあるプログラマの日記 @s025236
 *  http://d.hatena.ne.jp/s025236/20130624/p1
 */
if (jQuery) !function ($) {
    'use strict';
    if (typeof $.asyncEach === 'undefined') {
        // setTimeoutとDeferredを使い非同期にする関数
        var async = function ($callback) {
            var $dfd = $.Deferred();
            setTimeout(function () {
                $callback($dfd);
            }, 0);
            return $dfd.promise();
        };
        // $.asyncEachメソッド本体
        $.asyncEach = function ($array, $callback, $thisArg) {
            if (typeof $thisArg === 'undefined') $thisArg = $array;
            //$arrayが大量だった時に$whenを作るのに時間がかかるのでいきなり非同期化
            return async(function ($dfd) {
                //$arrayの要素を１個づつ非同期化
                var $when = $.map($array, function ($value, $index) {
                    return async(function ($dfd) {
                        return $callback.call($thisArg, $dfd, $value, $index);
                    });
                });
                //$whenが全てresolveするとdone、ひとつでもrejectするとfailする
                return $.when.apply($, $when)
                    .done(function () {
                        //argumentsを配列に変換して返す
                        var $_ = [];
                        $_.push.apply($_, arguments);
                        return $dfd.resolve($_);
                    })
                    .fail(function () {
                        var $_ = [];
                        $_.push.apply($_, arguments);
                        return $dfd.reject($_);
                    })
                    ;
            });
        };
    }
}(jQuery);

//オブジェクト用ソート
function objSort(obj, key, key2, key3, isNumber, reverse) {
    if (typeof isNumber == "undefined") isNumber = true;
    if (typeof reverse) reverse = false;

    var arr = new Array;
    $.each(obj, function (i, a) {
        arr.push(this);
    });
    if (isNumber) {
        arr.sort(compareNumbersAsc);
    } else {
        arr.sort(compareStringsAsc);
    }

    function compareNumbersAsc(a, b) {
        if (reverse) {
            return a[key][key2][key3] - b[key][key2][key3];
        } else {
            if (a[key][key2][key3] == "-") a[key][key2][key3] = 0;
            if (b[key][key2][key3] == "-") b[key][key2][key3] = 0;
            return b[key][key2][key3] - a[key][key2][key3];
        }
    }

    function compareStringsAsc(a, b) {
        return a[key] - b[key];
    }

    return arr;
}

//ヒストリツリーの開閉
$(function(){
    var tree = $(".tree");
    tree.children("ul").hide()
    tree.children("h4").click(function(){
        $(this).parent().children("ul").toggle(500);
    })

})