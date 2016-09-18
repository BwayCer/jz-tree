/*! jzTree - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 讀者樹 */

"use strict";

//>> 初始化 ------

console.log( "//>> jzTree Initialize -----" );

module.exports = new function jzTree(){
    let jz = this,
        orig = {
            fs: require('fs'),
            path: require('path'),
            module: require('module'),
            vm: require('vm'),
            jsYaml: require('js-yaml')
        },
        my = {};


    //>> 暫時控制台 -----

    jz.log = {
        remind: function( strMsgCode, anyAddition ){
            console.log( '@: jzRequire file -', anyAddition );
        },
    };


    //>> 載入模組 -----

    /* 查找檔案完整路徑及判斷載入方法
     * @param {String} fileName : 程式檔路徑
     * @param {String} dirReferencePoint : 參考起始資料夾路徑
     * @return {Object} :
          @param {Boolean} isNativeModule : 是否為原生模組
          @param {Boolean} isOrigClass : 是否為 orig 類型
          @param {String} filename : 程式檔完整路徑
     */
    function require_pathAutoSearch( strFileName, strDirReferencePoint ){
        let funcSearchPath = require_pathAutoSearch.searchPath,
            completePath = /^\.{1,2}\//.test( strFileName ) ?
                orig.path.join( strDirReferencePoint, strFileName ) : strFileName,
            anyCompletePath = funcSearchPath( completePath ),
            class_ofOrig = !anyCompletePath;

        if( class_ofOrig ){
            let nodeModulePaths = orig.module._nodeModulePaths( strDirReferencePoint );
            for(let p = 0, len = nodeModulePaths.length; p < len ; p++){
                anyCompletePath = funcSearchPath( orig.path.join( nodeModulePaths[ p ], strFileName ) );
                if( anyCompletePath ) break;
            }
        }

        strFileName = orig.module._resolveFilename( anyCompletePath ? anyCompletePath : strFileName );

        return {
            isNativeModule: !anyCompletePath,
            isOrigClass: class_ofOrig,
            filename: strFileName
        };
    }

    /* 判斷路徑存在與否
     * @param {String} fileName : 程式檔路徑
     * @return {String|Boolean} :
          若此路徑存在為 String : 完整路徑
          否則為 Boolean : false
     */
    require_pathAutoSearch.searchPath = function( strFileName ){
        if( orig.fs.existsSync( strFileName ) && orig.fs.statSync( strFileName ).isDirectory() ){
            let codePackage,
                filePackage = strFileName + '/package.json';
            if( orig.fs.existsSync( filePackage ) ) codePackage = orig.jsYaml.safeLoad( orig.fs.readFileSync( filePackage, 'utf8') );

            strFileName += ( codePackage && codePackage.main )? '/' + codePackage.main : '/index.js';
        }else{
            strFileName = strFileName + '.js';
        }

        return orig.fs.existsSync( strFileName ) ? strFileName : false;
    };

    /* 虛擬環境
     * @param {Object} info :
          @param {String} fileName : 程式檔路徑 或 可辨識檔案的字串
          @param {String} code : 程式碼
          @param {Object} sandbox : 沙盒環境變數
     * @return {any} : module.exports 的值
     */
    jz.vm = function( objInfo ){
        if( !objInfo.code ) jz.log.throwErr('jz_vm_needCode');

        let fileName = objInfo.fileName;
        if( !fileName ){
            jz.log.err('jz_vm_needFileName');
            fileName = 'notFileName';
        }

        let objSandbox = this.vm.createSandbox( fileName, objInfo.sandbox );

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
    jz.vm.createSandbox = function( strFileName, objSeed ){
        let vmModule = { exports: {} },
            strDirname = orig.path.dirname( strFileName ),
            sandbox = Object.setPrototypeOf( {
                module: vmModule,
                exports: vmModule.exports,
                require: function( strFilename ){
                    strFilename = require_pathAutoSearch( strFilename, strDirname ).filename;
                    jz.log.remind( 'jz_require_fromNative', strFilename );
                    return require( strFilename );
                },
                __dirname: strDirname,
                __filename: strFileName
            }, global );

        for(let key in objSeed ) sandbox[ key ] = objSeed[ key ];

        return orig.vm.createContext( sandbox );
    };

    /* 載入模組
     * @param {String} fileName : 程式檔路徑
     * @param {String} dirReferencePoint : 參考起始資料夾路徑
     * @return {Object} :
          @param {Boolean} isNativeModule : 是否為原生模組
          @param {Boolean} isOrigClass : 是否為 orig 類型
          @param {String} filename : 程式檔完整路徑
          @param {any} exports : module.exports 的值
     */
    function jzRequire( strFileName, strDirReferencePoint ){
        let moduleInfo = require_pathAutoSearch( strFileName, strDirReferencePoint ),
            objAns = {
                isNativeModule: false,
                isOrigClass: false,
                filename: moduleInfo.filename,
                exports: null
            };

        if( moduleInfo.isNativeModule || moduleInfo.isOrigClass ){
            jz.log.remind( 'jz_require_toOrig', strFileName );
            objAns.isNativeModule = moduleInfo.isNativeModule;
            objAns.isOrigClass = moduleInfo.isOrigClass;
            objAns.exports = require( strFileName );
        }else{
            jz.log.remind( 'jz_require_file', objAns.filename );
            objAns.exports = jzRequire.vm(
                objAns.filename,
                orig.fs.readFileSync( objAns.filename, 'utf-8' )
            );
        }

        return objAns;
    }

    /* 虛擬環境
     * @param {String} fileName : 程式檔路徑
     * @param {String} code : 程式碼
     * @return {any} : strCode 中 module.exports 的值
     */
    jzRequire.vm = function( strFileName, strCode ){
        let self = this,
            strDirName = orig.path.dirname( strFileName ),
            jzRequire = function( strFilename ){
                return self( strFilename, strDirName );
            };

        return jz.vm({
            fileName: strFileName,
            code: strCode,
            sandbox: {
                jz: jz,
                jzRequire: jzRequire,
                orig: orig,
                my: my,
            }
        });
    };


    //>> 初次種植 -----

    //第一次的完整路徑是必要的
    jzRequire( __dirname + '/rootearth/jzPlant' );
}();

