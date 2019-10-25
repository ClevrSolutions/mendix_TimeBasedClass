define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",


], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent) {
    "use strict";

    return declare("TimeBasedClass.widget.TimeBasedClass", [ _WidgetBase ], {

        // Proprties
        referenceDateAttribute: null,
        className: null,
        classNameMidnight: null,
        applyToEnum: null,
        parentLevel: null,
        refreshSeconds: 0,

        // Internal variables.
        _contextObj: null,
        elementToApplyTo: null,
        _timer: null,
        _timerStarted: false,

        postCreate: function () {
            dojoStyle.set(this.domNode, "display", "none");

            switch (this.applyToEnum) { //Select the right element to apply the class too
            case "PARENT":
                this.elementToApplyTo = this.domNode.parentElement;
                break;
            case "PARENTv2":
                this.elementToApplyTo = this.domNode.parentElement;
                for ( var i = 1 ; i < this.parentLevel ; ++i ) this.elementToApplyTo = this.elementToApplyTo.parentElement;
                break;
            case "SIBLING":
                this.elementToApplyTo = this.domNode.previousSibling;
                break;
            default:
                this.elementToApplyTo = this.domNode;
            }
        },

        uninitialize: function() {
            this._stopTimer();
        },

        update: function (obj, callback) {
            if (obj) {
                this._contextObj = obj;
                this._resetSubscriptions();

                this._runTimer();
            }
            this._updateRendering();
            callback();
        },


        _updateRendering: function () {
            var showClass = false;
            var showClassMidnight = false;

            if (this._contextObj) {
                var time = this._contextObj.get(this.referenceDateAttribute);
                if ( time ) {
                    var hours = mx.parser.formatValue(time, 'datetime', { datePattern: "HH" });
                    if ( hours == '00') {
                        showClassMidnight = true;
                    }

                    var now = new Date();

                    var timestringHoursNow = mx.parser.formatValue(now, 'datetime', { datePattern: "yyyyMMddHH" });
                    var timestringHoursAttribute = mx.parser.formatValue(time, 'datetime', { datePattern: "yyyyMMddHH" });

                    if ( timestringHoursAttribute == timestringHoursNow ) {
                        showClass = true;
                    }
                }
            }

            this._toggleClass( this.className, showClass );
            this._toggleClass( this.classNameMidnight, showClassMidnight );
        },

        _toggleClass: function(toggleClassName, toggle) {
            if (toggle) {
                dojoClass.add(this.elementToApplyTo, toggleClassName);
            } else {
                dojoClass.remove(this.elementToApplyTo, toggleClassName);
            }
        },

        _resetSubscriptions: function() {
            if (this._contextObj) {
                this.unsubscribeAll();

                this.subscribe({
                    guid : this._contextObj.getGuid(),
                    attr : this.referenceDateAttribute,
                    callback : lang.hitch( this, function(guid, attr, attrValue) {
                        this._updateRendering();
                    })
                })
            }
        },

        _runTimer: function() {
            if (!this._timerStarted && this.refreshSeconds!==null && this.refreshSeconds!=0) {
                this._timerStarted = true;
                this._timer = setInterval(lang.hitch(this, this._updateRendering), this.refreshSeconds * 1000);
            }
        },

        _stopTimer: function() {
            this._timerStarted = false;
            if (this._timer !== null) {
                clearInterval(this._timer);
                this._timer = null;
            }
        }

    });
});

require(["TimeBasedClass/widget/TimeBasedClass"]);
