TestCase("configStoreTest", {
  setUp: function () {
    this.store = new ConfigStore("configs");
  },
  tearDown: function () {
    this.store.save({});
    delete this.store;
  },
  "test empty store has empty lists": function () {
    assertEquals([], this.store.getAllLists());
  },
  "test empty store contains nothing": function () {
    assertEquals({}, this.store.get());
  },
  "test adding one shopping list": function () {
    this.store.addList("aa", "Test List");
    var lists = this.store.getAllLists();
    lists = _.filter(lists, function (elem) { return elem.link == "aa" });
    assertEquals(1, lists.length);
    var list = lists[0];
    assertEquals("aa", list.link);
    assertEquals("Test List", list.name);
  },
  "test adding and deleting multiple lists": function () {
    this.store.addList("aa", "Test List");
    assertEquals(1, this.store.getAllLists().length);
    this.store.addList("ab", "Test List");
    assertEquals(2, this.store.getAllLists().length);
    this.store.addList("ac", "Test List");
    assertEquals(3, this.store.getAllLists().length);
    assertEquals([], _.difference(["aa", "ab", "ac"], _.pluck(this.store.getAllLists(), "link")));
    this.store.delList("aa");
    assertEquals(2, this.store.getAllLists().length);
    this.store.delList("ac");
    assertEquals(1, this.store.getAllLists().length);
    this.store.delList("ab");
    assertEquals(0, this.store.getAllLists().length);
  }
  ,
  "test adding same list twice": function () {
    this.store.addList("aa", "Test List");
    assertEquals(1, this.store.getAllLists().length);
    this.store.addList("aa", "Test List");
    assertEquals(1, this.store.getAllLists().length);
    this.store.addList("ab", "Test List");
    assertEquals(2, this.store.getAllLists().length);
  }
});


TestCase("emailRegExpTester", {
  "test simpleemails": function () {
    assertTrue(window.tools.isEmail("abc@abc.com"));
    assertTrue(window.tools.isEmail("abc@welcome-mars.it"));
    assertTrue(window.tools.isEmail("m_m.M-m@m.it"));
    assertFalse(window.tools.isEmail("m_m.M-m@.it"));
  }
});