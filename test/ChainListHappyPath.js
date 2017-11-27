var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', function(accounts) {

  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDescription1 = "Description for Article 1";
  var articlePrice1 = 10;
  var articleName2 = "article 2";
  var articleDescription2 = "Description for Article 2";
  var articlePrice2 = 20;
  var watcher;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;

  // Test case : check initial value
  it("should be initiialize with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 0x0, "number of articles must be zero")
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 0, "article for sale should be empty");
    });
  });


  // Test case: sell first article
  it("should sell a first article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName1, articleDescription1, web3.toWei(articlePrice1, "ether"), {
        from: seller
      });
    }).then(function(receipt) {
      // check event
      assert.equal(receipt.logs.length, 1, "Should have receive one event");
      assert.equal(receipt.logs[0].event, "sellArticleEvent", "event name should be sellArticleEvent");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "seller must be "  + seller);
      assert.equal(receipt.logs[0].args._name, articleName1, "article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "Article Price must be "
      + web3.toWei(articlePrice1, "ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 1, "number of articles must be one");

      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
    assert.equal(data.length, 1, "there must now be 1 article for sale");
    articleId = data[0].toNumber();
    assert.equal(articleId, 1, "article id must be 1");

      return chainListInstance.articles(articleId);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName1, "article name must be " + articleName1);
      assert.equal(data[4], articleDescription1, "article description must be " + articleDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
    });
  });

  // Test case: sell second article
  it("should sell a first article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName2, articleDescription2, web3.toWei(articlePrice2, "ether"), {
        from: seller
      });
    }).then(function(receipt) {
      // check event
      assert.equal(receipt.logs.length, 1, "Should have receive one event");
      assert.equal(receipt.logs[0].event, "sellArticleEvent", "event name should be sellArticleEvent");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "seller must be "  + seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "article name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "Article Price must be "
      + web3.toWei(articlePrice2, "ether"));

      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 2, "number of articles must be two");
      // there are two items now

      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must now be 2 articles for sale");
      articleId = data[1].toNumber();
      assert.equal(articleId, 2, "article id must be 2");

        return chainListInstance.articles(articleId);
      assert.equal(data[0].toNumber(), 2, "article id must be 2");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName2, "article name must be " + articleName2);
      assert.equal(data[4], articleDescription2, "article description must be " + articleDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article price must be " + web3.toWei(articlePrice2, "ether"));
    });
  });

  // test case: buy first article
  it("should let us buy the first article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      articleId = 1;

    // record bals before buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller),
      "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer),
      "ether").toNumber();

    return chainListInstance.buyArticle(articleId, {
      from: buyer,
      value: web3.toWei(articlePrice1, "ether")
    });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one event should have been trigger");
      assert.equal(receipt.logs[0].event, "buyArticleEvent", "event should be buyArticleEvent");
      assert.equal(receipt.logs[0].args._id.toNumber(), articleId, "articleId must be " + articleId);
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"),
      "event article price must be " + web3.toWei(articlePrice1, "ether"));

      // record bals of buyer and seller after purchase
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check bals accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should earn "
      + articlePrice1 + " Eth");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should spend "
      + articlePrice1 + " Eth");
      // it might be less "<" due to gas charges
      // the seller would not get the gas

      return chainListInstance.articles(articleId);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], buyer, "buyer must be " + buyer);
      assert.equal(data[3], articleName1, "article name must be " + articleName1);
      assert.equal(data[4], articleDescription1, "article description must be " + articleDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be "
      + web3.toWei(articlePrice1, "ether"));

      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      assert(data.length, 1, "there should be only one article left for sale");
    });
  });
});
