/*! jzRoute - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 路由 */

"use strict";

jz.route = jzRoute;

function jzRoute(){
    /* 路由清單
     * 格式:
          @param {Object} list :
              @param {Array} GET : 參考表 預設值見 this.register_allowType

          { GET: [...],
            POST: [...],
            HEAD: [...],
            DELETE: [...],
            PUT: [...],
            PATCH: [...] }
     */
    this.list = {};
}

jzRoute.prototype = {
    /* 登記房門
     * @return {Object} : 補助設定 HTTP Methods 的參考表
     * 說明:
          jzRoute.register()
              .head( 參考表參數 )
              .get()
              .post()
              .delete()
              .put()
              .patch()
     */
    register: function(){
        let objList = this.list,
            funcAllowType = this.register_allowType,
            objAns = {};

        [ 'head', 'get', 'post', 'delete', 'put', 'patch' ].map(function( item ){
            objAns[ item ] = function(){
                let methodName = item.toUpperCase();
                if( !objList.hasOwnProperty( methodName ) ) objList[ methodName ] = [];
                objList[ methodName ].push( funcAllowType.apply( null, arguments ) );
                return this;
            };
        });

        return objAns;
    },

    /* 審核登記
     * @param {any} cho[ ...] : 由 this.register 傳遞的參考表參數
     * @return {any} : 參考表
          @param {Boolean} isRegExLock : 門鎖是否為 RegExp 類型
          @param {String|RegExp} lock : 門鎖
          @param {Boolean} isFuncDoor : 門是否為 Function 類型
          @param {String|RegExp} door : 門
     * 說明: 可由覆蓋此函式的方式建立自己的參考表
     */
    register_allowType: function( anyLock, anyDoor ){
        let type_forLock = jz.sCode.typeName( anyLock );
        if( [ 'String', 'RegExp' ].indexOf( type_forLock ) === -1 ) jz.log.throwErr('jz_route_registerAllowType_notAllowType');

        return {
            isRegExLock: type_forLock === 'RegExp',
            lock: anyLock,
            isFuncDoor: typeof anyDoor === 'function',
            door: anyDoor,
        };
    },

    /* 路由器
     * @param {Object} request : 由 orig.http 建立的 request
     * @param {Object} response : 由 orig.http 建立的 response
     * @return {Object} own :
          @param {Object} request : 由 orig.http 建立的 request
          @param {Object} response : 由 orig.http 建立的 response
          @param {String} method : request.method 的值
          @param {Object} urlParse : orig.url.parse( URL, true ) 的值
          @param {any} cho[ ...] : 由 this.er_allowPass 添加的參數
     */
    er: function( objRequest, objResponse ){
        let objUrlParse = orig.url.parse( decodeURIComponent( objRequest.url ), true ),
            strPathName = objUrlParse.pathname;

        let objOwn = {
               request: objRequest,
               response: objResponse,
               method: objRequest.method,
               urlParse: objUrlParse,
            };

        if( this.list.hasOwnProperty( objOwn.method ) ){
            let routeList = this.list[ objOwn.method ],
                p = 0, len = routeList.length,
                item;
            while( p < len ){
                item = routeList[ p++ ];
                if( this.er_allowPass( objOwn, strPathName, item ) ) break;
            }
        }

        this.er_allowPass( strPathName, null, objOwn );

        return objOwn;
    },

    /* 驗證請求
     * @param {Object} own : 由 this.er 傳遞的 own 用於添加回傳值
     * @param {String} pathName : 請求路徑
     * @param {Object} item : 參考表 見 this.register_allowType
     * @return {Boolean} : 是否此請求符合當前參考表
     * 說明: 可由覆蓋此函式的方式建立自己的參考表
     */
    er_allowPass: function( objOwn, strPathName, objItem ){
        if( objItem === null ){
            er_loseWay( objOwn, strPathName );
            objOwn.passDoor = null;
        }

        let isPass = false;
        if( objItem.isRegExLock && objItem.lock.test( strPathName ) ) isPass = true;
        else if( !objItem.isRegExLock && objItem.lock === strPathName ) isPass = true;

        if( isPass ){
            let anyMatchPathName = objItem.isRegExLock ? strPathName.match( objItem.lock ) : null,
                anyInfo = objItem.isFuncDoor ? objItem.door( objOwn, strPathName, anyMatchPathName ) : objItem.door;

            objOwn.passDoor = {
                info: anyInfo,
                match: anyMatchPathName,
            };
        }

        return isPass;
    },

    /* 迷路導引
     * @param {Object} own : 由 this.er 傳遞的 own 用於添加回傳值
     * @param {String} pathName : 請求路徑
     * 說明: 可由覆蓋此函式的方式建立自己的參考表
     */
    er_loseWay: function( objOwn, strPathName ){
    },
};

