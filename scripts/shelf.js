$(function(){
  var Game = Backbone.Model.extend({
    defaults: function() {
      return {
        name: "<name goes here>"
      };
    }
  });

  var GameList = Backbone.Collection.extend({
    model: Game,
    localStorage: new Backbone.LocalStorage("shelf"),
    comparator: "name"
  });

  var Games = new GameList;

  // View for a single Game
  var GameView = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#game-template").html()),

    events: {
      "dblclick .view" : "edit",
      "click a.destroy": "destroy",
      "keypress .edit" : "updateOnEnter",
      "blur .edit"     : "finishEdit"
    },

    initialize: function() {
      this.listenTo(this.model, "change", this.render);
      this.listenTo(this.model, "destroy", this.remove);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.input = this.$(".edit");
      return this;
    },

    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.finishEdit();
    },

    finishEdit: function() {
      var value = this.input.val();
      if (! value) {
        this.destroy();
      } else {
        this.model.save({name: value});
        this.$el.removeClass("editing");
      }
    },

    destroy: function() {
      this.model.destroy();
    }
  });

  // View for the whole app
  var AppView = Backbone.View.extend({
    el: $("#shelfapp"),

    events: {
      "keypress #new-game": "createOnEnter"
    },

    initialize: function() {
      this.input = this.$("#new-game");
      this.listenTo(Games, "add", this.addOne);
      this.listenTo(Games, "reset", this.addAll);
      this.listenTo(Games, "all", this.render);
      this.main = $("#main");
      Games.fetch();
    },

    render: function() {
      if (Games.length) {
        this.main.show();
      } else {
        this.main.hide();
      }
    },

    addOne: function(game) {
      var view = new GameView({model: game});
      this.$("#game-list").append(view.render().el);
    },

    addAll: function() {
      Games.each(this.addOne, this);
    },

    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;
      Games.create({name: this.input.val()});
      this.input.val("");
    }
  });

  var App = new AppView;
});
