'use strict';
(function() {

    let Utils = {
        mix: function(des, src, override) {
             if (src && src.constructor == Array) {
                 for (var i = 0, len = src.length; i < len; i++) {
                     this.mix(des, src[i], override);
                 }
                 return des;
             }
             if (typeof override == 'function') {
                 for (i in src) {
                     des[i] = override(des[i], src[i], i);
                 }
             }
             else {
                 for (i in src) {
                     if (override || !(des[i] || (i in des))) { 
                         des[i] = src[i];
                     }
                 }
             }
             return des;
         },
        /*
        * 使object的原型链尾端指向inherited, 拥有inherited的属性和方法
        */
        chainObject: function(object, inherited) {
            if (object && inherited && object !== inherited) {
                if (!Object.__proto__) {
                    object = this.mix(Object.create(inherited), object, true);
                } else {
                    // 首先找到object原型链末端
                    let lastPrototype = object;
                    while(lastPrototype.__proto__ && lastPrototype.__proto__.__proto__) {
                        lastPrototype = lastPrototype.__proto__;
                    }
                    lastPrototype.__proto__ = inherited;
                }
            }
            return object;
        }

    }

    Nova.Utils = Utils;
})();
