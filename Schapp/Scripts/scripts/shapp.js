

(function () {
  /* -------------------------------------------- ------ -------------------------------------------- */
  /* -------------------------------------------- MODELS -------------------------------------------- */
  /* -------------------------------------------- ------ -------------------------------------------- */
  window.SendModel = Backbone.Model.extend({
    defaults: function () {
      return { email: null, link: null };
    }
    , url: function () { return '/api/lists/send'; }
  });

  window.ShoppingItem = Backbone.Model.extend({
    defaults: function () {
      return { name: 'New Item', price: 0.0, shop: "New Shop", quantity: 1, id: Math.random(), done: false };
    }
    , validate: function (params) {
      if (params.price && isNaN(params.price)) return "Price needs to be a valid number";
      if (params.quantity && isNaN(params.quantity)) return "Quantity needs to be a valid number";
    }
    , sync: function (method, model, options) { options.success(); }
  });
  window.ShoppingItemList = Backbone.Collection.extend({ model: ShoppingItem });
  window.ShoppingList = Backbone.Model.extend({
    initialize: function () {
      this._items = new ShoppingItemList;
      this._items.bind('change', this.saveChanges, this);
    }
        , saveChanges: function () { this.save() }
        , toJSON: function () {
          var attrs = _.clone(this.attributes);
          if (this._items.length) attrs['item'] = this._items.toJSON();
          return attrs;
        }
        , parseItems: function (model, resp) {
          model._items.reset(_.map(resp.item, function (e) { return new ShoppingItem(e) }));
          return resp;
        }
        , url: function () {
          var l = this.get('link');
          return l ? '/api/lists/' + l : '/api/lists';
        }
        , isNew: function () {
          return this.get('link') == null;
        }
        , defaults: function () {
          return {
            name: 'New List'
          , link: null
          };
        }
        , _m: null
        , _in_waiting: false
        , sync: function (method, model, options) {
          var m = this, success = options.success,
            t = function () {
              m._in_waiting = false;
              if (m._m) {
                Backbone.sync(method, m._m, options);
              } else return;
              m._m = null;
            };
          m._m = model;
          if (method != 'update') {
            Backbone.sync(method, model, options);
          } else {
            options.success = null;
            if (!m._in_waiting) { setTimeout(t, 500); m._in_waiting = true; }
            if (success) success(model, model);
          }
        }
  });


  /* -------------------------------------------- ----- -------------------------------------------- */
  /* -------------------------------------------- VIEWS -------------------------------------------- */
  /* -------------------------------------------- ----- -------------------------------------------- */

  window.ShoppingItemView = Backbone.View.extend({
    tagName: "li"
          , template: _.template($('#item-template').html())
          , events: {
            "click .checkitem": "toggleDone"
            , "click .edititem": "toggleEdit"
            , "click .item-delete-confirm": "deleteItem"
            , "click .item-save-confirm": "saveItem"
          }
          , initialize: function () {
          }
          , saveItem: function () {
            this.model.set({ "name": this.$(".item-name-input").val(), "price": this.$(".item-price-input").val(), "quantity": this.$(".item-qty-input").val() });
            $(this.render().el).trigger("create");
          }
          , deleteItem: function () {
            if (confirm("Really delete '" + this.model.get("name") + "'?")) {
              this.model.destroy();
              this.remove();
            }
          }
          , closeEdit: function () {
            this.$('.editFields').addClass('hidden');
            this.$('.edititem .darrow').html('edit');
          }
          , openEdit: function () {
            this.$('.editFields').removeClass('hidden');
            this.$('.edititem .darrow').html('X');
          }
          , toggleEdit: function (e) {
            if (this.$('.editFields').hasClass('hidden')) {
              this.openEdit();
            } else {
              this.closeEdit();
            }
          }
          , toggleDone: function (e) {
            if (!this.model.get("done")) {
              $(this.el).addClass("done");
              this.closeEdit();
            } else {
              $(this.el).removeClass("done");
            }
            this.model.set({ "done": !this.model.get("done") });
          }
          , render: function () {
            $(this.el).html(this.template(this.model.toJSON()));
            if (this.model.get("done")) { $(this.el).addClass("done"); }
            return this;
          }
  });


  window.SendView = Backbone.View.extend({
    el: $('#sendEmail-page')
          , events: {
            "click .email-input-confirm": "sendOnClick"
            , "keypress .email-input-field": "sendOnEnter"
          }
          , initialize: function () {
            this.input = this.$('.email-input-field');
          }
          , render: function () {
            this.$(".shoppingList-link").attr("href", "#list/" + this.model.get('link'));
          }
          , sendOnClick: function (e) { return this.sendOn(e, function (e) { return false; }); }
          , sendOnEnter: function (e) { return this.sendOn(e, function (e) { return e.keyCode != 13; }); }
          , sendOn: function (e, filter) {
            var email = this.input.val(), olink = this.model.get('link'), view = this;
            if (filter(e)) return;
            if (!tools.isEmail(email)) {
              this.$(".error").removeClass("hidden");
            } else {
              this.$(".error").addClass("hidden");
              App.show_loading();
              this.model.save({ email: email, link: document.location.href.replace('send', 'list') }
              , {
                error: function (model, error) {
                  alert(error);
                  App.hide_loading();
                }
                , success: function () {
                  App.hide_loading();
                  view.tearDown();
                  listRouter.navigate("list/" + olink, true);
                }
              });
            }
          }
          , tearDown: function () {
            this.model.unbind();
            this.$(".shoppingList-link").unbind();
            this.el.unbind();
          }
  });


  window.ShoppingListView = Backbone.View.extend({
    el: $('#shoppingList-page')
          , events: {
            "click .list-name-text": "edit"
            , "click .list-name-input-confirm": "close"
            , "keypress .list-item-input": "addOnEnter"
            , "click .list-item-input-confirm": "addOnClick"
            , "click .toggleHideDone": "toggleHideDone"
          }
          , initialize: function () {
            this.nameinput = this.$('.list-name-input');
            this.addinput = this.$('.list-item-input');
            this.nameinput.bind('blur', _.bind(this.close, this));
            this.model._items.bind('add', this.addOne, this);
            this.model._items.bind('reset', this.addAll, this);
            this.model._items.bind('destroy', this.removeItem, this);
            this.model.bind('change', this.render, this);
          }
          , removeItem: function (model) {
            this.model._items.remove(model);
            this.model.save();
          }
          , toggleHideDone: function () {
            $("#shoppinglist-items").toggleClass("hideDone");
          }
          , render: function () {
            this.$(".emailSender").attr('href', "#send/" + this.model.get('link'));
            var text = this.model.get('name');
            this.$('.list-name-text').text(text);
            this.nameinput.val(text);
            this.addinput.val('');
            return this.el;
          }
          , edit: function () {
            $(this.el).addClass("editing");
            this.nameinput.focus();
          }
          , close: function () {
            this.model.save({ name: this.nameinput.val() });
            $(this.el).removeClass("editing");
          }
          , updateOnEnter: function (e) {
            if (e.keyCode == 13) this.close();
          }
          , addOne: function (item) {
            var view = new ShoppingItemView({ model: item });
            $("#shoppinglist-items").append(view.render().el);
          }
          , addAll: function () {
            var widgetlist = [];
            this.model._items.each(function (item) { widgetlist.push(new ShoppingItemView({ model: item }).render().el); });
            $("#shoppinglist-items").html(widgetlist);
          }
          , addOnClick: function (e) { return this.addOn(e, function (e) { return false; }); }
          , addOnEnter: function (e) { return this.addOn(e, function (e) { return e.keyCode != 13; }); }
          , addOn: function (e, filter) {
            var name = this.addinput.val(), view = this;
            if (!name || filter(e)) return;
            this.model._items.create(
            { name: name, price: this.$('.list-price-input').val(), quantity: this.$('.list-qty-input').val() }
            , {
              error: function (model, error) {
                alert(error);
              }
              , success: function () {
                view.model.save();
                view.$('.item-input-field').each(function (i, elem) { elem = $(elem); elem.val(elem.attr("_default") || ""); });
              }
            }
          );
          }
          , tearDown: function () {
            this.model._items.unbind();
            this.model.unbind();
            this.nameinput.unbind();
            this.el.unbind();
            this.$("input.toggleHideDone").unbind();
            delete this.model._items;
            $("#shoppinglist-items").empty();
          }
  });

  /* -------------------------------------------- --- -------------------------------------------- */
  /* -------------------------------------------- APP -------------------------------------------- */
  /* -------------------------------------------- --- -------------------------------------------- */

  window.MainAppView = Backbone.View.extend({
    el: $("#homepage")
          , list_template: _.template($('#homelist-template').html())
          , current_page: 0
          , events: {
            "keypress #new-slist-name": "createOnEnter"
            , "click .button": "createOnClick"
            , "click #home-myLists": "deleteList"
          }
          , navigate_to: function (n) {
            window.scrollTo(0, 1);
            var reverseClass = (this.current_page > n) ? " reverse" : ""
              , pages = $("#root > .container")
              , frompage = $(pages.get(this.current_page))
              , topage = $(pages.get(n))
              , activePageClass = "active-page"
              , transEnd = function (e) {
                frompage.removeClass(activePageClass + " out slide " + reverseClass);
                topage.removeClass("in slide" + reverseClass);
                topage.unbind('webkitAnimationEnd');
                topage.unbind('animationend');
                topage.unbind('oAnimationEnd');
              };
            if (window.support['cssTransitions']) {
              topage.bind('webkitAnimationEnd', transEnd, this);
              topage.bind('animationend', transEnd, this);
              topage.bind('oAnimationEnd', transEnd, this);
              frompage.addClass("slide out" + reverseClass);
              topage.addClass("slide in " + activePageClass + reverseClass);
            } else {
              frompage.removeClass(activePageClass);
              topage.addClass(activePageClass);
            }
            this.current_page = n;
          }
          , show_loading: function () {
            $("body > .loading.hidden").removeClass("hidden");
          }
          , hide_loading: function () {
            $("body > .loading").addClass("hidden");
          }
          , initialize: function () {
            this.input = $("#new-slist-name");
            this.configStore = new ConfigStore("configStore");
          }
          , deleteList: function (e) {
            if ($(e.target).hasClass("dellist")) {
              var name = $(e.target).parents("li").find("span.listname").text();
              if (confirm("Do you want to delete this list: " + name)) {
                var link = $(e.target).attr("_link");
                this.configStore.delList(link);
                var allLists = this.configStore.getAllLists();
                this.$('#home-myLists').html("<h1>Your Lists</h1><ul class=\"listview\">" + _.map(allLists, this.list_template).join("") + "</ul>");
                this.$('#home-myLists').addClass("rendered");
              } 
            }
          }
          , render: function () {
            this.navigate_to(1);
          }
          , reset: function () {
            var allLists = this.configStore.getAllLists();
            if (allLists.length && !this.$('#home-myLists').hasClass("rendered")) {
              this.$('#home-myLists').html("<h1>Your Lists</h1><ul class=\"listview\">" + _.map(allLists, this.list_template).join("") + "</ul>");
              this.$('#home-myLists').addClass("rendered");
            }
            this.input.val('');
            this.render();
          }
          , addListToHomeView: function (entry) {
            this.$('#home-myLists .listview').prepend(this.list_template(entry));
          }
          , createOnClick: function (e) { return this.createOn(e, function (e) { return false; }); }
          , createOnEnter: function (e) { return this.createOn(e, function (e) { return e.keyCode != 13; }); }
          , createOn: function (e, filter) {
            var text = this.input.val(), view = this;
            if (!text || filter(e)) {
              if (!text && !filter(e)) this.$(".error").removeClass("invisible");
              return;
            }
            if (this.shoppinglist_view) { this.shoppinglist_view.tearDown(); }
            this.shoppinglist_view = new ShoppingListView({ model: new ShoppingList({ name: text }) });
            this.shoppinglist_view.model.save({}, { success:
              function (model) {
                view.configStore.addList(model.get("link"), model.get("name"), view.addListToHomeView, view);
                this.$(".error").addClass("invisible");
                listRouter.navigate("list/" + model.get('link'), true);
              }
            });
          }
          , openList: function (link) {
            var view = this;
            if (this.shoppinglist_view) {
              if (this.shoppinglist_view.model.get("link") !== link) {
                this.shoppinglist_view.tearDown();
              } else {
                App.navigate_to(2);
                return;
              }
            }
            this.shoppinglist_view = new ShoppingListView({ model: new ShoppingList({ 'link': link }) });
            this.shoppinglist_view.model.fetch({ success: function (model) {
              view.shoppinglist_view.model.parseItems.apply(view.shoppinglist_view.model, arguments);
              view.configStore.addList(model.get("link"), model.get("name"), view.addListToHomeView, view);
              view.navigate_to(2);
            }
            });

          }
          , sendEmail: function (link) {
            this.send_view = new SendView({ model: new SendModel({ 'link': link }) });
            this.send_view.render();
          }
  });
  window.App = new MainAppView();

  ListRouter = Backbone.Router.extend({
    routes: { "home": "resetView"
            , "send/:link": "sendEmail"
            , "list/:link": "openList"
            , "*other": "resetView"
    }
        , openList: function (link) {
          App.openList(link);
        }
        , resetView: function () {
          App.reset();
        }
        , sendEmail: function (link) {
          App.sendEmail(link);
          App.navigate_to(3);
        }
  });
  listRouter = new ListRouter;
  Backbone.history.start();
})();