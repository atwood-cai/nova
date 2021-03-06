'use strict';
(function() {
    /*
    * Properties功能：
    * 1. 定义props中声明的properties，监听变化
    * 2. 通过attributes初始化properties
    * 3. 监听attributes，变化时，同步更新到props声明的properties
    * */
    let PropBehavior = {
        props: function() {
            /*
            prop: {
                type: 'String',
                value: 'haha',
                observe: '_xxx',
                reflectToAttribute: false
            },
            prop2: Object       // Object, Number, String, Boolean, Date, Array
            */
        },

        /*
        * Used when transfering attribute to prop
        */
        _propTypes: [Object, Number, String, Boolean, Date, Array],

        createdHandler: function() {
            initProperties.call(this);
        },

        attributeChangedHandler: function(attrName, oldVal, newVal) {
            let propName = Nova.CaseMap.dashToCamelCase(attrName);
            let prop = this.props[propName]
            if(prop) {
                setPropFromAttr.call(this, attrName, newVal);
            }
        },

    }

    /*
     * 初始化props
     * 1. 将props转换为标准格式{type:String, ...}
     * 2. 解析props的config，解析并应用到this
     * 3. 将attribute上的属性应用到props
     * */
    function initProperties() {
        let proto = {};
        let oldProto = this.__proto__;
        this.__proto__ = proto;
        proto.__proto__ = oldProto;
        for(let prop in this.props) {
            if(this.props.hasOwnProperty(prop)) {
                transferProperty.call(this, prop);
                defineProperty.call(this, prop, this.props[prop]);
            }
        }
    }

    /*
    * 通过Attribute，设置property
    * */
    function setPropFromAttr(attrName) {
        let propName = Nova.CaseMap.dashToCamelCase(attrName);
        let prop = this.props[propName]
        let val = this.getAttribute(attrName);
        this[propName] = fromAttrToProp.call(this, attrName, val, prop);
    }

    /*
    * 将props转换为完整定义
    * */
    function transferProperty(prop) {
        let value = this.props[prop];
        // 检测是否简单写法，如果是，转换成完整写法
        if(this._propTypes.indexOf(value) >= 0) {
            this.props[prop] = {
                type: this.props[prop]
            }
        }
    }

    /*
    * 定义单个property
    * */
    function defineProperty(name, config) {
        var self = this;
        var realPropPrefix = '_prop_';

        Object.defineProperty(this.__proto__, name, {

            get: function() {
                return self[realPropPrefix + name];
            },
            set: function(val) {
                //alert('set:' + name + ' to ' + val);
                let oldVal = self[realPropPrefix + name];

                if(val == oldVal) {return;}

                self[realPropPrefix + name] = val;
                // TODO: 实现relectToAttribute
                /*
                if(config.reflectToAttribute) {
                    self.setAttribute(name, fromPropToAttr.call(this, config));
                }
                */
                self.trigger(getPropChangeEventName(name), [oldVal, val]);

            }
        });


        // init observers
        if(config.observer) {
            this.on(getPropChangeEventName(name), function() {
                if(self[config.observer]) {
                    self[config.observer].apply(self, arguments);
                }
            });
        }

        // set value
        let attrName = Nova.CaseMap.camelToDashCase(name);
        if(this.hasAttribute(attrName)) {
            setPropFromAttr.call(this, attrName);
        }
        else if(config.hasOwnProperty('value')) {
            if(typeof config.value == 'function') {
                this[name] = config.value.apply(this);
            } else {
                this[name] = config.value;
            }
        }
    }

    function fromAttrToProp(attrName, value, config) {
        var type = config.type;
        if(type != String) {
            value = value.trim();
        }

        let result = value;
        switch(type) {
            case Object:
            case Array:
                result = JSON.parse(value);
                break;
            case Number:
                result = Number(value);
                break;
            case Date:
                result = new Date(value);
                break;
            case Boolean:
                return (this.hasAttribute(attrName));
                break;
        }
        return result;
    }

    function getPropChangeEventName(propName) {
        return '_' + propName + 'Changed';
    }

    Nova.PropBehavior = PropBehavior;
})();
