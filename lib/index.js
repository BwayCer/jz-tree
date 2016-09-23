/*! jzTree - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 讀者樹 */

"use strict";

//>> 初始化 ------

console.log( "//>> jzTree Initialize -----" );

//require 對同一檔案只會載入一次 所以後續添加的都不在上面
module.exports = new function jzTree(){
    let jz = this,
        orig = {
            path: require('path'),
            fs: require('fs'),
            vm: require('vm'),
            module: require('module'),
        },
        my = {};


    //>> 載入模組 -----

    jz.module = {};

    /* 載入運行
     * @param {String} fileName : 程式檔路徑
     * @param {String} dirReferencePoint : 參考起始資料夾路徑
     * @return {Object} :
          @param {Boolean} isNativeModule : 是否為原生模組
          @param {Boolean} isOrigClass : 是否為 orig 類型
          @param {String} filename : 程式檔完整路徑
          @param {any} exports : module.exports 的值
     */
    jz.module.run = function( strFileName, strDirReferencePoint ){
        let objAns = this.searchPath( strFileName, strDirReferencePoint ),
            strFileExt = orig.path.extname( objAns.filename );

        objAns.exports = null;

        if( objAns.isNativeModule || objAns.isOrigClass ){
            jz.log.remind( 'jz_require_toOrig', objAns.filename );
            objAns.exports = require( objAns.filename );
        }else{
            jz.log.remind( 'jz_require_file', objAns.filename );
            switch( strFileExt ){
                case '.js':
                    objAns.exports = this.vm_forJz(
                        jz,
                        my,
                        orig.fs.readFileSync( objAns.filename, 'utf-8' ),
                        objAns.filename,
                        require
                    );
                    break;
                case '.json':
                    objAns.exports = this.readJSON( objAns.filename );
                    break;
                case '.node':
                    break;
            }
        }

        return objAns;
    };

    /* 是否為原生模組
     * @param {String} ModuleName : 模組名稱
     * @return {Boolean} : 是否為原生模組
     */
    jz.module.isNativeModule = function( strModuleName ){
        return this.NativeModuleList.indexOf( strModuleName ) !== -1;
    };

    /* 原生模組清單
     * 說明:
          見 https://cnodejs.org/topic/55b044399594740e76ab3e91
          見 http://itbilu.com/nodejs/core/N1tv0Pgd-.html
          從 process.moduleLoadList 中提取 NativeModule 為前綴的字串
     * 函式補充:
          orig.module._resolveFilename: 判斷檔案是否存在 (含原生模組) 並取得檔案絕對路徑
              @param {String} request : 詢問的檔案路徑 (絕對 相對皆可)
              @param {?} parent
              @param {?} isMain
              @throw if 路徑錯誤
              @return {String} : 由參考點開始 並沿父層向上的 node_module 目錄路徑
          orig.module._resolveLookupPaths
              orig.module._resolveFilename 下的一個函式 原以為如同 orig.module._nodeModulePaths
              但並非如此 也不知如何使用
     */
    jz.module.NativeModuleList = function( arrDefaultList ){
        let arrModuleLoadList = process.moduleLoadList,
            regexIsNativeModule = /NativeModule (\S+)/,
            arrAns = arrDefaultList || [];

        for(let p = 0, len = arrModuleLoadList.length; p < len ; p++){
            let item = arrModuleLoadList[ p ],
                matchNativeModule = item.match( regexIsNativeModule );
            if( !!matchNativeModule ) arrAns.push( matchNativeModule[1] );
        }

        return arrAns;
    }([ 'constants',
        'http', 'https', 'url', 'os', 'child_process', 'zlib',
        'tls', 'dgram', 'cluster', 'crypto', 'string_decoder' ]);

    /* 讀取 JSON
     * @param {String} fileName : 程式檔路徑
     * @return {JSON}
     */
    jz.module.readJSON = function( strFileName ){
        return orig.fs.existsSync( strFileName ) ? JSON.parse( orig.fs.readFileSync( strFileName, 'utf8' ) ) : null;
    };

    /* 查找檔案完整路徑及判斷載入方法
     * @param {String} fileName : 程式檔路徑
     * @param {String} dirReferencePoint : 參考起始資料夾路徑
     * @return {Object} :
          @param {Boolean} isNativeModule : 是否為原生模組
          @param {Boolean} isOrigClass : 是否為 orig 類型
          @param {String} filename : 程式檔完整路徑
     * 函式補充:
          見 http://www.ruanyifeng.com/blog/2015/05/require.html
          orig.module._nodeModulePaths: 取得模組可能路徑位置
              @param {String} from : 參考的目錄路徑起始點 (絕對 相對皆可)
              @return {Array} : 由參考點開始 並沿父層向上的 node_module 目錄路徑
     */
    jz.module.searchPath = function( strFileName, strDirReferencePoint ){
        let bisNativeModule = false,
            bisClassOfOrig = false,
            anyCompletePath;

        if( this.isNativeModule( strFileName ) ){
            bisNativeModule = true;
            bisClassOfOrig = true;
            anyCompletePath = strFileName;
        }else{
            let funcGuessFileName = this.searchPath_guessFilePath.bind( this );

            if( /^\.{0,2}\//.test( strFileName ) ){
                bisNativeModule = false;
                bisClassOfOrig = false;
                let fileNameTem = /^\//.test( strFileName ) ? strFileName : orig.path.join( strDirReferencePoint, strFileName );
                anyCompletePath = funcGuessFileName( fileNameTem );
            }else{
                bisNativeModule = false;
                bisClassOfOrig = true;

                let arrNodeModulePaths = orig.module._nodeModulePaths( strDirReferencePoint );
                for(let p = 0, len = arrNodeModulePaths.length; p < len ; p++){
                    anyCompletePath = funcGuessFileName( orig.path.join( arrNodeModulePaths[ p ], strFileName ) );
                    if( !!anyCompletePath ) break;
                }
            }
        }

        if( !anyCompletePath ) jz.log.throwErr( 'jz_require_notFindModule', strFileName );

        return {
            isNativeModule: bisNativeModule,
            isOrigClass: bisClassOfOrig,
            filename: anyCompletePath,
        };
    };

    /* 猜測檔案路徑位置
     * @param {String} fileName : 程式檔路徑
     * @return {String|Boolean} :
          若此路徑存在為 String : 完整路徑
          否則為 null
     */
    jz.module.searchPath_guessFilePath = function( strFileName ){
        let isExistsFile = orig.fs.existsSync( strFileName ),
            isDirectory = isExistsFile ? orig.fs.statSync( strFileName ).isDirectory() : null,
            funcGuessFileExt = this.searchPath_guessFileExt;

        if( isDirectory ){
            let packagePath = orig.path.join( strFileName, 'package.json' ),
                bisHavePackageMain = false;

            if( orig.fs.existsSync( packagePath ) ){
                let jsonPackage = this.readJSON( packagePath );
                bisHavePackageMain = !!jsonPackage.main;
            }

            strFileName = orig.path.join( strFileName, bisHavePackageMain ? codePackage.main : 'index' );

            if( bisHavePackageMain ) return orig.fs.existsSync( strFileName ) ? strFileName : null;
        }

        return funcGuessFileExt( strFileName );
    };

    /* 猜測副檔名
     * @param {String} fileName : 程式檔路徑
     * @return {null|String} :
          若此路徑存在為 String : 完整路徑
          否則為 null
     */
    jz.module.searchPath_guessFileExt = function( strFileName ){
        let guessFileName,
            possibleList = [ '', '.js', '.json', '.node' ];

        for(let p = 0, len = possibleList.length; p < len ; p++){
            guessFileName = strFileName + possibleList[ p ];
            if( orig.fs.existsSync( guessFileName ) ) return guessFileName;
        }

        return null;
    };

    /* 虛擬環境
     * @param {Object} info :
          @param {String} fileName : 程式檔路徑 或 可辨識檔案的字串
          @param {String} code : 程式碼
          @param {Object} sandbox : 沙盒環境變數
     * @return {any} : module.exports 的值
     */
    jz.module.vm = function( objInfo ){
        if( !objInfo.code ) jz.log.throwErr('jz_vm_needCode');

        let fileName = objInfo.fileName;
        if( !fileName ){
            jz.log.err('jz_vm_needFileName');
            fileName = 'notFileName';
        }

        let objSandbox = this.vm_createSandbox( fileName, objInfo.sandbox );

        orig.vm.runInContext( objInfo.code, objSandbox, {
            filename: fileName,
            displayErrors: true,
            timeout: 1000,
        } );

        return objSandbox.module.exports;
    };

    /* 創建沙盒
     * @param {String} fileName : 程式檔路徑
     * @param {Object} seed : 創建沙盒的種子
          @param {any} 沙盒全域參數[ ...] : 參數物件
     * @return {Object} : orig.vm.createContext 沙盒化的 Object
     */
    jz.module.vm_createSandbox = function( strFileName, objSeed ){
        let self = this,
            vmModule = { exports: {} },
            strDirname = orig.path.dirname( strFileName ),
            sandbox = Object.setPrototypeOf( {
                module: vmModule,
                exports: vmModule.exports,
                require: function( strFilename ){
                    strFilename = self.searchPath( strFilename, strDirname ).filename;
                    jz.log.remind( 'jz_require_fromNative', strFilename );
                    return require( strFilename );
                },
                __dirname: strDirname,
                __filename: strFileName
            }, global );

        for(let key in objSeed ) sandbox[ key ] = objSeed[ key ];

        return orig.vm.createContext( sandbox );
    };

    /* jz 虛擬環境
     * @param {String} fileName : 程式檔路徑
     * @param {String} code : 程式碼
     * @return {any} : strCode 中 module.exports 的值
     * 見 https://gist.github.com/ixti/950107 問題
        jz.module.vm_forJz = function( strFileName, strCode ){
            let self = this,
                strDirName = orig.path.dirname( strFileName ),
                jzRequire = function( strFilename ){
                    return self.run( strFilename, strDirName );
                };

            return this.vm({
                fileName: strFileName,
                code: strCode,
                sandbox: {
                    jz: jz,
                    jzRequire: jzRequire,
                    orig: orig,
                    my: my,
                    'String': String,
                    'Object': Object,
                }
            });
        };
     */
    jz.module.vm_forJz = function( jz, my ){
        let __filename = arguments[3],
            __dirname = orig.path.dirname( __filename ),
            NativeModuleRequire = arguments[4],
            require = function( strFilename ){
                strFilename = jz.module.searchPath( strFilename, __dirname ).filename;
                jz.log.remind( 'jz_require_fromNative', strFilename );
                return NativeModuleRequire( strFilename );
            },
            jzRequire = function( strFilename ){
                return jz.module.run( strFilename, __dirname );
            };

        eval( arguments[2] );
    };

    /* 虛擬環境開放使用
     * 見 jz.module.vm
     */
    jz.vm = function( objInfo ){
        this.module.vm( objInfo );
    };


    //>> 初次種植 -----
    jz.module.vm_forJz(
        jz,
        my,
        orig.fs.readFileSync( orig.path.join( __dirname, 'rootearth/jzDefaultModules.js'), 'utf-8' ),
        'jzDefault Modules',
        require
    );
    jz.log.setMsg( jz.module.readJSON( orig.path.join( __dirname, 'rootearth/jzLogMsg.json' ) ) );

    jz.log.remind( 'jz_require_toOrig', 'path' );
    jz.log.remind( 'jz_require_toOrig', 'fs' );
    jz.log.remind( 'jz_require_toOrig', 'vm' );
    jz.log.remind( 'jz_require_toOrig', 'module' );

    jz.module.run( './rootearth/jzPlant.js', __dirname );
    jz.gardener.plant( orig.path.join( __dirname, 'growingPoint.json' ) );
}();

