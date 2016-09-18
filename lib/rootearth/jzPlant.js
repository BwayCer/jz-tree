/*! jzPlant - Bway.Cer CC-BY-4.0 @license: bwaycer.github.io/license/CC-BY-4.0.html */
/* 植樹 */

"use strict";

//>> 控制台紀錄簿 -----

jzRequire('./jzLog');

jz.log.setMsg({
    // jzTree init
    jz_vm_needCode: '找不著虛擬環境 objInfo.code 參數',
    jz_vm_needFileName: '找不著虛擬環境 objInfo.fileName 參數',
    jz_require_fromNative: '@: 原生載入 -',
    jz_require_toOrig: '@: jzRequire orig -',
    jz_require_file: '@: jzRequire file -',
});


//>> 園丁 -----

jzRequire('./jzGardener');

