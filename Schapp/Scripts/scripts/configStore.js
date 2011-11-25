window.tools = {
  isEmail: function (email) { return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(email) }
}
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