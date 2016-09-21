/*! jzCmdParse - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 命令句 */

"use strict";

jz.cmdParse = new jzCmdParse;

function jzCmdParse(){
    /* 命令行傳遞的參數 argument vector
     * @self {Array} :
          @param {String} argv[ ...] : 命令行的值
     */
    this.argv = function(){
        let arrArgv = Array.prototype.concat.apply( [], process.argv );
        arrArgv.splice( 0, 1 );
        return arrArgv;
    }();

    /* 建立兩物件 this.argFlogAll this.flogCmpt
     * this.argFlogAll
          @self {Array} :
              @param {String} argFlog[ ...] : 命令行的旗標值
     * this.flogCmpt
          @self {Object} :
              @param {Array} argflog[ ...] : 命令行的旗標值
                  @param {String} argflogCompartment[ ...] : 間隔在旗標間的參數
     */
    void function(){
        let arrArgv = this.argv,
            arrArgFlogAll = [],
            objCompartment = { '_': [] },
            key_forCmpt = '_',
            regexFlog = /^-(.+)$/,
            matchFlog;

        for(let p = 1, len = arrArgv.length; p < len ; p++){
            let item = arrArgv[ p ];
            if( matchFlog = item.match( regexFlog ) ){
                arrArgFlogAll.push( matchFlog[1] );

                key_forCmpt = matchFlog[1];
                objCompartment[ key_forCmpt ] = [];
            }else{
                objCompartment[ key_forCmpt ].push( item );
            }
        }

        this.argFlogAll = arrArgFlogAll;

        this.flogCmpt = objCompartment;
    }.call( this );

    /* 是否有此參數
     * @param {String} name : 參數名稱
     * @return {Boolean} : 是否有此參數
     */
    this.isHaveArgu = function( strName ){
        return this.argv.indexOf( strName ) > 0;
    };

    /* 是否有此旗標
     * @param {String} flogName : 旗標名稱
     * @return {Boolean} : 是否有此旗標
     */
    this.isHaveFlog = function( strFlogName ){
        return this.argFlogAll.indexOf( strFlogName ) !== -1;
    };

    /* 參數帶值
     * @param {String} name : 參數名稱
     * @return {null|String} :
          若 有此參數 且 其有帶值 則為 String : 其所帶值
          否則為 null
     */
    this.arguAfter = function( strName ){
        let arrArgv = this.argv,
            index = arrArgv.indexOf( strName ),
            len_forArgv = arrArgv.length,
            anyArguAfterOne = ( index !== -1 && index + 1 < len_forArgv )? arrArgv[ index + 1 ] : null;
        return anyArguAfterOne;
    };

    /* 旗標帶值
     * @param {String} flogName : 旗標名稱
     * @return {null|String} :
          若 有此旗標 且 其有帶值 則為 String : 其所帶值
          否則為 null
     */
    this.argFlogAfter = function( strFlogName ){
        let anyFlogCmpt_forCho = this.flogCmpt[ strFlogName ],
            bisHaveVal = !!anyFlogCmpt_forCho ? !!anyFlogCmpt_forCho.length : false,
            anyFlogAfterOne = bisHaveVal ? anyFlogCmpt_forCho[0] : null;
        return anyFlogAfterOne;
    };

    /* 旗標所有帶值
     * @param {String} flogName : 旗標名稱
     * @return {null|Array} :
          若 有此旗標 且 其有帶值 則為 Array : 其所帶值
          否則為 null
     */
    this.argFlogAfterAll = function( strFlogName ){
        let anyFlogCmpt_forCho = this.flogCmpt[ strFlogName ],
            bisHaveVal = !!anyFlogCmpt_forCho ? !!anyFlogCmpt_forCho.length : false,
            anyFlogAfterAll = bisHaveVal ? anyFlogCmpt_forCho : null;
        return anyFlogAfterAll;
    };
}

