(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("ExammaRay", [], factory);
	else if(typeof exports === 'object')
		exports["ExammaRay"] = factory();
	else
		root["ExammaRay"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 3044:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/*\n\ngithub.com style (c) Vasily Polovnyov <vast@whiteants.net>\n\n*/\n\n.hljs {\n  display: block;\n  overflow-x: auto;\n  padding: 0.5em;\n  color: #333;\n  background: #f8f8f8;\n}\n\n.hljs-comment,\n.hljs-quote {\n  color: #998;\n  font-style: italic;\n}\n\n.hljs-keyword,\n.hljs-selector-tag,\n.hljs-subst {\n  color: #333;\n  font-weight: bold;\n}\n\n.hljs-number,\n.hljs-literal,\n.hljs-variable,\n.hljs-template-variable,\n.hljs-tag .hljs-attr {\n  color: #008080;\n}\n\n.hljs-string,\n.hljs-doctag {\n  color: #d14;\n}\n\n.hljs-title,\n.hljs-section,\n.hljs-selector-id {\n  color: #900;\n  font-weight: bold;\n}\n\n.hljs-subst {\n  font-weight: normal;\n}\n\n.hljs-type,\n.hljs-class .hljs-title {\n  color: #458;\n  font-weight: bold;\n}\n\n.hljs-tag,\n.hljs-name,\n.hljs-attribute {\n  color: #000080;\n  font-weight: normal;\n}\n\n.hljs-regexp,\n.hljs-link {\n  color: #009926;\n}\n\n.hljs-symbol,\n.hljs-bullet {\n  color: #990073;\n}\n\n.hljs-built_in,\n.hljs-builtin-name {\n  color: #0086b3;\n}\n\n.hljs-meta {\n  color: #999;\n  font-weight: bold;\n}\n\n.hljs-deletion {\n  background: #fdd;\n}\n\n.hljs-addition {\n  background: #dfd;\n}\n\n.hljs-emphasis {\n  font-style: italic;\n}\n\n.hljs-strong {\n  font-weight: bold;\n}\n", "",{"version":3,"sources":["webpack://./node_modules/highlight.js/styles/github.css"],"names":[],"mappings":"AAAA;;;;CAIC;;AAED;EACE,cAAc;EACd,gBAAgB;EAChB,cAAc;EACd,WAAW;EACX,mBAAmB;AACrB;;AAEA;;EAEE,WAAW;EACX,kBAAkB;AACpB;;AAEA;;;EAGE,WAAW;EACX,iBAAiB;AACnB;;AAEA;;;;;EAKE,cAAc;AAChB;;AAEA;;EAEE,WAAW;AACb;;AAEA;;;EAGE,WAAW;EACX,iBAAiB;AACnB;;AAEA;EACE,mBAAmB;AACrB;;AAEA;;EAEE,WAAW;EACX,iBAAiB;AACnB;;AAEA;;;EAGE,cAAc;EACd,mBAAmB;AACrB;;AAEA;;EAEE,cAAc;AAChB;;AAEA;;EAEE,cAAc;AAChB;;AAEA;;EAEE,cAAc;AAChB;;AAEA;EACE,WAAW;EACX,iBAAiB;AACnB;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;AACpB;;AAEA;EACE,iBAAiB;AACnB","sourcesContent":["/*\n\ngithub.com style (c) Vasily Polovnyov <vast@whiteants.net>\n\n*/\n\n.hljs {\n  display: block;\n  overflow-x: auto;\n  padding: 0.5em;\n  color: #333;\n  background: #f8f8f8;\n}\n\n.hljs-comment,\n.hljs-quote {\n  color: #998;\n  font-style: italic;\n}\n\n.hljs-keyword,\n.hljs-selector-tag,\n.hljs-subst {\n  color: #333;\n  font-weight: bold;\n}\n\n.hljs-number,\n.hljs-literal,\n.hljs-variable,\n.hljs-template-variable,\n.hljs-tag .hljs-attr {\n  color: #008080;\n}\n\n.hljs-string,\n.hljs-doctag {\n  color: #d14;\n}\n\n.hljs-title,\n.hljs-section,\n.hljs-selector-id {\n  color: #900;\n  font-weight: bold;\n}\n\n.hljs-subst {\n  font-weight: normal;\n}\n\n.hljs-type,\n.hljs-class .hljs-title {\n  color: #458;\n  font-weight: bold;\n}\n\n.hljs-tag,\n.hljs-name,\n.hljs-attribute {\n  color: #000080;\n  font-weight: normal;\n}\n\n.hljs-regexp,\n.hljs-link {\n  color: #009926;\n}\n\n.hljs-symbol,\n.hljs-bullet {\n  color: #990073;\n}\n\n.hljs-built_in,\n.hljs-builtin-name {\n  color: #0086b3;\n}\n\n.hljs-meta {\n  color: #999;\n  font-weight: bold;\n}\n\n.hljs-deletion {\n  background: #fdd;\n}\n\n.hljs-addition {\n  background: #dfd;\n}\n\n.hljs-emphasis {\n  font-style: italic;\n}\n\n.hljs-strong {\n  font-weight: bold;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 9606:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1667);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _fonts_KaTeX_AMS_Regular_woff2__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2501);
/* harmony import */ var _fonts_KaTeX_AMS_Regular_woff__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(842);
/* harmony import */ var _fonts_KaTeX_AMS_Regular_ttf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8);
/* harmony import */ var _fonts_KaTeX_Caligraphic_Bold_woff2__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1530);
/* harmony import */ var _fonts_KaTeX_Caligraphic_Bold_woff__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1344);
/* harmony import */ var _fonts_KaTeX_Caligraphic_Bold_ttf__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(909);
/* harmony import */ var _fonts_KaTeX_Caligraphic_Regular_woff2__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(5998);
/* harmony import */ var _fonts_KaTeX_Caligraphic_Regular_woff__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(8677);
/* harmony import */ var _fonts_KaTeX_Caligraphic_Regular_ttf__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(8821);
/* harmony import */ var _fonts_KaTeX_Fraktur_Bold_woff2__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(2668);
/* harmony import */ var _fonts_KaTeX_Fraktur_Bold_woff__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(1891);
/* harmony import */ var _fonts_KaTeX_Fraktur_Bold_ttf__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(383);
/* harmony import */ var _fonts_KaTeX_Fraktur_Regular_woff2__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(2089);
/* harmony import */ var _fonts_KaTeX_Fraktur_Regular_woff__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(8489);
/* harmony import */ var _fonts_KaTeX_Fraktur_Regular_ttf__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(9398);
/* harmony import */ var _fonts_KaTeX_Main_Bold_woff2__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(2790);
/* harmony import */ var _fonts_KaTeX_Main_Bold_woff__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(4746);
/* harmony import */ var _fonts_KaTeX_Main_Bold_ttf__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(7229);
/* harmony import */ var _fonts_KaTeX_Main_BoldItalic_woff2__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(4701);
/* harmony import */ var _fonts_KaTeX_Main_BoldItalic_woff__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(6939);
/* harmony import */ var _fonts_KaTeX_Main_BoldItalic_ttf__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(3882);
/* harmony import */ var _fonts_KaTeX_Main_Italic_woff2__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(2889);
/* harmony import */ var _fonts_KaTeX_Main_Italic_woff__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(6999);
/* harmony import */ var _fonts_KaTeX_Main_Italic_ttf__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(635);
/* harmony import */ var _fonts_KaTeX_Main_Regular_woff2__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(5343);
/* harmony import */ var _fonts_KaTeX_Main_Regular_woff__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(1103);
/* harmony import */ var _fonts_KaTeX_Main_Regular_ttf__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(8843);
/* harmony import */ var _fonts_KaTeX_Math_BoldItalic_woff2__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(397);
/* harmony import */ var _fonts_KaTeX_Math_BoldItalic_woff__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(55);
/* harmony import */ var _fonts_KaTeX_Math_BoldItalic_ttf__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(4990);
/* harmony import */ var _fonts_KaTeX_Math_Italic_woff2__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(7656);
/* harmony import */ var _fonts_KaTeX_Math_Italic_woff__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(9894);
/* harmony import */ var _fonts_KaTeX_Math_Italic_ttf__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(5015);
/* harmony import */ var _fonts_KaTeX_SansSerif_Bold_woff2__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(7185);
/* harmony import */ var _fonts_KaTeX_SansSerif_Bold_woff__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(7667);
/* harmony import */ var _fonts_KaTeX_SansSerif_Bold_ttf__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(7098);
/* harmony import */ var _fonts_KaTeX_SansSerif_Italic_woff2__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(565);
/* harmony import */ var _fonts_KaTeX_SansSerif_Italic_woff__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(1783);
/* harmony import */ var _fonts_KaTeX_SansSerif_Italic_ttf__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(4048);
/* harmony import */ var _fonts_KaTeX_SansSerif_Regular_woff2__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(5152);
/* harmony import */ var _fonts_KaTeX_SansSerif_Regular_woff__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(8571);
/* harmony import */ var _fonts_KaTeX_SansSerif_Regular_ttf__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(2055);
/* harmony import */ var _fonts_KaTeX_Script_Regular_woff2__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(7165);
/* harmony import */ var _fonts_KaTeX_Script_Regular_woff__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(9261);
/* harmony import */ var _fonts_KaTeX_Script_Regular_ttf__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(3899);
/* harmony import */ var _fonts_KaTeX_Size1_Regular_woff2__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(7296);
/* harmony import */ var _fonts_KaTeX_Size1_Regular_woff__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(2927);
/* harmony import */ var _fonts_KaTeX_Size1_Regular_ttf__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(8406);
/* harmony import */ var _fonts_KaTeX_Size2_Regular_woff2__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(5619);
/* harmony import */ var _fonts_KaTeX_Size2_Regular_woff__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(5031);
/* harmony import */ var _fonts_KaTeX_Size2_Regular_ttf__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(3007);
/* harmony import */ var _fonts_KaTeX_Size3_Regular_woff2__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(1047);
/* harmony import */ var _fonts_KaTeX_Size3_Regular_woff__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(1215);
/* harmony import */ var _fonts_KaTeX_Size3_Regular_ttf__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(8095);
/* harmony import */ var _fonts_KaTeX_Size4_Regular_woff2__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(5909);
/* harmony import */ var _fonts_KaTeX_Size4_Regular_woff__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(3213);
/* harmony import */ var _fonts_KaTeX_Size4_Regular_ttf__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(1927);
/* harmony import */ var _fonts_KaTeX_Typewriter_Regular_woff2__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(9535);
/* harmony import */ var _fonts_KaTeX_Typewriter_Regular_woff__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(5145);
/* harmony import */ var _fonts_KaTeX_Typewriter_Regular_ttf__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(945);
// Imports































































var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_AMS_Regular_woff2__WEBPACK_IMPORTED_MODULE_3__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_AMS_Regular_woff__WEBPACK_IMPORTED_MODULE_4__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_AMS_Regular_ttf__WEBPACK_IMPORTED_MODULE_5__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Caligraphic_Bold_woff2__WEBPACK_IMPORTED_MODULE_6__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_4___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Caligraphic_Bold_woff__WEBPACK_IMPORTED_MODULE_7__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_5___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Caligraphic_Bold_ttf__WEBPACK_IMPORTED_MODULE_8__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_6___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Caligraphic_Regular_woff2__WEBPACK_IMPORTED_MODULE_9__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_7___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Caligraphic_Regular_woff__WEBPACK_IMPORTED_MODULE_10__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_8___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Caligraphic_Regular_ttf__WEBPACK_IMPORTED_MODULE_11__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_9___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Fraktur_Bold_woff2__WEBPACK_IMPORTED_MODULE_12__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_10___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Fraktur_Bold_woff__WEBPACK_IMPORTED_MODULE_13__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_11___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Fraktur_Bold_ttf__WEBPACK_IMPORTED_MODULE_14__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_12___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Fraktur_Regular_woff2__WEBPACK_IMPORTED_MODULE_15__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_13___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Fraktur_Regular_woff__WEBPACK_IMPORTED_MODULE_16__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_14___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Fraktur_Regular_ttf__WEBPACK_IMPORTED_MODULE_17__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_15___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Bold_woff2__WEBPACK_IMPORTED_MODULE_18__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_16___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Bold_woff__WEBPACK_IMPORTED_MODULE_19__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_17___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Bold_ttf__WEBPACK_IMPORTED_MODULE_20__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_18___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_BoldItalic_woff2__WEBPACK_IMPORTED_MODULE_21__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_19___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_BoldItalic_woff__WEBPACK_IMPORTED_MODULE_22__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_20___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_BoldItalic_ttf__WEBPACK_IMPORTED_MODULE_23__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_21___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Italic_woff2__WEBPACK_IMPORTED_MODULE_24__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_22___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Italic_woff__WEBPACK_IMPORTED_MODULE_25__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_23___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Italic_ttf__WEBPACK_IMPORTED_MODULE_26__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_24___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Regular_woff2__WEBPACK_IMPORTED_MODULE_27__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_25___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Regular_woff__WEBPACK_IMPORTED_MODULE_28__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_26___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Main_Regular_ttf__WEBPACK_IMPORTED_MODULE_29__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_27___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Math_BoldItalic_woff2__WEBPACK_IMPORTED_MODULE_30__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_28___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Math_BoldItalic_woff__WEBPACK_IMPORTED_MODULE_31__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_29___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Math_BoldItalic_ttf__WEBPACK_IMPORTED_MODULE_32__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_30___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Math_Italic_woff2__WEBPACK_IMPORTED_MODULE_33__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_31___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Math_Italic_woff__WEBPACK_IMPORTED_MODULE_34__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_32___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Math_Italic_ttf__WEBPACK_IMPORTED_MODULE_35__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_33___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Bold_woff2__WEBPACK_IMPORTED_MODULE_36__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_34___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Bold_woff__WEBPACK_IMPORTED_MODULE_37__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_35___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Bold_ttf__WEBPACK_IMPORTED_MODULE_38__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_36___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Italic_woff2__WEBPACK_IMPORTED_MODULE_39__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_37___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Italic_woff__WEBPACK_IMPORTED_MODULE_40__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_38___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Italic_ttf__WEBPACK_IMPORTED_MODULE_41__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_39___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Regular_woff2__WEBPACK_IMPORTED_MODULE_42__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_40___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Regular_woff__WEBPACK_IMPORTED_MODULE_43__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_41___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_SansSerif_Regular_ttf__WEBPACK_IMPORTED_MODULE_44__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_42___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Script_Regular_woff2__WEBPACK_IMPORTED_MODULE_45__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_43___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Script_Regular_woff__WEBPACK_IMPORTED_MODULE_46__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_44___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Script_Regular_ttf__WEBPACK_IMPORTED_MODULE_47__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_45___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size1_Regular_woff2__WEBPACK_IMPORTED_MODULE_48__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_46___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size1_Regular_woff__WEBPACK_IMPORTED_MODULE_49__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_47___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size1_Regular_ttf__WEBPACK_IMPORTED_MODULE_50__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_48___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size2_Regular_woff2__WEBPACK_IMPORTED_MODULE_51__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_49___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size2_Regular_woff__WEBPACK_IMPORTED_MODULE_52__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_50___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size2_Regular_ttf__WEBPACK_IMPORTED_MODULE_53__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_51___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size3_Regular_woff2__WEBPACK_IMPORTED_MODULE_54__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_52___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size3_Regular_woff__WEBPACK_IMPORTED_MODULE_55__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_53___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size3_Regular_ttf__WEBPACK_IMPORTED_MODULE_56__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_54___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size4_Regular_woff2__WEBPACK_IMPORTED_MODULE_57__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_55___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size4_Regular_woff__WEBPACK_IMPORTED_MODULE_58__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_56___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Size4_Regular_ttf__WEBPACK_IMPORTED_MODULE_59__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_57___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Typewriter_Regular_woff2__WEBPACK_IMPORTED_MODULE_60__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_58___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Typewriter_Regular_woff__WEBPACK_IMPORTED_MODULE_61__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_59___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_fonts_KaTeX_Typewriter_Regular_ttf__WEBPACK_IMPORTED_MODULE_62__/* .default */ .Z);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "@font-face{font-family:KaTeX_AMS;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Caligraphic;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_4___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_5___ + ") format(\"truetype\");font-weight:700;font-style:normal}@font-face{font-family:KaTeX_Caligraphic;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_6___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_7___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_8___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Fraktur;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_9___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_10___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_11___ + ") format(\"truetype\");font-weight:700;font-style:normal}@font-face{font-family:KaTeX_Fraktur;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_12___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_13___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_14___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Main;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_15___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_16___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_17___ + ") format(\"truetype\");font-weight:700;font-style:normal}@font-face{font-family:KaTeX_Main;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_18___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_19___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_20___ + ") format(\"truetype\");font-weight:700;font-style:italic}@font-face{font-family:KaTeX_Main;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_21___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_22___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_23___ + ") format(\"truetype\");font-weight:400;font-style:italic}@font-face{font-family:KaTeX_Main;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_24___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_25___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_26___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Math;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_27___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_28___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_29___ + ") format(\"truetype\");font-weight:700;font-style:italic}@font-face{font-family:KaTeX_Math;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_30___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_31___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_32___ + ") format(\"truetype\");font-weight:400;font-style:italic}@font-face{font-family:\"KaTeX_SansSerif\";src:url(" + ___CSS_LOADER_URL_REPLACEMENT_33___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_34___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_35___ + ") format(\"truetype\");font-weight:700;font-style:normal}@font-face{font-family:\"KaTeX_SansSerif\";src:url(" + ___CSS_LOADER_URL_REPLACEMENT_36___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_37___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_38___ + ") format(\"truetype\");font-weight:400;font-style:italic}@font-face{font-family:\"KaTeX_SansSerif\";src:url(" + ___CSS_LOADER_URL_REPLACEMENT_39___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_40___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_41___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Script;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_42___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_43___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_44___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Size1;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_45___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_46___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_47___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Size2;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_48___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_49___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_50___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Size3;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_51___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_52___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_53___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Size4;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_54___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_55___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_56___ + ") format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Typewriter;src:url(" + ___CSS_LOADER_URL_REPLACEMENT_57___ + ") format(\"woff2\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_58___ + ") format(\"woff\"),url(" + ___CSS_LOADER_URL_REPLACEMENT_59___ + ") format(\"truetype\");font-weight:400;font-style:normal}.katex{font:normal 1.21em KaTeX_Main,Times New Roman,serif;line-height:1.2;text-indent:0;text-rendering:auto}.katex *{-ms-high-contrast-adjust:none!important}.katex .katex-version:after{content:\"0.11.1\"}.katex .katex-mathml{position:absolute;clip:rect(1px,1px,1px,1px);padding:0;border:0;height:1px;width:1px;overflow:hidden}.katex .katex-html>.newline{display:block}.katex .base{position:relative;white-space:nowrap;width:min-content}.katex .base,.katex .strut{display:inline-block}.katex .textbf{font-weight:700}.katex .textit{font-style:italic}.katex .textrm{font-family:KaTeX_Main}.katex .textsf{font-family:KaTeX_SansSerif}.katex .texttt{font-family:KaTeX_Typewriter}.katex .mathdefault{font-family:KaTeX_Math;font-style:italic}.katex .mathit{font-family:KaTeX_Main;font-style:italic}.katex .mathrm{font-style:normal}.katex .mathbf{font-family:KaTeX_Main;font-weight:700}.katex .boldsymbol{font-family:KaTeX_Math;font-weight:700;font-style:italic}.katex .amsrm,.katex .mathbb,.katex .textbb{font-family:KaTeX_AMS}.katex .mathcal{font-family:KaTeX_Caligraphic}.katex .mathfrak,.katex .textfrak{font-family:KaTeX_Fraktur}.katex .mathtt{font-family:KaTeX_Typewriter}.katex .mathscr,.katex .textscr{font-family:KaTeX_Script}.katex .mathsf,.katex .textsf{font-family:KaTeX_SansSerif}.katex .mathboldsf,.katex .textboldsf{font-family:KaTeX_SansSerif;font-weight:700}.katex .mathitsf,.katex .textitsf{font-family:KaTeX_SansSerif;font-style:italic}.katex .mainrm{font-family:KaTeX_Main;font-style:normal}.katex .vlist-t{display:inline-table;table-layout:fixed}.katex .vlist-r{display:table-row}.katex .vlist{display:table-cell;vertical-align:bottom;position:relative}.katex .vlist>span{display:block;height:0;position:relative}.katex .vlist>span>span{display:inline-block}.katex .vlist>span>.pstrut{overflow:hidden;width:0}.katex .vlist-t2{margin-right:-2px}.katex .vlist-s{display:table-cell;vertical-align:bottom;font-size:1px;width:2px;min-width:2px}.katex .msupsub{text-align:left}.katex .mfrac>span>span{text-align:center}.katex .mfrac .frac-line{display:inline-block;width:100%;border-bottom-style:solid}.katex .hdashline,.katex .hline,.katex .mfrac .frac-line,.katex .overline .overline-line,.katex .rule,.katex .underline .underline-line{min-height:1px}.katex .mspace{display:inline-block}.katex .clap,.katex .llap,.katex .rlap{width:0;position:relative}.katex .clap>.inner,.katex .llap>.inner,.katex .rlap>.inner{position:absolute}.katex .clap>.fix,.katex .llap>.fix,.katex .rlap>.fix{display:inline-block}.katex .llap>.inner{right:0}.katex .clap>.inner,.katex .rlap>.inner{left:0}.katex .clap>.inner>span{margin-left:-50%;margin-right:50%}.katex .rule{display:inline-block;border:0 solid;position:relative}.katex .hline,.katex .overline .overline-line,.katex .underline .underline-line{display:inline-block;width:100%;border-bottom-style:solid}.katex .hdashline{display:inline-block;width:100%;border-bottom-style:dashed}.katex .sqrt>.root{margin-left:.27777778em;margin-right:-.55555556em}.katex .fontsize-ensurer.reset-size1.size1,.katex .sizing.reset-size1.size1{font-size:1em}.katex .fontsize-ensurer.reset-size1.size2,.katex .sizing.reset-size1.size2{font-size:1.2em}.katex .fontsize-ensurer.reset-size1.size3,.katex .sizing.reset-size1.size3{font-size:1.4em}.katex .fontsize-ensurer.reset-size1.size4,.katex .sizing.reset-size1.size4{font-size:1.6em}.katex .fontsize-ensurer.reset-size1.size5,.katex .sizing.reset-size1.size5{font-size:1.8em}.katex .fontsize-ensurer.reset-size1.size6,.katex .sizing.reset-size1.size6{font-size:2em}.katex .fontsize-ensurer.reset-size1.size7,.katex .sizing.reset-size1.size7{font-size:2.4em}.katex .fontsize-ensurer.reset-size1.size8,.katex .sizing.reset-size1.size8{font-size:2.88em}.katex .fontsize-ensurer.reset-size1.size9,.katex .sizing.reset-size1.size9{font-size:3.456em}.katex .fontsize-ensurer.reset-size1.size10,.katex .sizing.reset-size1.size10{font-size:4.148em}.katex .fontsize-ensurer.reset-size1.size11,.katex .sizing.reset-size1.size11{font-size:4.976em}.katex .fontsize-ensurer.reset-size2.size1,.katex .sizing.reset-size2.size1{font-size:.83333333em}.katex .fontsize-ensurer.reset-size2.size2,.katex .sizing.reset-size2.size2{font-size:1em}.katex .fontsize-ensurer.reset-size2.size3,.katex .sizing.reset-size2.size3{font-size:1.16666667em}.katex .fontsize-ensurer.reset-size2.size4,.katex .sizing.reset-size2.size4{font-size:1.33333333em}.katex .fontsize-ensurer.reset-size2.size5,.katex .sizing.reset-size2.size5{font-size:1.5em}.katex .fontsize-ensurer.reset-size2.size6,.katex .sizing.reset-size2.size6{font-size:1.66666667em}.katex .fontsize-ensurer.reset-size2.size7,.katex .sizing.reset-size2.size7{font-size:2em}.katex .fontsize-ensurer.reset-size2.size8,.katex .sizing.reset-size2.size8{font-size:2.4em}.katex .fontsize-ensurer.reset-size2.size9,.katex .sizing.reset-size2.size9{font-size:2.88em}.katex .fontsize-ensurer.reset-size2.size10,.katex .sizing.reset-size2.size10{font-size:3.45666667em}.katex .fontsize-ensurer.reset-size2.size11,.katex .sizing.reset-size2.size11{font-size:4.14666667em}.katex .fontsize-ensurer.reset-size3.size1,.katex .sizing.reset-size3.size1{font-size:.71428571em}.katex .fontsize-ensurer.reset-size3.size2,.katex .sizing.reset-size3.size2{font-size:.85714286em}.katex .fontsize-ensurer.reset-size3.size3,.katex .sizing.reset-size3.size3{font-size:1em}.katex .fontsize-ensurer.reset-size3.size4,.katex .sizing.reset-size3.size4{font-size:1.14285714em}.katex .fontsize-ensurer.reset-size3.size5,.katex .sizing.reset-size3.size5{font-size:1.28571429em}.katex .fontsize-ensurer.reset-size3.size6,.katex .sizing.reset-size3.size6{font-size:1.42857143em}.katex .fontsize-ensurer.reset-size3.size7,.katex .sizing.reset-size3.size7{font-size:1.71428571em}.katex .fontsize-ensurer.reset-size3.size8,.katex .sizing.reset-size3.size8{font-size:2.05714286em}.katex .fontsize-ensurer.reset-size3.size9,.katex .sizing.reset-size3.size9{font-size:2.46857143em}.katex .fontsize-ensurer.reset-size3.size10,.katex .sizing.reset-size3.size10{font-size:2.96285714em}.katex .fontsize-ensurer.reset-size3.size11,.katex .sizing.reset-size3.size11{font-size:3.55428571em}.katex .fontsize-ensurer.reset-size4.size1,.katex .sizing.reset-size4.size1{font-size:.625em}.katex .fontsize-ensurer.reset-size4.size2,.katex .sizing.reset-size4.size2{font-size:.75em}.katex .fontsize-ensurer.reset-size4.size3,.katex .sizing.reset-size4.size3{font-size:.875em}.katex .fontsize-ensurer.reset-size4.size4,.katex .sizing.reset-size4.size4{font-size:1em}.katex .fontsize-ensurer.reset-size4.size5,.katex .sizing.reset-size4.size5{font-size:1.125em}.katex .fontsize-ensurer.reset-size4.size6,.katex .sizing.reset-size4.size6{font-size:1.25em}.katex .fontsize-ensurer.reset-size4.size7,.katex .sizing.reset-size4.size7{font-size:1.5em}.katex .fontsize-ensurer.reset-size4.size8,.katex .sizing.reset-size4.size8{font-size:1.8em}.katex .fontsize-ensurer.reset-size4.size9,.katex .sizing.reset-size4.size9{font-size:2.16em}.katex .fontsize-ensurer.reset-size4.size10,.katex .sizing.reset-size4.size10{font-size:2.5925em}.katex .fontsize-ensurer.reset-size4.size11,.katex .sizing.reset-size4.size11{font-size:3.11em}.katex .fontsize-ensurer.reset-size5.size1,.katex .sizing.reset-size5.size1{font-size:.55555556em}.katex .fontsize-ensurer.reset-size5.size2,.katex .sizing.reset-size5.size2{font-size:.66666667em}.katex .fontsize-ensurer.reset-size5.size3,.katex .sizing.reset-size5.size3{font-size:.77777778em}.katex .fontsize-ensurer.reset-size5.size4,.katex .sizing.reset-size5.size4{font-size:.88888889em}.katex .fontsize-ensurer.reset-size5.size5,.katex .sizing.reset-size5.size5{font-size:1em}.katex .fontsize-ensurer.reset-size5.size6,.katex .sizing.reset-size5.size6{font-size:1.11111111em}.katex .fontsize-ensurer.reset-size5.size7,.katex .sizing.reset-size5.size7{font-size:1.33333333em}.katex .fontsize-ensurer.reset-size5.size8,.katex .sizing.reset-size5.size8{font-size:1.6em}.katex .fontsize-ensurer.reset-size5.size9,.katex .sizing.reset-size5.size9{font-size:1.92em}.katex .fontsize-ensurer.reset-size5.size10,.katex .sizing.reset-size5.size10{font-size:2.30444444em}.katex .fontsize-ensurer.reset-size5.size11,.katex .sizing.reset-size5.size11{font-size:2.76444444em}.katex .fontsize-ensurer.reset-size6.size1,.katex .sizing.reset-size6.size1{font-size:.5em}.katex .fontsize-ensurer.reset-size6.size2,.katex .sizing.reset-size6.size2{font-size:.6em}.katex .fontsize-ensurer.reset-size6.size3,.katex .sizing.reset-size6.size3{font-size:.7em}.katex .fontsize-ensurer.reset-size6.size4,.katex .sizing.reset-size6.size4{font-size:.8em}.katex .fontsize-ensurer.reset-size6.size5,.katex .sizing.reset-size6.size5{font-size:.9em}.katex .fontsize-ensurer.reset-size6.size6,.katex .sizing.reset-size6.size6{font-size:1em}.katex .fontsize-ensurer.reset-size6.size7,.katex .sizing.reset-size6.size7{font-size:1.2em}.katex .fontsize-ensurer.reset-size6.size8,.katex .sizing.reset-size6.size8{font-size:1.44em}.katex .fontsize-ensurer.reset-size6.size9,.katex .sizing.reset-size6.size9{font-size:1.728em}.katex .fontsize-ensurer.reset-size6.size10,.katex .sizing.reset-size6.size10{font-size:2.074em}.katex .fontsize-ensurer.reset-size6.size11,.katex .sizing.reset-size6.size11{font-size:2.488em}.katex .fontsize-ensurer.reset-size7.size1,.katex .sizing.reset-size7.size1{font-size:.41666667em}.katex .fontsize-ensurer.reset-size7.size2,.katex .sizing.reset-size7.size2{font-size:.5em}.katex .fontsize-ensurer.reset-size7.size3,.katex .sizing.reset-size7.size3{font-size:.58333333em}.katex .fontsize-ensurer.reset-size7.size4,.katex .sizing.reset-size7.size4{font-size:.66666667em}.katex .fontsize-ensurer.reset-size7.size5,.katex .sizing.reset-size7.size5{font-size:.75em}.katex .fontsize-ensurer.reset-size7.size6,.katex .sizing.reset-size7.size6{font-size:.83333333em}.katex .fontsize-ensurer.reset-size7.size7,.katex .sizing.reset-size7.size7{font-size:1em}.katex .fontsize-ensurer.reset-size7.size8,.katex .sizing.reset-size7.size8{font-size:1.2em}.katex .fontsize-ensurer.reset-size7.size9,.katex .sizing.reset-size7.size9{font-size:1.44em}.katex .fontsize-ensurer.reset-size7.size10,.katex .sizing.reset-size7.size10{font-size:1.72833333em}.katex .fontsize-ensurer.reset-size7.size11,.katex .sizing.reset-size7.size11{font-size:2.07333333em}.katex .fontsize-ensurer.reset-size8.size1,.katex .sizing.reset-size8.size1{font-size:.34722222em}.katex .fontsize-ensurer.reset-size8.size2,.katex .sizing.reset-size8.size2{font-size:.41666667em}.katex .fontsize-ensurer.reset-size8.size3,.katex .sizing.reset-size8.size3{font-size:.48611111em}.katex .fontsize-ensurer.reset-size8.size4,.katex .sizing.reset-size8.size4{font-size:.55555556em}.katex .fontsize-ensurer.reset-size8.size5,.katex .sizing.reset-size8.size5{font-size:.625em}.katex .fontsize-ensurer.reset-size8.size6,.katex .sizing.reset-size8.size6{font-size:.69444444em}.katex .fontsize-ensurer.reset-size8.size7,.katex .sizing.reset-size8.size7{font-size:.83333333em}.katex .fontsize-ensurer.reset-size8.size8,.katex .sizing.reset-size8.size8{font-size:1em}.katex .fontsize-ensurer.reset-size8.size9,.katex .sizing.reset-size8.size9{font-size:1.2em}.katex .fontsize-ensurer.reset-size8.size10,.katex .sizing.reset-size8.size10{font-size:1.44027778em}.katex .fontsize-ensurer.reset-size8.size11,.katex .sizing.reset-size8.size11{font-size:1.72777778em}.katex .fontsize-ensurer.reset-size9.size1,.katex .sizing.reset-size9.size1{font-size:.28935185em}.katex .fontsize-ensurer.reset-size9.size2,.katex .sizing.reset-size9.size2{font-size:.34722222em}.katex .fontsize-ensurer.reset-size9.size3,.katex .sizing.reset-size9.size3{font-size:.40509259em}.katex .fontsize-ensurer.reset-size9.size4,.katex .sizing.reset-size9.size4{font-size:.46296296em}.katex .fontsize-ensurer.reset-size9.size5,.katex .sizing.reset-size9.size5{font-size:.52083333em}.katex .fontsize-ensurer.reset-size9.size6,.katex .sizing.reset-size9.size6{font-size:.5787037em}.katex .fontsize-ensurer.reset-size9.size7,.katex .sizing.reset-size9.size7{font-size:.69444444em}.katex .fontsize-ensurer.reset-size9.size8,.katex .sizing.reset-size9.size8{font-size:.83333333em}.katex .fontsize-ensurer.reset-size9.size9,.katex .sizing.reset-size9.size9{font-size:1em}.katex .fontsize-ensurer.reset-size9.size10,.katex .sizing.reset-size9.size10{font-size:1.20023148em}.katex .fontsize-ensurer.reset-size9.size11,.katex .sizing.reset-size9.size11{font-size:1.43981481em}.katex .fontsize-ensurer.reset-size10.size1,.katex .sizing.reset-size10.size1{font-size:.24108004em}.katex .fontsize-ensurer.reset-size10.size2,.katex .sizing.reset-size10.size2{font-size:.28929605em}.katex .fontsize-ensurer.reset-size10.size3,.katex .sizing.reset-size10.size3{font-size:.33751205em}.katex .fontsize-ensurer.reset-size10.size4,.katex .sizing.reset-size10.size4{font-size:.38572806em}.katex .fontsize-ensurer.reset-size10.size5,.katex .sizing.reset-size10.size5{font-size:.43394407em}.katex .fontsize-ensurer.reset-size10.size6,.katex .sizing.reset-size10.size6{font-size:.48216008em}.katex .fontsize-ensurer.reset-size10.size7,.katex .sizing.reset-size10.size7{font-size:.57859209em}.katex .fontsize-ensurer.reset-size10.size8,.katex .sizing.reset-size10.size8{font-size:.69431051em}.katex .fontsize-ensurer.reset-size10.size9,.katex .sizing.reset-size10.size9{font-size:.83317261em}.katex .fontsize-ensurer.reset-size10.size10,.katex .sizing.reset-size10.size10{font-size:1em}.katex .fontsize-ensurer.reset-size10.size11,.katex .sizing.reset-size10.size11{font-size:1.19961427em}.katex .fontsize-ensurer.reset-size11.size1,.katex .sizing.reset-size11.size1{font-size:.20096463em}.katex .fontsize-ensurer.reset-size11.size2,.katex .sizing.reset-size11.size2{font-size:.24115756em}.katex .fontsize-ensurer.reset-size11.size3,.katex .sizing.reset-size11.size3{font-size:.28135048em}.katex .fontsize-ensurer.reset-size11.size4,.katex .sizing.reset-size11.size4{font-size:.32154341em}.katex .fontsize-ensurer.reset-size11.size5,.katex .sizing.reset-size11.size5{font-size:.36173633em}.katex .fontsize-ensurer.reset-size11.size6,.katex .sizing.reset-size11.size6{font-size:.40192926em}.katex .fontsize-ensurer.reset-size11.size7,.katex .sizing.reset-size11.size7{font-size:.48231511em}.katex .fontsize-ensurer.reset-size11.size8,.katex .sizing.reset-size11.size8{font-size:.57877814em}.katex .fontsize-ensurer.reset-size11.size9,.katex .sizing.reset-size11.size9{font-size:.69453376em}.katex .fontsize-ensurer.reset-size11.size10,.katex .sizing.reset-size11.size10{font-size:.83360129em}.katex .fontsize-ensurer.reset-size11.size11,.katex .sizing.reset-size11.size11{font-size:1em}.katex .delimsizing.size1{font-family:KaTeX_Size1}.katex .delimsizing.size2{font-family:KaTeX_Size2}.katex .delimsizing.size3{font-family:KaTeX_Size3}.katex .delimsizing.size4{font-family:KaTeX_Size4}.katex .delimsizing.mult .delim-size1>span{font-family:KaTeX_Size1}.katex .delimsizing.mult .delim-size4>span{font-family:KaTeX_Size4}.katex .nulldelimiter{display:inline-block;width:.12em}.katex .delimcenter,.katex .op-symbol{position:relative}.katex .op-symbol.small-op{font-family:KaTeX_Size1}.katex .op-symbol.large-op{font-family:KaTeX_Size2}.katex .op-limits>.vlist-t{text-align:center}.katex .accent>.vlist-t{text-align:center}.katex .accent .accent-body{position:relative}.katex .accent .accent-body:not(.accent-full){width:0}.katex .overlay{display:block}.katex .mtable .vertical-separator{display:inline-block;min-width:1px}.katex .mtable .arraycolsep{display:inline-block}.katex .mtable .col-align-c>.vlist-t{text-align:center}.katex .mtable .col-align-l>.vlist-t{text-align:left}.katex .mtable .col-align-r>.vlist-t{text-align:right}.katex .svg-align{text-align:left}.katex svg{display:block;position:absolute;width:100%;height:inherit;fill:currentColor;stroke:currentColor;fill-rule:nonzero;fill-opacity:1;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1}.katex svg path{stroke:none}.katex img{border-style:none;min-width:0;min-height:0;max-width:none;max-height:none}.katex .stretchy{width:100%;display:block;position:relative;overflow:hidden}.katex .stretchy:after,.katex .stretchy:before{content:\"\"}.katex .hide-tail{width:100%;position:relative;overflow:hidden}.katex .halfarrow-left{position:absolute;left:0;width:50.2%;overflow:hidden}.katex .halfarrow-right{position:absolute;right:0;width:50.2%;overflow:hidden}.katex .brace-left{position:absolute;left:0;width:25.1%;overflow:hidden}.katex .brace-center{position:absolute;left:25%;width:50%;overflow:hidden}.katex .brace-right{position:absolute;right:0;width:25.1%;overflow:hidden}.katex .x-arrow-pad{padding:0 .5em}.katex .mover,.katex .munder,.katex .x-arrow{text-align:center}.katex .boxpad{padding:0 .3em}.katex .fbox,.katex .fcolorbox{box-sizing:border-box;border:.04em solid}.katex .cancel-pad{padding:0 .2em}.katex .cancel-lap{margin-left:-.2em;margin-right:-.2em}.katex .sout{border-bottom-style:solid;border-bottom-width:.08em}.katex-display{display:block;margin:1em 0;text-align:center}.katex-display>.katex{display:block;text-align:center;white-space:nowrap}.katex-display>.katex>.katex-html{display:block;position:relative}.katex-display>.katex>.katex-html>.tag{position:absolute;right:0}.katex-display.leqno>.katex>.katex-html>.tag{left:0;right:auto}.katex-display.fleqn>.katex{text-align:left}\n", "",{"version":3,"sources":["webpack://./node_modules/katex/dist/katex.min.css"],"names":[],"mappings":"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","sourcesContent":["@font-face{font-family:KaTeX_AMS;src:url(fonts/KaTeX_AMS-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_AMS-Regular.woff) format(\"woff\"),url(fonts/KaTeX_AMS-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Caligraphic;src:url(fonts/KaTeX_Caligraphic-Bold.woff2) format(\"woff2\"),url(fonts/KaTeX_Caligraphic-Bold.woff) format(\"woff\"),url(fonts/KaTeX_Caligraphic-Bold.ttf) format(\"truetype\");font-weight:700;font-style:normal}@font-face{font-family:KaTeX_Caligraphic;src:url(fonts/KaTeX_Caligraphic-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Caligraphic-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Caligraphic-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Fraktur;src:url(fonts/KaTeX_Fraktur-Bold.woff2) format(\"woff2\"),url(fonts/KaTeX_Fraktur-Bold.woff) format(\"woff\"),url(fonts/KaTeX_Fraktur-Bold.ttf) format(\"truetype\");font-weight:700;font-style:normal}@font-face{font-family:KaTeX_Fraktur;src:url(fonts/KaTeX_Fraktur-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Fraktur-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Fraktur-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Main;src:url(fonts/KaTeX_Main-Bold.woff2) format(\"woff2\"),url(fonts/KaTeX_Main-Bold.woff) format(\"woff\"),url(fonts/KaTeX_Main-Bold.ttf) format(\"truetype\");font-weight:700;font-style:normal}@font-face{font-family:KaTeX_Main;src:url(fonts/KaTeX_Main-BoldItalic.woff2) format(\"woff2\"),url(fonts/KaTeX_Main-BoldItalic.woff) format(\"woff\"),url(fonts/KaTeX_Main-BoldItalic.ttf) format(\"truetype\");font-weight:700;font-style:italic}@font-face{font-family:KaTeX_Main;src:url(fonts/KaTeX_Main-Italic.woff2) format(\"woff2\"),url(fonts/KaTeX_Main-Italic.woff) format(\"woff\"),url(fonts/KaTeX_Main-Italic.ttf) format(\"truetype\");font-weight:400;font-style:italic}@font-face{font-family:KaTeX_Main;src:url(fonts/KaTeX_Main-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Main-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Main-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Math;src:url(fonts/KaTeX_Math-BoldItalic.woff2) format(\"woff2\"),url(fonts/KaTeX_Math-BoldItalic.woff) format(\"woff\"),url(fonts/KaTeX_Math-BoldItalic.ttf) format(\"truetype\");font-weight:700;font-style:italic}@font-face{font-family:KaTeX_Math;src:url(fonts/KaTeX_Math-Italic.woff2) format(\"woff2\"),url(fonts/KaTeX_Math-Italic.woff) format(\"woff\"),url(fonts/KaTeX_Math-Italic.ttf) format(\"truetype\");font-weight:400;font-style:italic}@font-face{font-family:\"KaTeX_SansSerif\";src:url(fonts/KaTeX_SansSerif-Bold.woff2) format(\"woff2\"),url(fonts/KaTeX_SansSerif-Bold.woff) format(\"woff\"),url(fonts/KaTeX_SansSerif-Bold.ttf) format(\"truetype\");font-weight:700;font-style:normal}@font-face{font-family:\"KaTeX_SansSerif\";src:url(fonts/KaTeX_SansSerif-Italic.woff2) format(\"woff2\"),url(fonts/KaTeX_SansSerif-Italic.woff) format(\"woff\"),url(fonts/KaTeX_SansSerif-Italic.ttf) format(\"truetype\");font-weight:400;font-style:italic}@font-face{font-family:\"KaTeX_SansSerif\";src:url(fonts/KaTeX_SansSerif-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_SansSerif-Regular.woff) format(\"woff\"),url(fonts/KaTeX_SansSerif-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Script;src:url(fonts/KaTeX_Script-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Script-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Script-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Size1;src:url(fonts/KaTeX_Size1-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Size1-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Size1-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Size2;src:url(fonts/KaTeX_Size2-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Size2-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Size2-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Size3;src:url(fonts/KaTeX_Size3-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Size3-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Size3-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Size4;src:url(fonts/KaTeX_Size4-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Size4-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Size4-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}@font-face{font-family:KaTeX_Typewriter;src:url(fonts/KaTeX_Typewriter-Regular.woff2) format(\"woff2\"),url(fonts/KaTeX_Typewriter-Regular.woff) format(\"woff\"),url(fonts/KaTeX_Typewriter-Regular.ttf) format(\"truetype\");font-weight:400;font-style:normal}.katex{font:normal 1.21em KaTeX_Main,Times New Roman,serif;line-height:1.2;text-indent:0;text-rendering:auto}.katex *{-ms-high-contrast-adjust:none!important}.katex .katex-version:after{content:\"0.11.1\"}.katex .katex-mathml{position:absolute;clip:rect(1px,1px,1px,1px);padding:0;border:0;height:1px;width:1px;overflow:hidden}.katex .katex-html>.newline{display:block}.katex .base{position:relative;white-space:nowrap;width:min-content}.katex .base,.katex .strut{display:inline-block}.katex .textbf{font-weight:700}.katex .textit{font-style:italic}.katex .textrm{font-family:KaTeX_Main}.katex .textsf{font-family:KaTeX_SansSerif}.katex .texttt{font-family:KaTeX_Typewriter}.katex .mathdefault{font-family:KaTeX_Math;font-style:italic}.katex .mathit{font-family:KaTeX_Main;font-style:italic}.katex .mathrm{font-style:normal}.katex .mathbf{font-family:KaTeX_Main;font-weight:700}.katex .boldsymbol{font-family:KaTeX_Math;font-weight:700;font-style:italic}.katex .amsrm,.katex .mathbb,.katex .textbb{font-family:KaTeX_AMS}.katex .mathcal{font-family:KaTeX_Caligraphic}.katex .mathfrak,.katex .textfrak{font-family:KaTeX_Fraktur}.katex .mathtt{font-family:KaTeX_Typewriter}.katex .mathscr,.katex .textscr{font-family:KaTeX_Script}.katex .mathsf,.katex .textsf{font-family:KaTeX_SansSerif}.katex .mathboldsf,.katex .textboldsf{font-family:KaTeX_SansSerif;font-weight:700}.katex .mathitsf,.katex .textitsf{font-family:KaTeX_SansSerif;font-style:italic}.katex .mainrm{font-family:KaTeX_Main;font-style:normal}.katex .vlist-t{display:inline-table;table-layout:fixed}.katex .vlist-r{display:table-row}.katex .vlist{display:table-cell;vertical-align:bottom;position:relative}.katex .vlist>span{display:block;height:0;position:relative}.katex .vlist>span>span{display:inline-block}.katex .vlist>span>.pstrut{overflow:hidden;width:0}.katex .vlist-t2{margin-right:-2px}.katex .vlist-s{display:table-cell;vertical-align:bottom;font-size:1px;width:2px;min-width:2px}.katex .msupsub{text-align:left}.katex .mfrac>span>span{text-align:center}.katex .mfrac .frac-line{display:inline-block;width:100%;border-bottom-style:solid}.katex .hdashline,.katex .hline,.katex .mfrac .frac-line,.katex .overline .overline-line,.katex .rule,.katex .underline .underline-line{min-height:1px}.katex .mspace{display:inline-block}.katex .clap,.katex .llap,.katex .rlap{width:0;position:relative}.katex .clap>.inner,.katex .llap>.inner,.katex .rlap>.inner{position:absolute}.katex .clap>.fix,.katex .llap>.fix,.katex .rlap>.fix{display:inline-block}.katex .llap>.inner{right:0}.katex .clap>.inner,.katex .rlap>.inner{left:0}.katex .clap>.inner>span{margin-left:-50%;margin-right:50%}.katex .rule{display:inline-block;border:0 solid;position:relative}.katex .hline,.katex .overline .overline-line,.katex .underline .underline-line{display:inline-block;width:100%;border-bottom-style:solid}.katex .hdashline{display:inline-block;width:100%;border-bottom-style:dashed}.katex .sqrt>.root{margin-left:.27777778em;margin-right:-.55555556em}.katex .fontsize-ensurer.reset-size1.size1,.katex .sizing.reset-size1.size1{font-size:1em}.katex .fontsize-ensurer.reset-size1.size2,.katex .sizing.reset-size1.size2{font-size:1.2em}.katex .fontsize-ensurer.reset-size1.size3,.katex .sizing.reset-size1.size3{font-size:1.4em}.katex .fontsize-ensurer.reset-size1.size4,.katex .sizing.reset-size1.size4{font-size:1.6em}.katex .fontsize-ensurer.reset-size1.size5,.katex .sizing.reset-size1.size5{font-size:1.8em}.katex .fontsize-ensurer.reset-size1.size6,.katex .sizing.reset-size1.size6{font-size:2em}.katex .fontsize-ensurer.reset-size1.size7,.katex .sizing.reset-size1.size7{font-size:2.4em}.katex .fontsize-ensurer.reset-size1.size8,.katex .sizing.reset-size1.size8{font-size:2.88em}.katex .fontsize-ensurer.reset-size1.size9,.katex .sizing.reset-size1.size9{font-size:3.456em}.katex .fontsize-ensurer.reset-size1.size10,.katex .sizing.reset-size1.size10{font-size:4.148em}.katex .fontsize-ensurer.reset-size1.size11,.katex .sizing.reset-size1.size11{font-size:4.976em}.katex .fontsize-ensurer.reset-size2.size1,.katex .sizing.reset-size2.size1{font-size:.83333333em}.katex .fontsize-ensurer.reset-size2.size2,.katex .sizing.reset-size2.size2{font-size:1em}.katex .fontsize-ensurer.reset-size2.size3,.katex .sizing.reset-size2.size3{font-size:1.16666667em}.katex .fontsize-ensurer.reset-size2.size4,.katex .sizing.reset-size2.size4{font-size:1.33333333em}.katex .fontsize-ensurer.reset-size2.size5,.katex .sizing.reset-size2.size5{font-size:1.5em}.katex .fontsize-ensurer.reset-size2.size6,.katex .sizing.reset-size2.size6{font-size:1.66666667em}.katex .fontsize-ensurer.reset-size2.size7,.katex .sizing.reset-size2.size7{font-size:2em}.katex .fontsize-ensurer.reset-size2.size8,.katex .sizing.reset-size2.size8{font-size:2.4em}.katex .fontsize-ensurer.reset-size2.size9,.katex .sizing.reset-size2.size9{font-size:2.88em}.katex .fontsize-ensurer.reset-size2.size10,.katex .sizing.reset-size2.size10{font-size:3.45666667em}.katex .fontsize-ensurer.reset-size2.size11,.katex .sizing.reset-size2.size11{font-size:4.14666667em}.katex .fontsize-ensurer.reset-size3.size1,.katex .sizing.reset-size3.size1{font-size:.71428571em}.katex .fontsize-ensurer.reset-size3.size2,.katex .sizing.reset-size3.size2{font-size:.85714286em}.katex .fontsize-ensurer.reset-size3.size3,.katex .sizing.reset-size3.size3{font-size:1em}.katex .fontsize-ensurer.reset-size3.size4,.katex .sizing.reset-size3.size4{font-size:1.14285714em}.katex .fontsize-ensurer.reset-size3.size5,.katex .sizing.reset-size3.size5{font-size:1.28571429em}.katex .fontsize-ensurer.reset-size3.size6,.katex .sizing.reset-size3.size6{font-size:1.42857143em}.katex .fontsize-ensurer.reset-size3.size7,.katex .sizing.reset-size3.size7{font-size:1.71428571em}.katex .fontsize-ensurer.reset-size3.size8,.katex .sizing.reset-size3.size8{font-size:2.05714286em}.katex .fontsize-ensurer.reset-size3.size9,.katex .sizing.reset-size3.size9{font-size:2.46857143em}.katex .fontsize-ensurer.reset-size3.size10,.katex .sizing.reset-size3.size10{font-size:2.96285714em}.katex .fontsize-ensurer.reset-size3.size11,.katex .sizing.reset-size3.size11{font-size:3.55428571em}.katex .fontsize-ensurer.reset-size4.size1,.katex .sizing.reset-size4.size1{font-size:.625em}.katex .fontsize-ensurer.reset-size4.size2,.katex .sizing.reset-size4.size2{font-size:.75em}.katex .fontsize-ensurer.reset-size4.size3,.katex .sizing.reset-size4.size3{font-size:.875em}.katex .fontsize-ensurer.reset-size4.size4,.katex .sizing.reset-size4.size4{font-size:1em}.katex .fontsize-ensurer.reset-size4.size5,.katex .sizing.reset-size4.size5{font-size:1.125em}.katex .fontsize-ensurer.reset-size4.size6,.katex .sizing.reset-size4.size6{font-size:1.25em}.katex .fontsize-ensurer.reset-size4.size7,.katex .sizing.reset-size4.size7{font-size:1.5em}.katex .fontsize-ensurer.reset-size4.size8,.katex .sizing.reset-size4.size8{font-size:1.8em}.katex .fontsize-ensurer.reset-size4.size9,.katex .sizing.reset-size4.size9{font-size:2.16em}.katex .fontsize-ensurer.reset-size4.size10,.katex .sizing.reset-size4.size10{font-size:2.5925em}.katex .fontsize-ensurer.reset-size4.size11,.katex .sizing.reset-size4.size11{font-size:3.11em}.katex .fontsize-ensurer.reset-size5.size1,.katex .sizing.reset-size5.size1{font-size:.55555556em}.katex .fontsize-ensurer.reset-size5.size2,.katex .sizing.reset-size5.size2{font-size:.66666667em}.katex .fontsize-ensurer.reset-size5.size3,.katex .sizing.reset-size5.size3{font-size:.77777778em}.katex .fontsize-ensurer.reset-size5.size4,.katex .sizing.reset-size5.size4{font-size:.88888889em}.katex .fontsize-ensurer.reset-size5.size5,.katex .sizing.reset-size5.size5{font-size:1em}.katex .fontsize-ensurer.reset-size5.size6,.katex .sizing.reset-size5.size6{font-size:1.11111111em}.katex .fontsize-ensurer.reset-size5.size7,.katex .sizing.reset-size5.size7{font-size:1.33333333em}.katex .fontsize-ensurer.reset-size5.size8,.katex .sizing.reset-size5.size8{font-size:1.6em}.katex .fontsize-ensurer.reset-size5.size9,.katex .sizing.reset-size5.size9{font-size:1.92em}.katex .fontsize-ensurer.reset-size5.size10,.katex .sizing.reset-size5.size10{font-size:2.30444444em}.katex .fontsize-ensurer.reset-size5.size11,.katex .sizing.reset-size5.size11{font-size:2.76444444em}.katex .fontsize-ensurer.reset-size6.size1,.katex .sizing.reset-size6.size1{font-size:.5em}.katex .fontsize-ensurer.reset-size6.size2,.katex .sizing.reset-size6.size2{font-size:.6em}.katex .fontsize-ensurer.reset-size6.size3,.katex .sizing.reset-size6.size3{font-size:.7em}.katex .fontsize-ensurer.reset-size6.size4,.katex .sizing.reset-size6.size4{font-size:.8em}.katex .fontsize-ensurer.reset-size6.size5,.katex .sizing.reset-size6.size5{font-size:.9em}.katex .fontsize-ensurer.reset-size6.size6,.katex .sizing.reset-size6.size6{font-size:1em}.katex .fontsize-ensurer.reset-size6.size7,.katex .sizing.reset-size6.size7{font-size:1.2em}.katex .fontsize-ensurer.reset-size6.size8,.katex .sizing.reset-size6.size8{font-size:1.44em}.katex .fontsize-ensurer.reset-size6.size9,.katex .sizing.reset-size6.size9{font-size:1.728em}.katex .fontsize-ensurer.reset-size6.size10,.katex .sizing.reset-size6.size10{font-size:2.074em}.katex .fontsize-ensurer.reset-size6.size11,.katex .sizing.reset-size6.size11{font-size:2.488em}.katex .fontsize-ensurer.reset-size7.size1,.katex .sizing.reset-size7.size1{font-size:.41666667em}.katex .fontsize-ensurer.reset-size7.size2,.katex .sizing.reset-size7.size2{font-size:.5em}.katex .fontsize-ensurer.reset-size7.size3,.katex .sizing.reset-size7.size3{font-size:.58333333em}.katex .fontsize-ensurer.reset-size7.size4,.katex .sizing.reset-size7.size4{font-size:.66666667em}.katex .fontsize-ensurer.reset-size7.size5,.katex .sizing.reset-size7.size5{font-size:.75em}.katex .fontsize-ensurer.reset-size7.size6,.katex .sizing.reset-size7.size6{font-size:.83333333em}.katex .fontsize-ensurer.reset-size7.size7,.katex .sizing.reset-size7.size7{font-size:1em}.katex .fontsize-ensurer.reset-size7.size8,.katex .sizing.reset-size7.size8{font-size:1.2em}.katex .fontsize-ensurer.reset-size7.size9,.katex .sizing.reset-size7.size9{font-size:1.44em}.katex .fontsize-ensurer.reset-size7.size10,.katex .sizing.reset-size7.size10{font-size:1.72833333em}.katex .fontsize-ensurer.reset-size7.size11,.katex .sizing.reset-size7.size11{font-size:2.07333333em}.katex .fontsize-ensurer.reset-size8.size1,.katex .sizing.reset-size8.size1{font-size:.34722222em}.katex .fontsize-ensurer.reset-size8.size2,.katex .sizing.reset-size8.size2{font-size:.41666667em}.katex .fontsize-ensurer.reset-size8.size3,.katex .sizing.reset-size8.size3{font-size:.48611111em}.katex .fontsize-ensurer.reset-size8.size4,.katex .sizing.reset-size8.size4{font-size:.55555556em}.katex .fontsize-ensurer.reset-size8.size5,.katex .sizing.reset-size8.size5{font-size:.625em}.katex .fontsize-ensurer.reset-size8.size6,.katex .sizing.reset-size8.size6{font-size:.69444444em}.katex .fontsize-ensurer.reset-size8.size7,.katex .sizing.reset-size8.size7{font-size:.83333333em}.katex .fontsize-ensurer.reset-size8.size8,.katex .sizing.reset-size8.size8{font-size:1em}.katex .fontsize-ensurer.reset-size8.size9,.katex .sizing.reset-size8.size9{font-size:1.2em}.katex .fontsize-ensurer.reset-size8.size10,.katex .sizing.reset-size8.size10{font-size:1.44027778em}.katex .fontsize-ensurer.reset-size8.size11,.katex .sizing.reset-size8.size11{font-size:1.72777778em}.katex .fontsize-ensurer.reset-size9.size1,.katex .sizing.reset-size9.size1{font-size:.28935185em}.katex .fontsize-ensurer.reset-size9.size2,.katex .sizing.reset-size9.size2{font-size:.34722222em}.katex .fontsize-ensurer.reset-size9.size3,.katex .sizing.reset-size9.size3{font-size:.40509259em}.katex .fontsize-ensurer.reset-size9.size4,.katex .sizing.reset-size9.size4{font-size:.46296296em}.katex .fontsize-ensurer.reset-size9.size5,.katex .sizing.reset-size9.size5{font-size:.52083333em}.katex .fontsize-ensurer.reset-size9.size6,.katex .sizing.reset-size9.size6{font-size:.5787037em}.katex .fontsize-ensurer.reset-size9.size7,.katex .sizing.reset-size9.size7{font-size:.69444444em}.katex .fontsize-ensurer.reset-size9.size8,.katex .sizing.reset-size9.size8{font-size:.83333333em}.katex .fontsize-ensurer.reset-size9.size9,.katex .sizing.reset-size9.size9{font-size:1em}.katex .fontsize-ensurer.reset-size9.size10,.katex .sizing.reset-size9.size10{font-size:1.20023148em}.katex .fontsize-ensurer.reset-size9.size11,.katex .sizing.reset-size9.size11{font-size:1.43981481em}.katex .fontsize-ensurer.reset-size10.size1,.katex .sizing.reset-size10.size1{font-size:.24108004em}.katex .fontsize-ensurer.reset-size10.size2,.katex .sizing.reset-size10.size2{font-size:.28929605em}.katex .fontsize-ensurer.reset-size10.size3,.katex .sizing.reset-size10.size3{font-size:.33751205em}.katex .fontsize-ensurer.reset-size10.size4,.katex .sizing.reset-size10.size4{font-size:.38572806em}.katex .fontsize-ensurer.reset-size10.size5,.katex .sizing.reset-size10.size5{font-size:.43394407em}.katex .fontsize-ensurer.reset-size10.size6,.katex .sizing.reset-size10.size6{font-size:.48216008em}.katex .fontsize-ensurer.reset-size10.size7,.katex .sizing.reset-size10.size7{font-size:.57859209em}.katex .fontsize-ensurer.reset-size10.size8,.katex .sizing.reset-size10.size8{font-size:.69431051em}.katex .fontsize-ensurer.reset-size10.size9,.katex .sizing.reset-size10.size9{font-size:.83317261em}.katex .fontsize-ensurer.reset-size10.size10,.katex .sizing.reset-size10.size10{font-size:1em}.katex .fontsize-ensurer.reset-size10.size11,.katex .sizing.reset-size10.size11{font-size:1.19961427em}.katex .fontsize-ensurer.reset-size11.size1,.katex .sizing.reset-size11.size1{font-size:.20096463em}.katex .fontsize-ensurer.reset-size11.size2,.katex .sizing.reset-size11.size2{font-size:.24115756em}.katex .fontsize-ensurer.reset-size11.size3,.katex .sizing.reset-size11.size3{font-size:.28135048em}.katex .fontsize-ensurer.reset-size11.size4,.katex .sizing.reset-size11.size4{font-size:.32154341em}.katex .fontsize-ensurer.reset-size11.size5,.katex .sizing.reset-size11.size5{font-size:.36173633em}.katex .fontsize-ensurer.reset-size11.size6,.katex .sizing.reset-size11.size6{font-size:.40192926em}.katex .fontsize-ensurer.reset-size11.size7,.katex .sizing.reset-size11.size7{font-size:.48231511em}.katex .fontsize-ensurer.reset-size11.size8,.katex .sizing.reset-size11.size8{font-size:.57877814em}.katex .fontsize-ensurer.reset-size11.size9,.katex .sizing.reset-size11.size9{font-size:.69453376em}.katex .fontsize-ensurer.reset-size11.size10,.katex .sizing.reset-size11.size10{font-size:.83360129em}.katex .fontsize-ensurer.reset-size11.size11,.katex .sizing.reset-size11.size11{font-size:1em}.katex .delimsizing.size1{font-family:KaTeX_Size1}.katex .delimsizing.size2{font-family:KaTeX_Size2}.katex .delimsizing.size3{font-family:KaTeX_Size3}.katex .delimsizing.size4{font-family:KaTeX_Size4}.katex .delimsizing.mult .delim-size1>span{font-family:KaTeX_Size1}.katex .delimsizing.mult .delim-size4>span{font-family:KaTeX_Size4}.katex .nulldelimiter{display:inline-block;width:.12em}.katex .delimcenter,.katex .op-symbol{position:relative}.katex .op-symbol.small-op{font-family:KaTeX_Size1}.katex .op-symbol.large-op{font-family:KaTeX_Size2}.katex .op-limits>.vlist-t{text-align:center}.katex .accent>.vlist-t{text-align:center}.katex .accent .accent-body{position:relative}.katex .accent .accent-body:not(.accent-full){width:0}.katex .overlay{display:block}.katex .mtable .vertical-separator{display:inline-block;min-width:1px}.katex .mtable .arraycolsep{display:inline-block}.katex .mtable .col-align-c>.vlist-t{text-align:center}.katex .mtable .col-align-l>.vlist-t{text-align:left}.katex .mtable .col-align-r>.vlist-t{text-align:right}.katex .svg-align{text-align:left}.katex svg{display:block;position:absolute;width:100%;height:inherit;fill:currentColor;stroke:currentColor;fill-rule:nonzero;fill-opacity:1;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1}.katex svg path{stroke:none}.katex img{border-style:none;min-width:0;min-height:0;max-width:none;max-height:none}.katex .stretchy{width:100%;display:block;position:relative;overflow:hidden}.katex .stretchy:after,.katex .stretchy:before{content:\"\"}.katex .hide-tail{width:100%;position:relative;overflow:hidden}.katex .halfarrow-left{position:absolute;left:0;width:50.2%;overflow:hidden}.katex .halfarrow-right{position:absolute;right:0;width:50.2%;overflow:hidden}.katex .brace-left{position:absolute;left:0;width:25.1%;overflow:hidden}.katex .brace-center{position:absolute;left:25%;width:50%;overflow:hidden}.katex .brace-right{position:absolute;right:0;width:25.1%;overflow:hidden}.katex .x-arrow-pad{padding:0 .5em}.katex .mover,.katex .munder,.katex .x-arrow{text-align:center}.katex .boxpad{padding:0 .3em}.katex .fbox,.katex .fcolorbox{box-sizing:border-box;border:.04em solid}.katex .cancel-pad{padding:0 .2em}.katex .cancel-lap{margin-left:-.2em;margin-right:-.2em}.katex .sout{border-bottom-style:solid;border-bottom-width:.08em}.katex-display{display:block;margin:1em 0;text-align:center}.katex-display>.katex{display:block;text-align:center;white-space:nowrap}.katex-display>.katex>.katex-html{display:block;position:relative}.katex-display>.katex>.katex-html>.tag{position:absolute;right:0}.katex-display.leqno>.katex>.katex-html>.tag{left:0;right:auto}.katex-display.fleqn>.katex{text-align:left}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 5150:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "html {\n  scroll-behavior: smooth;\n}\n\n.examma-ray-sas-diff pre {\n  margin-right: 0;\n  margin-top: 0;\n  margin-bottom: 0;\n  margin-left: 1em;\n}\n\n.examma-ray-sas-diff pre>code {\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.examma-ray-sas-diff pre>svg {\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.examma-ray-sas-diff .card-header p {\n  display: inline;\n  margin-bottom: 0;\n}\n\n.examma-ray-sas-diff {\n  font-size: 0.8rem;\n}\n\n.examma-ray-fitb-diff tr>*:first-child,\n.examma-ray-sas-diff tr>*:first-child {\n  position: sticky;\n  left: 0;\n  background-color: white;\n}\n\n.examma-ray-sas-rubric-item {\n  width: 250px;\n}\n\n.examma-ray-sas-rubric-item .badge {\n  vertical-align: middle;\n}\n\n.examma-ray-mc-option>p {\n  display: inline-block;\n  margin: 0;\n}\n\n.examma-ray-incorrect>* {\n  /* color: red;\n  text-decoration: line-through !important; */\n}\n\n.examma-ray-correct>* {\n  /* color: green;\n  font-weight: bold; */\n}\n\n.examma-ray-mc-option {\n  vertical-align: middle;\n}\n\n.examma-ray-mc-option pre {\n  display: inline-block;\n  vertical-align: text-top;\n  margin-bottom: 0;\n}\n\n.examma-ray-mc-option pre code {\n  font-size: 0.8rem;\n}\n\n.card-header {\n  padding: 0.2rem 0.75rem;\n}\n\n.card-body {\n  padding: 0 0.75rem;\n  padding-top: 0.25rem;\n}\n\n.examma-ray-grading-annotation {\n  font-size: 0.8rem;\n  color: blue;\n  font-style: italic;\n}\n\ncode {\n  color: unset;\n}\n\n.examma-ray-fitb-diff {\n  font-size: 0.8rem;\n}\n\n.examma-ray-fitb-blank {\n  border: solid 1px #333;\n  padding: 0.2em;\n}\n\n.examma-ray-fitb-spacer {\n  height: 0.5em;\n  width: 1px;\n}\n\n.examma-ray-section-heading {\n  margin-bottom: 10px;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  background-color: #dedede;\n  padding: 5px;\n  margin-bottom: 5px;\n  border-bottom: solid 1px #aaa;\n}\n\n.examma-ray-section-heading>.badge {\n  font-size: 1.2em;\n  vertical-align: middle;\n}\n\n.examma-ray-section-contents {\n  width: 100%;\n  table-layout: fixed;\n  margin-left: 7px;\n}\n\n.examma-ray-section-contents td {\n  vertical-align: top;\n}\n\n.examma-ray-instructions {}\n\n.examma-ray-section-description {\n  font-size: 90%;\n}\n\n.examma-ray-section-reference {\n  font-size: 90%;\n}\n\n.examma-ray-question-description {\n  font-size: 90%;\n}\n\n.examma-ray-section-reference {\n  position: sticky;\n  top: 0;\n  max-height: 100vh;\n  overflow-y: auto;\n  padding: 5px;\n  padding-bottom: 2em;\n}\n\n\n.examma-ray-section-contents .h1,\n.examma-ray-section-contents .h2,\n.examma-ray-section-contents .h3,\n.examma-ray-section-contents .h4,\n.examma-ray-section-contents .h5,\n.examma-ray-section-contents .h6,\n.examma-ray-section-contents h1,\n.examma-ray-section-contents h2,\n.examma-ray-section-contents h3,\n.examma-ray-section-contents h4,\n.examma-ray-section-contents h5,\n.examma-ray-section-contents h6 {\n  font-size: 1rem;\n}\n\n\n.examma-ray-question-description h1,\n.examma-ray-question-description h2,\n.examma-ray-question-description h3,\n.examma-ray-question-description h4,\n.examma-ray-question-description h5,\n.examma-ray-question-description h6,\n.examma-ray-question-description h7 {\n  font-size: initial;\n}\n\n.examma-ray-question-description p {\n  margin-bottom: 1em;\n}\n\n.examma-ray-grading-report {\n  overflow-x: auto;\n  max-height: 70vh;\n}\n\n.examma-ray-grading-report form {\n  margin-bottom: 0;\n}\n\n.examma-ray-grading-report .btn-link {\n  font-size: 0.8rem;\n}\n\n.nav .examma-ray-score-badge {\n  width: 5em;\n}\n\n.rubric-item-card {\n  width: 17em;\n}\n\n.rubric-item-card .card-header {\n  padding: 0.25rem;\n}\n\n.rubric-item-card .card-body {\n  overflow-x: auto;\n}\n\n.rubric-item-card a.nav-link {\n  font-weight: 500;\n  padding: 0;\n}\n\n\n\n.examma-ray-mc-option .hljs {\n  background: unset;\n  padding: unset;\n}\n\n.examma-ray-summation-grader .examma-ray-point-adjustment-badge {\n  width: 3em;\n  margin-left: 0.5em;\n  margin-right: 0.5em;\n  vertical-align: text-top;\n}\n\n.examma-ray-summation-grader label {\n  margin-bottom: 0;\n}\n\n.examma-ray-summation-grader .examma-ray-mc-option {\n  vertical-align: text-top;\n}\n\n.examma-ray-summation-grader .examma-ray-mc-option pre {\n  vertical-align: text-top;\n}\n\n.examma-ray-question-overview {\n  margin: 0.3em;\n}\n\n.examma-ray-question-overview .card-header {\n  padding: 0.25rem;\n}\n\n.examma-ray-question-overview a.nav-link {\n  display: inline-block;\n  font-weight: 500;\n  padding: 0;\n}\n\n.examma-ray-question-overview .progress {\n  width: 7em;\n  background-color: #c8c8c8;\n}\n\n.examma-ray-question-overview pre code .progress {\n  width: 35em;\n  background-color: #c8c8c8;\n}\n\n.examma-ray-question-overview .progress-bar {\n  padding-left: 0.4em;\n  padding-right: 0.4em;\n  font-weight: 600;\n  text-align: left;\n}\n\n\n.examma-ray-students-overview .progress {\n  width: 7em;\n  background-color: #c8c8c8;\n}\n\n.examma-ray-section-saver .modal-body {\n  max-height: 70vh;\n  overflow-y: auto;\n}\n\n\n.examma-ray-section-saver-button {\n  float: right;\n}\n\n.examma-ray-exam-saver-status {\n  position: absolute;\n  bottom: 5px;\n  width: 190px;\n  text-align: center;\n}\n\n.btn:disabled {\n  cursor: not-allowed;\n}\n\n.sas-select-input {\n  vertical-align: middle;\n  margin-bottom: 0.5em;\n}\n\n.sas-select-label {\n  vertical-align: middle;\n  padding-right: 1em;\n  border: solid 1px transparent;\n  padding-left: 3px;\n}\n\n.sas-select-input:checked+.sas-select-label {\n  border: solid 1px rgba(0, 0, 255, 0.3);\n  background-color: rgba(0, 0, 255, 0.1);\n  border-radius: 2px;\n}\n\n.examma-ray-codemirror {\n  border: solid 1px #333;\n  margin-bottom: 1em;\n}", "",{"version":3,"sources":["webpack://./src/main.css"],"names":[],"mappings":"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","sourcesContent":["html {\n  scroll-behavior: smooth;\n}\n\n.examma-ray-sas-diff pre {\n  margin-right: 0;\n  margin-top: 0;\n  margin-bottom: 0;\n  margin-left: 1em;\n}\n\n.examma-ray-sas-diff pre>code {\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.examma-ray-sas-diff pre>svg {\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.examma-ray-sas-diff .card-header p {\n  display: inline;\n  margin-bottom: 0;\n}\n\n.examma-ray-sas-diff {\n  font-size: 0.8rem;\n}\n\n.examma-ray-fitb-diff tr>*:first-child,\n.examma-ray-sas-diff tr>*:first-child {\n  position: sticky;\n  left: 0;\n  background-color: white;\n}\n\n.examma-ray-sas-rubric-item {\n  width: 250px;\n}\n\n.examma-ray-sas-rubric-item .badge {\n  vertical-align: middle;\n}\n\n.examma-ray-mc-option>p {\n  display: inline-block;\n  margin: 0;\n}\n\n.examma-ray-incorrect>* {\n  /* color: red;\n  text-decoration: line-through !important; */\n}\n\n.examma-ray-correct>* {\n  /* color: green;\n  font-weight: bold; */\n}\n\n.examma-ray-mc-option {\n  vertical-align: middle;\n}\n\n.examma-ray-mc-option pre {\n  display: inline-block;\n  vertical-align: text-top;\n  margin-bottom: 0;\n}\n\n.examma-ray-mc-option pre code {\n  font-size: 0.8rem;\n}\n\n.card-header {\n  padding: 0.2rem 0.75rem;\n}\n\n.card-body {\n  padding: 0 0.75rem;\n  padding-top: 0.25rem;\n}\n\n.examma-ray-grading-annotation {\n  font-size: 0.8rem;\n  color: blue;\n  font-style: italic;\n}\n\ncode {\n  color: unset;\n}\n\n.examma-ray-fitb-diff {\n  font-size: 0.8rem;\n}\n\n.examma-ray-fitb-blank {\n  border: solid 1px #333;\n  padding: 0.2em;\n}\n\n.examma-ray-fitb-spacer {\n  height: 0.5em;\n  width: 1px;\n}\n\n.examma-ray-section-heading {\n  margin-bottom: 10px;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  background-color: #dedede;\n  padding: 5px;\n  margin-bottom: 5px;\n  border-bottom: solid 1px #aaa;\n}\n\n.examma-ray-section-heading>.badge {\n  font-size: 1.2em;\n  vertical-align: middle;\n}\n\n.examma-ray-section-contents {\n  width: 100%;\n  table-layout: fixed;\n  margin-left: 7px;\n}\n\n.examma-ray-section-contents td {\n  vertical-align: top;\n}\n\n.examma-ray-instructions {}\n\n.examma-ray-section-description {\n  font-size: 90%;\n}\n\n.examma-ray-section-reference {\n  font-size: 90%;\n}\n\n.examma-ray-question-description {\n  font-size: 90%;\n}\n\n.examma-ray-section-reference {\n  position: sticky;\n  top: 0;\n  max-height: 100vh;\n  overflow-y: auto;\n  padding: 5px;\n  padding-bottom: 2em;\n}\n\n\n.examma-ray-section-contents .h1,\n.examma-ray-section-contents .h2,\n.examma-ray-section-contents .h3,\n.examma-ray-section-contents .h4,\n.examma-ray-section-contents .h5,\n.examma-ray-section-contents .h6,\n.examma-ray-section-contents h1,\n.examma-ray-section-contents h2,\n.examma-ray-section-contents h3,\n.examma-ray-section-contents h4,\n.examma-ray-section-contents h5,\n.examma-ray-section-contents h6 {\n  font-size: 1rem;\n}\n\n\n.examma-ray-question-description h1,\n.examma-ray-question-description h2,\n.examma-ray-question-description h3,\n.examma-ray-question-description h4,\n.examma-ray-question-description h5,\n.examma-ray-question-description h6,\n.examma-ray-question-description h7 {\n  font-size: initial;\n}\n\n.examma-ray-question-description p {\n  margin-bottom: 1em;\n}\n\n.examma-ray-grading-report {\n  overflow-x: auto;\n  max-height: 70vh;\n}\n\n.examma-ray-grading-report form {\n  margin-bottom: 0;\n}\n\n.examma-ray-grading-report .btn-link {\n  font-size: 0.8rem;\n}\n\n.nav .examma-ray-score-badge {\n  width: 5em;\n}\n\n.rubric-item-card {\n  width: 17em;\n}\n\n.rubric-item-card .card-header {\n  padding: 0.25rem;\n}\n\n.rubric-item-card .card-body {\n  overflow-x: auto;\n}\n\n.rubric-item-card a.nav-link {\n  font-weight: 500;\n  padding: 0;\n}\n\n\n\n.examma-ray-mc-option .hljs {\n  background: unset;\n  padding: unset;\n}\n\n.examma-ray-summation-grader .examma-ray-point-adjustment-badge {\n  width: 3em;\n  margin-left: 0.5em;\n  margin-right: 0.5em;\n  vertical-align: text-top;\n}\n\n.examma-ray-summation-grader label {\n  margin-bottom: 0;\n}\n\n.examma-ray-summation-grader .examma-ray-mc-option {\n  vertical-align: text-top;\n}\n\n.examma-ray-summation-grader .examma-ray-mc-option pre {\n  vertical-align: text-top;\n}\n\n.examma-ray-question-overview {\n  margin: 0.3em;\n}\n\n.examma-ray-question-overview .card-header {\n  padding: 0.25rem;\n}\n\n.examma-ray-question-overview a.nav-link {\n  display: inline-block;\n  font-weight: 500;\n  padding: 0;\n}\n\n.examma-ray-question-overview .progress {\n  width: 7em;\n  background-color: #c8c8c8;\n}\n\n.examma-ray-question-overview pre code .progress {\n  width: 35em;\n  background-color: #c8c8c8;\n}\n\n.examma-ray-question-overview .progress-bar {\n  padding-left: 0.4em;\n  padding-right: 0.4em;\n  font-weight: 600;\n  text-align: left;\n}\n\n\n.examma-ray-students-overview .progress {\n  width: 7em;\n  background-color: #c8c8c8;\n}\n\n.examma-ray-section-saver .modal-body {\n  max-height: 70vh;\n  overflow-y: auto;\n}\n\n\n.examma-ray-section-saver-button {\n  float: right;\n}\n\n.examma-ray-exam-saver-status {\n  position: absolute;\n  bottom: 5px;\n  width: 190px;\n  text-align: center;\n}\n\n.btn:disabled {\n  cursor: not-allowed;\n}\n\n.sas-select-input {\n  vertical-align: middle;\n  margin-bottom: 0.5em;\n}\n\n.sas-select-label {\n  vertical-align: middle;\n  padding-right: 1em;\n  border: solid 1px transparent;\n  padding-left: 3px;\n}\n\n.sas-select-input:checked+.sas-select-label {\n  border: solid 1px rgba(0, 0, 255, 0.3);\n  background-color: rgba(0, 0, 255, 0.1);\n  border-radius: 2px;\n}\n\n.examma-ray-codemirror {\n  border: solid 1px #333;\n  margin-bottom: 1em;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 3645:
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ 4015:
/***/ ((module) => {



function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (typeof btoa === "function") {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ 1667:
/***/ ((module) => {



module.exports = function (url, options) {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  } // eslint-disable-next-line no-underscore-dangle, no-param-reassign


  url = url && url.__esModule ? url.default : url;

  if (typeof url !== "string") {
    return url;
  } // If url is already wrapped in quotes, remove them


  if (/^['"].*['"]$/.test(url)) {
    // eslint-disable-next-line no-param-reassign
    url = url.slice(1, -1);
  }

  if (options.hash) {
    // eslint-disable-next-line no-param-reassign
    url += options.hash;
  } // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls


  if (/["'() \t\n]/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }

  return url;
};

/***/ }),

/***/ 8:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_AMS-Regular.ttf");

/***/ }),

/***/ 842:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_AMS-Regular.woff");

/***/ }),

/***/ 2501:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_AMS-Regular.woff2");

/***/ }),

/***/ 909:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Caligraphic-Bold.ttf");

/***/ }),

/***/ 1344:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Caligraphic-Bold.woff");

/***/ }),

/***/ 1530:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Caligraphic-Bold.woff2");

/***/ }),

/***/ 8821:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Caligraphic-Regular.ttf");

/***/ }),

/***/ 8677:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Caligraphic-Regular.woff");

/***/ }),

/***/ 5998:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Caligraphic-Regular.woff2");

/***/ }),

/***/ 383:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Fraktur-Bold.ttf");

/***/ }),

/***/ 1891:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Fraktur-Bold.woff");

/***/ }),

/***/ 2668:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Fraktur-Bold.woff2");

/***/ }),

/***/ 9398:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Fraktur-Regular.ttf");

/***/ }),

/***/ 8489:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Fraktur-Regular.woff");

/***/ }),

/***/ 2089:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Fraktur-Regular.woff2");

/***/ }),

/***/ 7229:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Bold.ttf");

/***/ }),

/***/ 4746:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Bold.woff");

/***/ }),

/***/ 2790:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Bold.woff2");

/***/ }),

/***/ 3882:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-BoldItalic.ttf");

/***/ }),

/***/ 6939:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-BoldItalic.woff");

/***/ }),

/***/ 4701:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-BoldItalic.woff2");

/***/ }),

/***/ 635:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Italic.ttf");

/***/ }),

/***/ 6999:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Italic.woff");

/***/ }),

/***/ 2889:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Italic.woff2");

/***/ }),

/***/ 8843:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Regular.ttf");

/***/ }),

/***/ 1103:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Regular.woff");

/***/ }),

/***/ 5343:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Main-Regular.woff2");

/***/ }),

/***/ 4990:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Math-BoldItalic.ttf");

/***/ }),

/***/ 55:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Math-BoldItalic.woff");

/***/ }),

/***/ 397:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Math-BoldItalic.woff2");

/***/ }),

/***/ 5015:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Math-Italic.ttf");

/***/ }),

/***/ 9894:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Math-Italic.woff");

/***/ }),

/***/ 7656:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Math-Italic.woff2");

/***/ }),

/***/ 7098:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Bold.ttf");

/***/ }),

/***/ 7667:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Bold.woff");

/***/ }),

/***/ 7185:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Bold.woff2");

/***/ }),

/***/ 4048:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Italic.ttf");

/***/ }),

/***/ 1783:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Italic.woff");

/***/ }),

/***/ 565:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Italic.woff2");

/***/ }),

/***/ 2055:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Regular.ttf");

/***/ }),

/***/ 8571:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Regular.woff");

/***/ }),

/***/ 5152:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_SansSerif-Regular.woff2");

/***/ }),

/***/ 3899:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Script-Regular.ttf");

/***/ }),

/***/ 9261:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Script-Regular.woff");

/***/ }),

/***/ 7165:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Script-Regular.woff2");

/***/ }),

/***/ 8406:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size1-Regular.ttf");

/***/ }),

/***/ 2927:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size1-Regular.woff");

/***/ }),

/***/ 7296:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size1-Regular.woff2");

/***/ }),

/***/ 3007:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size2-Regular.ttf");

/***/ }),

/***/ 5031:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size2-Regular.woff");

/***/ }),

/***/ 5619:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size2-Regular.woff2");

/***/ }),

/***/ 8095:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size3-Regular.ttf");

/***/ }),

/***/ 1215:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size3-Regular.woff");

/***/ }),

/***/ 1047:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size3-Regular.woff2");

/***/ }),

/***/ 1927:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size4-Regular.ttf");

/***/ }),

/***/ 3213:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size4-Regular.woff");

/***/ }),

/***/ 5909:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Size4-Regular.woff2");

/***/ }),

/***/ 945:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Typewriter-Regular.ttf");

/***/ }),

/***/ 5145:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Typewriter-Regular.woff");

/***/ }),

/***/ 9535:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fonts/KaTeX_Typewriter-Regular.woff2");

/***/ }),

/***/ 587:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_cjs_js_github_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3044);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_github_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_css_loader_dist_cjs_js_github_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 4099:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_cjs_js_katex_min_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9606);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_katex_min_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_css_loader_dist_cjs_js_katex_min_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 1640:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_main_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5150);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_main_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_main_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 3379:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
// import hljs from 'highlight.js/lib/core'
__webpack_require__(587);
__webpack_require__(4099);
__webpack_require__(1640);
// hljs.registerLanguage('cpp', cpp);
// hljs.highlightAll();

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=frontend-graded.js.map