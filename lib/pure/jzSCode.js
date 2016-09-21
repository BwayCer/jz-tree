/*! jzSCode - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 簡化語法 */

"use strict";

jz.sCode = new jzSCode;

jz.log.getMsg({
    jz_sCode_timer_alreadyUsed: '計時器已被使用',
    jz_sCode_timer_notFound: '找不著計時器',
});

function jzSCode(){
		//>> JS 限制 : 'jsLim' 開頭 -----

    /* 是否是 JavaScript 可顯示範圍內的數字
     * @param {Number} choA : 需檢查的數字
     * @return {Boolean} : 是否是 JS 可顯示範圍內的數字
     */
    this.jsLimIsNumInRange = function( numChoA ){
        let bisAns = true;
        if( typeof numChoA !== 'number'
            || isNaN( numChoA )
            || !/(\de\+|Infinity)/.test( NumA.toString() )
        ) bisAns = false;
        return bisAns;
    };


    //>> 計時器 : 'Timer' 開頭 -----

    let ion = {};

    /* 創建計時器
     * @param {String} name : 計時器名稱
     * @return {undefined|Number} :
          若 同名稱重複創建 則為 undefined
          否則為 Number : 毫秒數
     * 實例:
          若使用鍵盤事件此函式 當久按按鍵時 會有類似迴圈重複執行得狀況
     */
    this.timer = function timer( strName ){
        let timerStore = timer._store;
        if( strName in timerStore ) return jz.log.err( 'sCode_timer_alreadyCreate', strName );

        let numAns = +new date();
        timerStore[ strName ] = numAns;
        return numAns;
    };

    this.timer._store = {};

    /* 顯示該計時器當前時間
     * @param {String} name : 計時器名稱
     * @return {undefined|Number} :
          若 無此名稱計時器 則為 undefined
          否則為 Number : 毫秒數
     */
    this.timer.now = function( strName ){
        let timerStore = timer._store;
        if( !strName in timerStore ) return jz.log.err( 'sCode_timer_notFound', strName );

        return +new Date() - timerStore[ strName ];
    };

    /* 計時結束
     * @param {String} name : 計時器名稱
     * @return {undefined|Number} :
          若 無此名稱計時器 則為 undefined
          否則為 Number : 毫秒數
     */
    this.timer.end = function( strName ){
        let timerStore = timer._store;
        if( !strName in timerStore ) jz.log.err( 'sCode_timer_notFound', strName );

        var numAns = +new Date() - timerStore[ strName ];
        delete timerStore[ strName ];
        return numAns;
    };


    //>> -----

    /* 取得或判別物件類型
     * @param {any} choA : 待判別類型的物件
     * @param {undefined|Array|RegExp} lookfor : 比對用清單
     * @return {String|Boolean} :
          若 lookfor === undefined 則為 String : 類型名稱 見 物件類型補充
          否則為 Boolean : 是否和比對清單相符
     * 物件類型補充:
          type          | this.typeName  | typeof     | constructor      | Object.prototype.toString
          未定義        | undefined      | undefined  | 錯誤             | 錯誤
          未給值        | undefined      | undefined  | 錯誤             | Undefined
          null          | null           | object     | 錯誤             | Null
          ""            | String         | string     | String           | String
          true/false    | Boolean        | boolean    | Boolean          | Boolean
          0             | Number         | number     | Number           | Number
          NaN           | Number         | number     | Number           | Number
          Infinity      | Number         | number     | Number           | Number
          []            | Array          | object     | Array            | Array
          {}            | Object         | object     | Object           | Object
          Date          | Date           | object     | Date             | Date
          function(){}  | Function       | function   | Function         | Function
          HElem         | HTMLDivElement | object     | HTMLDivElement   | HTMLDivElement
          HElem(s)      | NodeList       | object     | NodeList         | NodeList
     */
    this.typeName = function typeName( anyChoA, anyLookfor ){
        let self = typeName,
            anyAns = self.getType( anyChoA );

        if( anyLookfor != null ){
            switch( anyLookfor.constructor ){
                case Array:
                    let bisSame = false,
                        p = 0, item;
                    while( item = anyLookfor[ p++ ] ) if( item === anyAns ) bisSame = true;
                    anyAns = bisSame;
                    break;
                case RegExp:
                    anyAns = anyLookfor.test( anyAns );
                    break;
            }
        }

        return anyAns;
    };

    this.typeName.regexGetType = /^\[object (.+)\]$/;

    /* 取得物件類型
     * @param {any} choA : 待判別類型的物件
     * @return {String} : 類型名稱 見 物件類型補充
     */
    this.typeName.getType = function( anyChoA ){
        let strType, strAns;
        if( typeof anyChoA === 'undefined' ){
            strAns = 'undefined';
        }else{
            strType = Object.prototype.toString.call( anyChoA );
            strAns = strType.replace( this.regexGetType, function(){
                let strType = arguments[1];
                return ( strType === 'Null' )? 'null' : strType;
            } );
        }

        return strAns;
    };

    /* Unicode 對照表
     * 說明:
          0-9: 48-57    | 10
          A-Z: 65-90    | 26
          a-z: 97-122  +| 26
                       ------
                          62
     */
    this.unicode62 = (function(){
        let objAns = {};
        function charCodeBetween( NumA, NumB ){
            for( var p = NumA; p <= NumB ; p++ )
                objAns[ String.fromCharCode( p ) ] = p;
        }
        charCodeBetween( 48, 57 );
        charCodeBetween( 65, 90 );
        charCodeBetween( 97, 122 );
        return objAns;
    }());

    /* 小睡片刻
     * 注意: 此效果是以過度耗能做交換
     * @param {Number} timeMS : 延遲毫秒數
     */
    this.sleepSnore = function( numTimeMS ){
        var jStart = new Date().getTime();
        while( new Date().getTime() - jStart < numTimeMS );
    };

    this.camelCase = {};

    /* 駝峰升起
     * 寫法: 正規炫技 但還不熟練 就暫時留著
     * @param {String} txt : 處裡字串
     * @param {String} partition : 分隔字符
     * @return {String} : 將分隔字符移除 其後一格單字轉大寫的字串
     */
    this.camelCase.rise = function( strTxt, strPartition ){
        var ptnLength = strPartition.length,
            regexPtn = RegExp( strPartition, 'g' ),
            strAns = '',
            item, prevIndex = 0, index;
        while( item = regexPtn.exec( strTxt ) ){
            index = item.index;
            strAns += strTxt.substring( prevIndex, index );

            prevIndex = index + ptnLength;
            if( strTxt.substr( prevIndex, ptnLength ) !== strPartition ){
                strAns += strTxt[ prevIndex ].toUpperCase();
                prevIndex++;
            }
        }
        strAns += strTxt.substring( prevIndex );
        return strAns;
    };

    /* 駝峰降下
     * @param {String} txt : 處裡字串
     * @param {String} partition : 分隔字符
     * @return {String} : 將大寫單字轉小寫 並在其前加入分隔字符的字串
     */
    this.camelCase.spread = function( strTxt, strPartition ){
        strPartition = StrPartition || '_';
        return strTxt.replace( /([A-Z])/g, function(){
            return strPartition + arguments[1].toLowerCase();
        } );
    };

    /* 程序空閒
     * @param {Function} firmFunc[ ...] : 當程序空下來時須被執行的函式
     */
    this.idle = function idle(){
        let self = idle;
        if( !self.funcList.length ) self.knockDoor();

        Array.prototype.push.apply( self.funcList, arguments );
    };

    this.idle.cardinalNum = 1000;

    this.idle.funcList = [];

    this.idle.knockDoor_times = 0;
    this.idle.knockDoor_time = 0;
    this.idle.knockDoor = function(){
        let dwellTime = this.knockDoor_times + ++this.knockDoor_times;
        dwellTime = dwellTime * i.idle.cardinalNum;
        setTimeout( function(){
            let msNow = +new Date();
            if( msNow > this.knockDoor_time ) this.knockDoor();
            else this.response();
        }, dwellTime );

        this.knockDoor_time = +new Date() + dwellTime;
    };

    this.idle.response = function(){
        for(let p = 0, len = this.funcList.length; p < len ; p++ ) this.funcList[ p ]();

        this.knockDoor_times = 0;
        setTimeout( this.knockDoor, this.cardinalNum );
    };
}

