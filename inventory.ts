/**
======================================================
REFACTORED
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

/**  
 * Item class: Represents a single item in the inventory
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

/**  
 * Interface ItemUpdater: Interface for all the update strategies/update implementations
 * Each strategy has logic to update quality and sellIn for its specific item type
 */
interface ItemUpdater{
  update(item: Item): void;
}

/**  
 * Abstract base class for all the item updaters
 * Each strategy has logic to update quality and sellIn for its specific item type
 * - This class provides functionality to set the limit of the Quality that is between 0 and 25
 * - Hook for future seasonal promotions (extension)
 */
abstract class BaseUpdater implements ItemUpdater{
  protected maxQuality = 25;
  protected minQuality = 0;

  /**  
   * Adjust quality in the range [0, 25].
   * This is used in the most updaters to apply the business requirements
   */
  protected adjustQualityLimits(item:Item){
    item.quality = Math.max(this.minQuality, Math.min(this.maxQuality, item.quality))
  }

  /**  
   * Extension for seasonal promotion rules.
   * Currently does nothing but can be enhanced and used in the future
   */
  protected applySeasonalPromotions(item:Item): void{
    // if(item.sellIn <= 3){
    //   //Mark item on sale
    // }
  }

  abstract update(item: Item): void;
}

/**
 * Cheeseupdater class: 
 * - logic to increase the quality of Cheddar cheese as it olds
 * - Degrade the item quality 1/day 
 * - Degrade the item quality 2/day after the sellIn date passed
 * - sellIn decreases daily
 */
class CheeseUpdater extends BaseUpdater{
  update(item: Item){
    item.sellIn--;
    const increase = item.sellIn < 0 ? 2 : 1; //increase quality by 2 units if sellIn date passes 
    item.quality += increase;
    this.adjustQualityLimits(item)
  }
}

/**
 * RamenUpdater class: 
 * - No change in quality or sellIn of the item if its "Instant Ramen"
 */
class RamenUpdater{
  update(_item: Item){
    //Pass, No changes to quality or sellIn
  }
}

/**
 * OrganicUpdater class: Logic to implement 
 * - Degrade the item quality 2/day 
 * - Degrade the item quality 4/day after the sellIn date passed
 * - sellIn decreases daily
 */
class OrganicUpdater extends BaseUpdater{
  update(item: Item){
    item.sellIn--;
    const degradation = item.sellIn < 0 ? 4 : 2; //decrease the quality by 4 units after sellIn
    item.quality -= degradation;
    this.adjustQualityLimits(item)
  }
}

/**
 * NormalUpdater class: For default items
 * - Quality for normal items decreases 1 per day 
 * - Quality decreases by 2 per day after the sellIn date passed
 * - sellIn decreases daily
 */
class NormalUpdater extends BaseUpdater{
  update(item: Item){
    item.sellIn--;
    const degradation = item.sellIn < 0 ? 2 : 1; //decrease the quality by 2 units after sellIn
    item.quality -= degradation;
    this.adjustQualityLimits(item)
  }
}

/**
 * StoreInventory: Main inventory management class
 * - Single source for update rules for different items
 * - Extensible to add new item types
 * - Open for extension
 */
class StoreInventory {
    private items: Item[];

    //Constructor: ensures inventory has its own instances
    constructor(items: Item[] = [] ) {
        this.items = items.map(item => new Item(item.name, item.sellIn, item.quality));
    }

    /**
     *return copy of the items array
     */
    getItems(): Item[]{
      return [...this.items] //Return a copy to prevent external mutations
    }

    //Exact name matcher (for fast lookup) - keys are stored in lowercase for case-insensitive
    private readonly namedUpdaterMatcher = new Map<string, ItemUpdater> ([
      ['cheddar cheese', new CheeseUpdater()],
      ['instant ramen', new RamenUpdater()],
      //Add more items for exact name match
    ])

    //Fallback matcher, check the pattern match in the item name (for organic items), and default matcher
    private readonly fallbackMatcher = [
      {matches: (name: string) => name.toLowerCase().startsWith('organic'), updater: new OrganicUpdater()},
      {matches: (name: string) => true, updater: new NormalUpdater()}, //catch all other default items
    ]

    /**
     * Main method which update all items at the day end and removes the expired items
     * - Each item uses its specific updater strategy
     * - Remove items that past 5 days after sellIn date 
     */
    updateQuality(): Item[] {
      this.items.forEach(item => {
        const updater = this.getUpdater(item);
        updater.update(item);
      })

      //Remove the items that are 5 days past its sellIn date
      this.items = this.items.filter(item => item.sellIn >= -4);
      return this.getItems();
    }

    /**
     * Selects the correct updater class for an item.
     * Check for exact name match -> pattern match -> dafault(normal)
     */
    private getUpdater(item: Item): ItemUpdater{
      const lowerName = item.name.toLowerCase();

      //Lookup in the map object using key, for the fast lookup as average case Big O = O(1)
      const named = this.namedUpdaterMatcher.get(lowerName)
      if (named) return named;

      //No exact name matched check pattern match for organic items, eventually default match
      const entry = this.fallbackMatcher.find(u => u.matches(item.name));
      return entry!.updater;
    } 
  }


/**  
 * Implementation
 */

let items = [
    new Item("Apple", 10, 10),
    new Item("Banana", 7, 9),
    new Item("Strawberry", 5, 10),
    new Item("Cheddar Cheese", 10, 16),
    new Item("Instant Ramen", 0, 5),
    // this Organic item does not work properly yet
    new Item("Organic Avocado", 5, 16)
];


let storeInventory = new StoreInventory(items);

let days: number = 2;

for (let i = 0; i < days; i++) {
    console.log("Day " + i + "  ---------------------------------");

    //getItems to get the current inventory
    const currentItems = storeInventory.getItems();

    if(currentItems.length === 0){
      console.log("No data in inventory");
    } else {
      //table with headers
      console.table(
        currentItems.map(item => ({
          name: item.name,
          sellIn: item.sellIn,
          quality: item.quality,
        }))  
      );
    }
    console.log();
    storeInventory.updateQuality();
}


/**  
 * Unit Tests 
 */

 const { expect, use } = require('chai')
 const sinon = require('sinon') // for mocking
 const sinonChai = require('sinon-chai')
 
 use(sinonChai)
 
 const describe = (name: string, cb: Function) => {
   console.log(name);
   console.group();
   cb();
   console.groupEnd();
 }
 
 const it = (name: string, cb: Function) => {
   try {
     cb();
     console.log(`✅  ${name}`);
   } catch (e) {
     console.warn(`❌  ${name}`);
     console.error(e);
   }
 }

 //Refactoring Tests

 //helper functions to create item and inventory objects; update the day
 const createItem = (name: string, sellIn: number, quality:number ): Item => 
  new Item(name, sellIn, quality);

 const inventoryOfItems = (item: Item): StoreInventory => new StoreInventory([item]);

 const updateDay = (inventory: StoreInventory) => inventory.updateQuality();
 
 describe("All tests: Item", () => {
  /**
   * Test case: To check if the quality of the item decreases daily
   */
   it("should decrement quality daily", () => {

      //Arrange the setup, creates an item and inventory object
      const testInventory = inventoryOfItems(createItem("test", 10, 10));

      //Perform the action of updating a day
      updateDay(testInventory);

      //Verify the expected outcome
      expect(testInventory.getItems()[0].quality).to.equal(9);

   });

   /**
   * Test case: To check if the SellIn value of the item decreases daily
   */
   it("should decrement sellIn value daily", () => {

    const testInventory = inventoryOfItems(createItem("Apple", 10, 10));
    updateDay(testInventory);
    expect(testInventory.getItems()[0].sellIn).to.equal(9);

   });

   /**
   * Test case: To check if the quality of the Cheddar cheese increase daily
   */
   it("should increment Cheddar Cheese quality daily", () => {

     const testInventory = inventoryOfItems(createItem("Cheddar Cheese", 10, 10));
     updateDay(testInventory);
     expect(testInventory.getItems()[0].quality).to.equal(11);

   });


   /**
   * Test case: To check if once the sellIn date has passed, Quality degrades twice as fast
   */
   it("should decrease quality twice fast once sellIn date passed", () => {

     const testInventory = inventoryOfItems(createItem("Strawberry", 0, 10));
     updateDay(testInventory);
     expect(testInventory.getItems()[0].quality).to.equal(8);

   });

   /**
   * Test case: To check the quality of an item is never negative
   */
   it("quality of the item should never be negative", () => {

     const testInventory = inventoryOfItems(createItem("Strawberry", 0, 0));
     updateDay(testInventory);
     expect(testInventory.getItems()[0].quality).to.equal(0);

   });

   /**
   * Test case: To check quality of an item is never more than 25
   */
   it("quality of the item should never be more than 25", () => {

     const testInventory = inventoryOfItems(createItem("Cheddar Cheese", 8, 25));
     updateDay(testInventory);
     expect(testInventory.getItems()[0].quality).to.equal(25);

   });

   /**
   * Test case: To check "Cheddar Cheese" actually increases in Quality the older it gets
   */
   it("increases cheddar cheese quality as it gets older", () => {

     const testInventory = inventoryOfItems(createItem("Cheddar Cheese", 10, 10));
     updateDay(testInventory);
     expect(testInventory.getItems()[0].quality).to.equal(11);

   });

   /**
   * Test case: To check "Cheddar Cheese" Quality increases twice fast after sellIn date
   */
   it("increases cheddar cheese quality twice as fast after sellIn date", () => {

     const testInventory = inventoryOfItems(createItem("Cheddar Cheese", 0, 10));
     updateDay(testInventory);
     expect(testInventory.getItems()[0].quality).to.equal(12);
   });

   /**
   * Test case: To check the sellIn value for "Instant Ramen" does not decreases 
   */
   it("does not decrease sellIn value for Instant Ramen", () => {

     const testInventory = inventoryOfItems(createItem("Instant Ramen", 1, 10));
     updateDay(testInventory); 
     expect(testInventory.getItems()[0].sellIn).to.equal(1);

   });

   /**
   * Test case: To check the quality for "Instant Ramen" does not decreases 
   */
   it("does not decrease quality for Instant Ramen", () => {

     const testInventory = inventoryOfItems(createItem("Instant Ramen", 1, 10));
     updateDay(testInventory);
     expect(testInventory.getItems()[0].quality).to.equal(10);

   });

   ///"Organic" Items Tests///

   /**
   * Test case: To check the "Organic" items degrade in Quality twice as fast as normal items
   */
   it("decreases organic items quality twice fast as normal items", () => {

     const testInventory = inventoryOfItems(createItem("Organic Apple", 10, 10));
     updateDay(testInventory); 
     expect(testInventory.getItems()[0].quality).to.equal(8);

   });

   /**
   * Test case: To check the "Organic" items degrade in Quality four times fast after sellIn date
   */
   it("decreases organic items quality four times fast after sellIn date", () => {

     const testInventory = inventoryOfItems(createItem("Organic Apple", 0, 10));
     updateDay(testInventory);
     expect(testInventory.getItems()[0].quality).to.equal(6);

   });

   ///Remove Item Tests///

   /**
   * Test case: To check the removal of item after 5 days of its sellIn date passed
   */
   it("removes item 5 days after the sellIn date", () => {

     const testInventory = inventoryOfItems(createItem("Apple", -4, 10));
     updateDay(testInventory);
     expect(testInventory.getItems().length).to.equal(0);

   });
 });
