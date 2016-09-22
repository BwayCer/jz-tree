/*! jzLog - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 控制台紀錄簿 */

"use strict";

function jzLog(){
    /* 口述
     * @param {Number} code : 類型代碼 1 表示 jzTree.js
     * @param {any} msg[ ...]
     */
    this.tell = function( numCode ){
        let arrArgu = Array.prototype.concat.apply( ['tell'], arguments );
        this.pushMsg.apply( this, arrArgu );
    };

    /* 提醒
     * @param {String} msgCode : 訊息代碼
     * @param {undefined|String} addition : 附帶內容
     */
    this.remind = function( strMsgCode, anyAddition ){
        this.pushMsg( 'remind', strMsgCode, anyAddition );
    };

    /* 不正確執行
     * @param => 見 this.throwErr.getErrInfo
     */
    this.err = function(){
        let objErrInfo = this.throwErr.getErrArguInfo.apply( null, arguments );
        this.pushMsg( 'err', objErrInfo.msgCode, objErrInfo.addition, objErrInfo.errFunc );
    };

    /* 錯誤執行
     * @param => 見 this.throwErr.getErrInfo
     */
    this.throwErr = function(){
        let objErrInfo = this.throwErr.getErrArguInfo.apply( null, arguments );
        this.pushMsg( 'throwErr', objErrInfo.msgCode, objErrInfo.addition, objErrInfo.errFunc );
    };

    /* 取得錯誤執行的參數資訊
     * @param {String|Function} anyChoA :
          若為 String : 訊息代碼
          若為 Function : 錯誤類別函式
     * @param {any} anyChoB :
          若 anyChoA === String 則為 any : 附帶內容
          若 anyChoA === Function 則為 String : 訊息代碼
     * @param {undefined|any} anyChoC :
          若 anyChoA === String 則為 undefined
          若 anyChoA === Function 則為 any : 附帶內容
     * @return {Object} :
          @param {function} errFunc : 錯誤類別函式
          @param {String} msgCode : 訊息代碼
          @param {any} addition : 附帶內容
     */
    this.throwErr.getErrArguInfo = function( anyChoA, anyChoB, anyChoC ){
        let funcError, strMsgCode, anyAddition;
        switch( typeof anyChoA ){
            case 'string':
                funcError = Error;
                strMsgCode = anyChoA;
                anyAddition = anyChoB;
                break;
            case 'function':
                funcError = anyChoA;
                strMsgCode = anyChoB;
                anyAddition = anyChoC;
                break;
            default:
                funcError = TypeError;
                strMsgCode = '_arguTypeErr';
                anyAddition = anyChoA;
        }

        return {
            errFunc: funcError,
            msgCode: strMsgCode,
            addition: anyAddition,
        };
    };

    /* 推送訊息
     * @param {String} origName : 執行來源 'tell', 'remind', 'err', 'throwErr'
     * @param {Number|String} code : 訊息代碼
          若 strOrigName === 'tell' 則為 Number : 類型代碼
          否則為 String : 訊息代碼
     * @param {any} anyChoB :
          若 strOrigName === 'tell' 則為 any : 且之後的參數 msg[ ...] 皆為此類
          否則為 {undefined|String} : 附帶內容
     * @param {null|Function} errFunc :
          若 strOrigName === 'tell' 則為 null
          若 strOrigName === 'err', 'throwErr' 則為 Function : 錯誤類別函式
     */
    this.pushMsg = function( strOrigName, anyCode, anyChoB, anyErrFunc ){
        let msg, msg_forErrFunc;
        switch( strOrigName ){
            case 'tell':
                console.log.apply( console, arguments );
                break;
            case 'remind':
                console.log( this.getMsg( anyCode ), anyChoB );
                break;
            case 'err':
                msg = this.getMsg( anyCode );
                msg_forErrFunc = !anyChoB ? msg : [ msg, anyChoB ];
                console.error( anyErrFunc( msg_forErrFunc ) );
                break;
            case 'throwErr':
                msg = this.getMsg( anyCode );
                msg_forErrFunc = !anyChoB ? msg : [ msg, anyChoB ];
                throw anyErrFunc( msg_forErrFunc );
                break;
        }
    };
}

jzLog.prototype = jz.logMsgTable;

jz.log.setMsg({
    _undefined: '意外的空白訊息',
    _arguTypeErr: '參數類型不符',
});

jz.log = new jzLog;

