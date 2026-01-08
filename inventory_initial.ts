/**
======================================================
INITIAL CODE
======================================================

Grocery Inventory Requirements Specification
======================================================

This exercise focuses on refactoring a legacy inventory system and extending
its functionality using Test-Driven Development (TDD).

The system manages grocery items whose quality changes over time.
Each item has a sell-by date and a quality value that are updated daily.

Core rules:

- Each item has a `sellIn` value representing the number of days remaining to sell it
- Each item has a `quality` value representing its value
- At the end of each day, both values are updated

Quality rules:

- Once the sell-by date has passed, quality degrades twice as fast
- Quality is never negative
- Quality never exceeds 25

Special items:

- "Cheddar Cheese" increases in quality as it ages
- "Instant Ramen" never decreases in quality or sell-in value

Organic items:

- Organic items degrade in quality twice as fast as normal items
- After the sell-by date, organic items degrade four times as fast

Expiration rule:

- Any item that is 5 days past its sell-by date must be removed from inventory

Testing requirements:

- Changes should be driven by unit tests
- Unit tests must be written using the Chai assertion library
- Existing behavior must be preserved while extending functionality
- Tests should cover normal behavior, edge cases, and boundary conditions

Objectives:

- Apply Test-Driven Development principles
- Improve code readability, maintainability, and testability
- Ensure the system is safe to extend without regressions
*/



/**
 * Classes
 */

class Item {
  name: string;
  sellIn: number;
  quality: number;
  size?: boolean;

  constructor(name: string, sellIn: number, quality: number) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

class StoreInventory {
  items: Array<Item>;

  constructor(items: Array<Item> = []) {
    this.items = items;
  }

  updateQuality() {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      if (item.name !== 'Cheddar Cheese') {
        if (item.quality > 0) {
          if (item.name !== 'Instant Raman') {
            item.quality = item.quality - 1;
          }
        }
      } else {
        if (item.quality < 50) {
          item.quality = item.quality + 1;
        }
      }

      if (item.name !== 'Instant Raman') {
        item.sellIn = item.sellIn - 1;
      }

      if (item.sellIn < 0) {
        if (item.name !== 'Cheddar Cheese') {
          item.quality = item.quality - item.quality;
        } else {
          if (item.quality < 50) {
            item.quality = item.quality + 1;
          }
        }
      }
    }

    return this.items;
  }
}

/**
 * Implementations
 */

let items = [
  new Item("Apple", 10, 10),
  new Item("Banana", 7, 9),
  new Item("Strawberry", 5, 10),
  new Item("Cheddar Cheese", 10, 16),
  new Item("Apple", 0, 5),
  // This Organic item does not work properly yet
  new Item("Organic Avocado", 5, 16),
];

let storeInventory = new StoreInventory(items);
let days: number = 2;

for (let i = 0; i < days; i++) {
  console.log("Day " + i + " ---------------------------------------------");
  console.log("name | sellIn | quality");

  const data = items.map(item => [
    item.name,
    item.sellIn,
    item.quality,
  ]);

  console.table(data);
  console.log();

  storeInventory.updateQuality();
}

/**
 * Unit Tests
 */

const { expect, use } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

use(sinonChai);

const describe = (name: string, cb: Function) => {
  console.log(name);
  console.group();
  cb();
  console.groupEnd();
};

const it = (name: string, cb: Function) => {
  try {
    cb();
    console.log(`✅ ${name}`);
  } catch (e) {
    console.warn(`❌ ${name}`);
    console.error(e);
  }
};

describe('Item', () => {
  it('should decrement quality daily', () => {
    let testItems = [
      new Item("test", 10, 10),
    ];

    let testInventory = new StoreInventory(testItems);
    testInventory.updateQuality();

    expect(testItems[0].quality).to.equal(9);
  });

  it('should increment Cheddar Cheese quality daily', () => {
    let testItems = [
      new Item("Cheddar Cheese", 10, 10),
    ];

    let testInventory = new StoreInventory(testItems);
    testInventory.updateQuality();

    expect(testItems[0].quality).to.equal(11);
  });
});
