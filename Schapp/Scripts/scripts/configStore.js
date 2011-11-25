ConfigStore = function (key) {
  this.key = "configStore";
  this.save = function (data) {
    localStorage.setItem(this.key, JSON.stringify(data))
  };
  this.get = function () {
    return JSON.parse(localStorage.getItem(this.key) || "{}");
  };
  this.delList = function (link) {
    var config = this.get();
    config.unique_hash[link] = false;
    config.lists = _.filter(config.lists, function (l) { return l.link != link });
    this.save(config);
  };
  this.addList = function (link, name, afterSave, context) {
    var config = this.get(), newentry;
    config.unique_hash = config.unique_hash || {};
    if (config.unique_hash[link]) {
      return;
    } else {
      newentry = { link: link, name: name };
      config.lists = config.lists || []
      config.lists.unshift(newentry);
      config.unique_hash[link] = true;
      this.save(config);
      if (afterSave) { afterSave.call(context || this, newentry) }
    }
  };
  this.getAllLists = function () {
    return (this.get() || {}).lists || [];
  };
};