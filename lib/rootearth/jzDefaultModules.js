/*! jzDefaultModules - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 預設模組 */

"use strict";

// jzLogMsgTable
void function(){
    jz.logMsgTable = {
        /* 訊息表
         * 說明:
              key: 訊息代碼, val: 訊息內容
              關於 key 描述:
                  預設值: "_"
                  其他來源: "(來源)_(查找路徑)_(內容資訊)"
         */
        msgTable: {
            _undefined: 'Unexpected Not Message'
        },

        /* 設定訊息表
         * @param {Object} msgList : 訊息清單
              @param {String} 其訊息代碼[ ...] : 訊息內容
         */
        setMsg: function( objMsgList ){
            let msgTable = this.msgTable;
            for(let msgCode in objMsgList ) msgTable[ msgCode ] = objMsgList[ msgCode ];
        },

        /* 取得訊息表內容
         * @param {String} msgCode : 訊息代碼
         * @return {String} : 其訊息代碼內容 或 _undefined
         */
        getMsg: function( strMsgCode ){
            let msgTable = this.msgTable;
            return msgTable[ strMsgCode ] || msgTable['_undefined'];
        },
    };
}();


// jzLog.tem
void function(){
    jz.log = {
        remind: function( strMsgCode, anyAddition ){
            console.log( this.getMsg( strMsgCode ), anyAddition );
        },

        setMsg: function( objMsgList ){
            jz.logMsgTable.setMsg( objMsgList );
        },

        getMsg: function( strMsgCode ){
            return jz.logMsgTable.getMsg( strMsgCode );
        },
    };
}();

