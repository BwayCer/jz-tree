/*! jzGardener - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 園丁
 * 工作內容: 負責打理 jzTree 園區花木事宜
      將讀取生長點 (growing point) JSON 檔資訊 其格式如下:
          [
            {
              "name": "fs",
              "classify": "orig",
              "medium": null
            },
            {
              "name": "js-yaml",
              "classify": "orig",
              "medium": null
            },
            {
              "name": "jzLog",
              "classify": "pure",
              "path": "./pure/jzLog",
              "medium": null
            },
            {
              "name": "jzSCode",
              "classify": "pure",
              "path": "./pure/jzSCode",
              "medium": [
                "log"
              ]
            }
          ]
-*/

"use strict";

jz.gardener = new jzGardener;

jz.log.setMsg({
    jz_gardener_notExistFile: '找不著生長點資訊檔',
    jz_gardener_conspecificBranch: '相同枝節覆蓋',
    jz_gardener_errClassify: 'orig 的錯誤分類',
});

function jzGardener(){
    /* 種植
     * @param {String} fileName : 生長點 JSON 檔路徑
     */
    this.plant = function( strFileName ){
        if( !orig.fs.existsSync( strFileName ) ) jz.log.throwErr( 'jz_gardener_notExistFile', strFileName );
        let strDirName = orig.path.dirname( strFileName ),
            seedlingBundle = readJSONFile( strFileName );
        cuttage( seedlingBundle, strDirName );
    };

    /* 讀取 JSON 檔
     * @param {String} fileName : 程式檔路徑
     * @return {JSON} : JSON 資訊
     */
    function readJSONFile( strFileName ){
        return JSON.parse( orig.fs.readFileSync( strFileName, 'utf8') );
    }

    let registerBranch = Object.keys( orig );

    /* 扦插枝幹
     * @param {Array} seedlingBundle : 幼苗束
     */
    function cuttage( arrSeedlingBundle, strDirName ){
        let p = 0,
            len = arrSeedlingBundle.length,
            item;
        while( p < len ){
            item = arrSeedlingBundle[ p++ ];
            if( registerBranch.indexOf( item.name ) !== -1 ) jz.log.err( 'jz_gardener_conspecificBranch', item.name );

            let isOrigClass = item.classify === 'orig',
                objRequireInfo = jzRequire( isOrigClass ? item.name : orig.path.join( strDirName, item.path ) );

            if( isOrigClass !== ( objRequireInfo.isNativeModule || objRequireInfo.isOrigClass ) )
                jz.log.err( 'jz_gardener_errClassify', item );

            if( isOrigClass ) orig[ camelCase_rise( item.name ) ] = objRequireInfo.exports;

            registerBranch.push( item.name );
        }
    }

    /* 升起駝峰
     * 用於精簡 npm 標準格式的命名 如 jz-tree => jzTree
     * @param {String} strChoA : npm 標準格式的名稱
     */
    function camelCase_rise( strChoA ){
        return strChoA.replace( camelCase_rise.regex, function(){
            return arguments[1].toUpperCase();
        } );
    }
    camelCase_rise.regex = /-([a-z])/g;
}

