(function() {
  var Growlyflash,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  Growlyflash = (function() {
    function Growlyflash() {}

    return Growlyflash;

  })();

  if (window.Growlyflash == null) {
    window.Growlyflash = Growlyflash;
  }

  Growlyflash.defaults = {
    align: 'right',
    delay: 4000,
    dismiss: true,
    spacing: 10,
    target: 'body',
    title: false,
    type: null,
    "class": ['alert', 'growlyflash', 'fade'],
    before_show: function(options) {
      return this.el.css(this.calc_css_position());
    }
  };

  Growlyflash.KEY_MAPPING = {
    alert: 'warning',
    error: 'danger',
    notice: 'info',
    success: 'success'
  };

  Growlyflash.FlashStruct = (function() {
    FlashStruct.prototype.shown = false;

    function FlashStruct(msg1, key) {
      this.msg = msg1;
      this.key = key;
      this.type = Growlyflash.KEY_MAPPING[this.key];
    }

    FlashStruct.prototype.growl = function() {
      return $.growlyflash(this);
    };

    FlashStruct.prototype.is_equal = function(other) {
      return (this.key === other.key) && (this.msg === other.msg);
    };

    FlashStruct.prototype.isnt_equal = function(other) {
      return !this.is_equal(other);
    };

    return FlashStruct;

  })();

  Growlyflash.Alert = (function() {
    function Alert(flash1, options) {
      this.flash = flash1;
      this.title = options.title, this.align = options.align, this.dismiss = options.dismiss, this.msg = options.msg, this.spacing = options.spacing, this.type = options.type, this["class"] = options["class"];
      this.el = ($('<div>', {
        "class": this._classes().join(' '),
        html: "" + (this._dismiss()) + (this._title()) + this.msg
      })).appendTo(options.target);
      options.before_show.call(this, options);
      this.show();
      if (!options.delay) {
        return;
      }
      setTimeout((function(_this) {
        return function() {
          return _this.hide(function() {
            return ($(this)).remove();
          });
        };
      })(this), options.delay);
    }

    Alert.prototype.show = function() {
      return this.el.toggleClass('in');
    };

    Alert.prototype.hide = function(fn) {
      return this.el.fadeOut(fn);
    };

    Alert.prototype._classes = function() {
      var type;
      return this["class"].concat((function() {
        var i, len, ref, results;
        ref = [this.type];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          type = ref[i];
          if (type != null) {
            results.push("alert-" + type);
          }
        }
        return results;
      }).call(this), ["growlyflash-" + this.align]);
    };

    Alert.prototype._dismiss = function() {
      if (this.dismiss == null) {
        return "";
      }
      return "<a class=\"close\" data-dismiss=\"alert\" href=\"#\">&times;</a>";
    };

    Alert.prototype._title = function() {
      if (this.title === false) {
        return "";
      }
      return "<strong>" + (this.type.charAt(0).toUpperCase()) + (this.type.substring(1)) + "!</strong>";
    };

    Alert.prototype.calc_top_offset = function() {
      var amount;
      amount = parseInt(this.el.css('top'));
      (this.el.siblings('.growlyflash')).each((function(_this) {
        return function(_, el) {
          return amount = Math.max(amount, parseInt(($(el)).css('top')) + ($(el)).outerHeight() + _this.spacing);
        };
      })(this));
      return amount;
    };

    Alert.prototype.calc_css_position = function() {
      var css;
      css = {};
      css.top = (this.calc_top_offset()) + "px";
      if (this.align === 'center') {
        css.marginLeft = "-" + (this.el.width() / 2) + "px";
      }
      return css;
    };

    return Alert;

  })();

  $.growlyflash = function(flash, options) {
    var alert, settings;
    if (options == null) {
      options = {};
    }
    settings = $.extend(true, {}, Growlyflash.defaults, {
      msg: flash.msg,
      type: flash.type
    }, options);
    alert = new Growlyflash.Alert(flash, settings);
    if (flash instanceof Growlyflash.FlashStruct) {
      return flash;
    } else {
      return alert;
    }
  };

  Growlyflash.Listener = (function() {
    var EVENTS, HEADER, Stack, process, process_from_header;

    HEADER = 'X-Message';

    EVENTS = 'ajax:complete ajaxComplete';

    Stack = (function(superClass) {
      extend(Stack, superClass);

      function Stack() {
        var items;
        items = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        this.splice.apply(this, [0, 0].concat(slice.call(items)));
      }

      Stack.prototype.has_uniq_in = function(alerts, counter) {
        var base, id, item, recent;
        if (counter == null) {
          counter = 0;
        }
        if (!(this.length > 0)) {
          return true;
        }
        recent = this.slice(-alerts.length);
        for (id in alerts) {
          item = alerts[id];
          if (typeof (base = recent[id]).isnt_equal === "function" ? base.isnt_equal(item) : void 0) {
            counter++;
          }
        }
        return counter > 0;
      };

      Stack.prototype.push_all = function(alerts) {
        var alert, i, len;
        for (i = 0, len = alerts.length; i < len; i++) {
          alert = alerts[i];
          this.push(alert.growl());
        }
        return this;
      };

      Stack.prototype.push_once = function(alerts) {
        if (this.has_uniq_in(alerts)) {
          this.push_all(alerts);
        }
        return this.purge();
      };

      Stack.prototype.purge = function() {
        return setTimeout(((function(_this) {
          return function() {
            return _this.splice(0);
          };
        })(this)), 100);
      };

      return Stack;

    })(Array);

    process = function(alerts) {
      var msg, results, type;
      if (alerts == null) {
        alerts = {};
      }
      results = [];
      for (type in alerts) {
        msg = alerts[type];
        if (msg != null) {
          results.push(new Growlyflash.FlashStruct(msg, type));
        }
      }
      return results;
    };

    process_from_header = function(source) {
      if (source == null) {
        return [];
      }
      return process($.parseJSON(decodeURIComponent(source)));
    };

    function Listener(context) {
      if (this.stack == null) {
        this.stack = new Stack();
      }
      if (window.flashes != null) {
        this.process_static();
      }
      ($(context)).on(EVENTS, (function(_this) {
        return function(_, xhr) {
          _this.stack.push_once(process_from_header(xhr.getResponseHeader(HEADER)));
        };
      })(this));
    }

    Listener.prototype.process_static = function() {
      this.stack.push_all(process(window.flashes));
      return delete window.flashes;
    };

    return Listener;

  })();

  Growlyflash.listen_on = function(context) {
    return this.listener != null ? this.listener : this.listener = new this.Listener(context);
  };

  jQuery(function() {
    return Growlyflash.listen_on(this);
  });

}).call(this);
