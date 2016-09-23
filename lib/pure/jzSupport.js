/*! jzSupport - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* JS 語言支援補充 */

"use strict";

function jzSupport(){}

jzSupport.prototype = {
    /* 檢查屬性存在與否
     * @param {Object(any)} main : 檢查之物件 ( 或類物件 如: Array, Function )
     * @param {String} property : 檢查的屬性名
     * @param {String|Function} notPropCho : 無屬性時選用 見 this.check.notPropAct
     */
    check: function( objMain, strProperty, anyNotPropCho ){
        let isExistProp = this.isExistProp( objMain, strProperty );
        if( !isExistProp ) this.notPropAct( anyNotPropCho, objMain, strProperty );
    },

    /* 檢查屬性存在與否的執行排程
     * @param {Object(any)} main : 檢查之物件 ( 或類物件 如: Array, Function )
     * @param {Array} propertyList : 檢查的屬性名清單
     * @param {String|Function} notPropCho : 無屬性時選用 見 this.check.notPropAct
     */
    checkActSequence: function( objMain, arrPropertyList, anyNotPropCho ){
        for(let p = 0, len = arrPropertyList.length; p < len ; p++)
           this.check( objMain, arrPropertyList[ p ], anyNotPropCho );
    },

    /* 屬性是否存在
     * @param {Object(any)} main : 檢查之物件 ( 或類物件 如: Array, Function )
     * @param {String} property : 檢查的屬性名
     * @return {Boolean} : 屬性是否存在
     * 錯誤範例:
          以 Element.prototype.parentNode 示範
          若以 Element.prototype.parentNode 直接執行會拋出 Illegal invocation 的錯誤
          若以 Element.prototype.hasOwnProperty('parentNode') 則會回傳 false 的判斷錯誤
     */
    isExistProp: function( objMain, strProperty ){
        return strProperty in objMain;
    },

    /* 屬性不存在時執行
     * @param {String|Function} notPropCho :
          若為 String :
              拋出錯誤 throw Error( notPropCho )
              指定關鍵字:
                  "%main" : main.toString().replace( /\[(.+)\]/, '$1' ) )
                  "%method" : 屬性名稱
          若為 Function : 執行 notPropCho( main, property )
     * @param {Object(any)} main : 檢查之物件 ( 或類物件 如: Array, Function )
     * @param {String} property : 檢查的屬性名
     */
    notPropAct: function( anyNotPropCho, objMain, strProperty ){
        switch( typeof anyNotPropCho ){
            case 'string':
                throw Error( anyNotPropCho
                    .replace( /%main/g, objMain.toString().replace( /\[(.+)\]/, '$1' ) )
                    .replace( /%method/g, strProperty )
                );
                break;
            case 'function':
                anyNotPropCho( objMain, strProperty );
                break;
        }
    },

    /* 檢查屬性
     * @param {Array|Object(any)} anyChoA :
          若 arguments.length === 2 則為 Array :
              @param {Array} list[ ...] : ( 集合體 )
                  @param {Object(any)} : 檢查之物件 ( 或類物件 如: Function )
                  @param {Array} : 檢查的屬性名清單
              範例:
                  [
                    [ String.prototype, [
                        'toString', 'match', 'replace',
                    ] ],
                    [ Array.prototype, [
                        'push', 'concat', 'join',
                    ] ],
                  ]
          若 arguments.length === 3 則為 Object : 檢查之物件 ( 或類物件 如: Function )
     * @param {Object} anyChoB :
          若 arguments.length === 2 則為 {String|Function} notPropCho : 無屬性時選用 見 this.check.notPropAct
          若 arguments.length === 3 則為 Array : 檢查的屬性名清單
     * @param {undefined|String|Function} anyChoC :
          若 arguments.length === 2 則為 undefined
          若 arguments.length === 3 則為 {String|Function} notPropCho : 無屬性時選用 見 this.check.notPropAct
     * @return {Object} self
     */
    checkProp: function( anyChoA, anyChoB, anyChoC ){
        let objMain, arrCheckPropList, anyNotPropCho;
        switch( arguments.length ){
            case 2:
                anyNotPropCho = anyChoB;

                let item;
                for(let p = 0, len = anyChoA.length; p < len ; p++){
                    item = arrCheckList[ p ];
                    objMain = item[0];
                    arrCheckPropList = item[1];
                    this.checkActSequence( objMain, arrCheckPropList, anyNotPropCho );
                }

                break;
            case 3:
                objMain = anyChoA;
                arrCheckPropList = anyChoB;
                anyNotPropCho = anyChoC;
                this.checkActSequence( objMain, arrCheckPropList, anyNotPropCho );
                break;
        }
        return this;
    },

    /* 增加屬性
     * @param {Object|(any)} main : 檢查之物件 ( 或類物件 如: Function )
     * @param {Object} propList : 補充的屬性清單
     * @return {Object} self
     */
    addProp: function( objMain, arrPropList ){
        let self = this;
        this.checkActSequence( objMain, Object.keys( arrPropList ), function( objMain, strProperty ){
            let anyPropVal = arrPropList[ strProperty ],
                anyPropValClassify = self.addProp_classify( anyPropVal );

            let descriptor = {};
            switch( anyPropValClassify ){
                case 'setter':
                    descriptor.set = anyPropVal.set;
                    break;
                case 'getter':
                    descriptor.set = anyPropVal.get;
                    break;
                case 'both':
                    descriptor.set = anyPropVal.set;
                    descriptor.set = anyPropVal.get;
                    break;
                default:
                    descriptor.value = anyPropVal;
                    descriptor.writable = true;
            }
            descriptor.enumerable = true;
            descriptor.configurable = true;

            Object.defineProperty( objMain, strProperty, descriptor );
        } );
        return this;
    },

    /* 屬性值分類
     * @param {any} propVal : 屬性值
     * @return {null|String} propValClassify :
          if propValClassify === null : 使用者賦值
          if propValClassify === "setter" : setter 類型
          if propValClassify === "getter" : getter 類型
          if propValClassify === "both" : setter & getter 類型
     */
    addProp_classify: function( anyPropVal ){
        let anyAns = null;
        if( anyPropVal.constructor === Object ){
            let arrPropNameList = Object.keys( anyPropVal ),
                isHaveSetter = arrPropNameList.indexOf('set') !== -1,
                isHaveGetter = arrPropNameList.indexOf('get') !== -1;

            if( arrPropNameList.length === 2 && isHaveSetter && isHaveGetter ) anyAns = 'both';
            else if( arrPropNameList.length === 1 && isHaveSetter ) anyAns = 'setter';
            else if( arrPropNameList.length === 1 && isHaveGetter ) anyAns = 'getter';
        }
        return anyAns;
    },

    /* 客製化屬性
     * @param {Object|(any)} main : 檢查之物件 ( 或類物件 如: Function )
     * @param {Object} propList : 補充的屬性清單
     * @return {Object} self
     */
    customProp: function( objMain, arrPropList ){
        this.checkActSequence( objMain, Object.keys( arrPropList ), function( objMain, strProperty ){
            arrPropList[ strProperty ]( objMain, strProperty );
        } );
        return this;
    },
};

jz.support = new jzSupport;

jz.support
    .checkProp( Object, [ 'defineProperty' ], 'JS Run Platform Not Support。（ %main.%method ）' )
    .addProp( String.prototype, {
        repeat: function( count ){
            count = parseInt( count );
            if( count < 0 ) throw RangeError('Invalid count value');
            let strOrigTxt = this,
                strAns = '';
            for(let p = 0; p < count ; p++) strAns += strOrigTxt;
            return strAns;
        },
    } )
    .addProp( Array.prototype, {
        map: function( jCallback ){
            for(let p = 0, jItem; jItem = this[ p ] ; p++)
                jCallback( jItem, p, this );
        },
    } )
    .addProp( Function.prototype, {
        extend: function( jPropList ){
            for(let jMethod in jPropList )
                this.prototype[ jMethod ] = jPropList[ jMethod ];
        },
    } )
;

