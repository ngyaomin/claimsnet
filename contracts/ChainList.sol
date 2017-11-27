pragma solidity ^0.4.11;

import "./Owned.sol";

contract ChainList is Owned {
  // custom type
  struct Article {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // State variables
  mapping(uint => Article) public articles;
  uint articleCounter;

  // Events
  event sellArticleEvent(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price);

  event buyArticleEvent (
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price);

  // sell article
  function sellArticle(string _name, string _description, uint256 _price)
  public {
    // a new article
    articleCounter++;

    // store article
    articles[articleCounter] = Article(
        articleCounter,
        msg.sender,
        0x0,
        _name,
        _description,
        _price
    );

    // trigger event
    sellArticleEvent(articleCounter, msg.sender, _name, _price);
  }

  // fetch number of articles in contract
  function getNumberOfArticles() public constant returns (uint) {
    return articleCounter;
  }

  // fetch and return article ids availble for sale
  function getArticlesForSale() public constant returns (uint[]) {
    // if u say is constant the state will never be alter which means it cost no gas
    // check if at least one article
    if(articleCounter == 0) {
      return new uint[](0);
    }

    // intermediary array
    uint[] memory articleIds = new uint[](articleCounter);

    uint numberOfArticlesForSale = 0;
    // iterate over articles
    for (uint i = 1; i <= articleCounter; i++) {
      // keep only id that are not yet sold
      if (articles[i].buyer == 0x0) {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    // copy articleids array into forsale array
    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for (uint j = 0; j < numberOfArticlesForSale; j++) {
      forSale[j] = articleIds[j];
    }
    return (forSale);
  }

  // buy article
  // note payable must be declared if not u can sent value to it
  function buyArticle(uint _id) payable public {
    require(articleCounter > 0); // there is article for sale
    require(_id > 0 && _id <= articleCounter); // check if article exists
    Article storage article = articles[_id];
    require(article.buyer == 0x0); // aritcle not been brought yet
    require(msg.sender != article.seller); // buyer is not seller
    require(msg.value == article.price); // value is = price
    article.buyer = msg.sender; // keeps buyer info
    article.seller.transfer(msg.value); // buyers buys the article
    buyArticleEvent(_id, article.seller, article.buyer, article.name, article.price);
  }

  // kill
  function kill() onlyOwner {
    // only only can kill
    selfdestruct(owner);
  }
}
